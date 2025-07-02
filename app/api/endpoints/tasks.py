from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Literal

from app.schemas import schemas
from app.schemas.job_schemas import JobStatus
from app.services import task_service, ai_service # ai_service ajouté
from app.services import job_service
from app.services.exceptions import ProjectNotFoundException, TaskNotFoundException, InvalidTaskDataException
from app.db.config import get_db
from app.models import models
from app.tasks.ai_tasks import research_task, writing_task

router = APIRouter()

AgentType = Literal["researcher", "writer"]

@router.post("/", response_model=schemas.Task, status_code=201)
def create_task_endpoint(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    try:
        return task_service.create_task(db=db, task=task)
    except ProjectNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except InvalidTaskDataException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{task_id}", response_model=schemas.Task)
def read_task_endpoint(task_id: int, db: Session = Depends(get_db)):
    db_task = task_service.get_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

# Endpoint pour exécuter un agent IA sur une tâche
@router.post("/{task_id}/run-agent", response_model=schemas.Task, tags=["Tasks", "AI Agents"])
async def run_agent_on_task(
    task_id: int,
    agent_type: AgentType = Body(..., embed=True, description="Type d'agent à exécuter ('researcher' ou 'writer')."),
    context: Optional[str] = Body(None, embed=True, description="Contexte supplémentaire pour l'agent (par exemple, résultats d'une recherche précédente pour l'agent rédacteur). Si non fourni, la description actuelle de la tâche peut être utilisée comme contexte initial."),
    db: Session = Depends(get_db)
):
    db_task = task_service.get_task(db, task_id=task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    ai_result = ""
    task_title = db_task.title
    # Le contexte pour l'IA peut être le `context` fourni, ou la description existante de la tâche, ou une combinaison.
    # Pour l'instant, si `context` est fourni, il est prioritaire. Sinon, on utilise la description de la tâche.
    effective_context = context if context is not None else db_task.description

    try:
        if agent_type == "researcher":
            # Le chercheur utilise le titre de la tâche comme sujet principal,
            # et `effective_context` comme instructions/clarifications additionnelles.
            ai_result = ai_service.run_research_crew(task_title=task_title, research_context=effective_context)
        elif agent_type == "writer":
            # Le rédacteur utilise le titre de la tâche comme sujet à rédiger,
            # et `effective_context` comme matériel de base (par exemple, résultat d'une recherche).
            ai_result = ai_service.run_writing_crew(task_title=task_title, writing_context=effective_context)
        else:
            # Normalement impossible grâce à Literal, mais par sécurité :
            raise HTTPException(status_code=400, detail=f"Invalid agent type: {agent_type}")

    except EnvironmentError as e:
        raise HTTPException(status_code=503, detail=f"AI Service Unavailable: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI agent execution failed: {str(e)}")

    if not ai_result:
        # Si l'IA ne retourne rien, on peut soit lever une erreur, soit juste ne pas mettre à jour.
        # Pour l'instant, on ne met pas à jour la description si le résultat est vide.
        # On pourrait aussi changer le statut en "Erreur IA" ou quelque chose de similaire.
        # Ici, on va juste retourner la tâche sans la modifier si le résultat est vide, mais on la met quand même en révision.
        pass # ai_result est vide

    # Mettre à jour la tâche avec le résultat de l'IA et changer son statut
    task_update_data = schemas.TaskUpdate(
        description=ai_result if ai_result else db_task.description, # Garder l'ancienne description si l'IA ne retourne rien
        status="Révision" # Toujours passer en révision après une action IA
    )

    updated_task = task_service.update_task(db, task_id=task_id, task_update=task_update_data)
    if not updated_task:
        # Cela ne devrait pas arriver si get_task a réussi plus tôt, mais par sécurité :
        raise HTTPException(status_code=500, detail="Failed to update task after AI execution")

    return updated_task


# Endpoint asynchrone pour exécuter un agent IA sur une tâche (Phase 2.1 - Fix Anti-Pattern)
@router.post("/{task_id}/run-agent-async", response_model=JobStatus, tags=["Tasks", "AI Agents", "Async"])
async def run_agent_on_task_async(
    task_id: int,
    agent_type: AgentType = Body(..., embed=True, description="Type d'agent à exécuter ('researcher' ou 'writer')."),
    context: Optional[str] = Body(None, embed=True, description="Contexte supplémentaire pour l'agent."),
    db: Session = Depends(get_db)
):
    """
    Version asynchrone de l'exécution d'agents IA - Phase 2.1 Anti-Pattern Fix
    Dispatch direct vers les tâches spécialisées (plus de meta-task bloquante)
    Retourne immédiatement un job_id pour suivre la progression
    """
    db_task = task_service.get_task(db, task_id=task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Dispatch direct vers la tâche appropriée (élimine l'anti-pattern .get())
    if agent_type == "researcher":
        job = research_task.delay(task_id, db_task.title, context)
        job_type = "agent_researcher"
    elif agent_type == "writer":
        job = writing_task.delay(task_id, db_task.title, context)
        job_type = "agent_writer"
    else:
        raise HTTPException(status_code=400, detail=f"Invalid agent type: {agent_type}")
    
    # Estimation de durée basée sur le type d'agent
    estimated_duration = 60.0 if agent_type == "researcher" else 45.0  # en secondes
    
    # Métadonnées pour tracking
    metadata = {
        "agent_type": agent_type,
        "task_title": db_task.title,
        "context_provided": context is not None
    }
    
    # Créer l'enregistrement en base de données avec métadonnées enrichies
    job_service.create_job_record(
        db=db,
        job_id=job.id,
        job_type=job_type,
        task_id=task_id,
        metadata=metadata,
        estimated_duration=estimated_duration
    )
    
    return JobStatus(
        job_id=job.id,
        status="PENDING",
        job_type=job_type,
        progress=0.0,
        step=f"Démarrage de l'agent {agent_type}...",
        status_message=f"Initialisation de l'agent {agent_type} pour la tâche '{db_task.title}'",
        estimated_duration=estimated_duration,
        metadata=metadata
    )


# Endpoint pour récupérer les tâches d'un projet spécifique
@router.get("/project/{project_id}", response_model=List[schemas.Task])
def get_tasks_for_project_endpoint(project_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tasks = task_service.get_tasks_by_project(db, project_id=project_id, skip=skip, limit=limit)
    if not tasks:
        # Il est possible qu'un projet n'ait pas de tâches, donc ce n'est pas nécessairement une erreur 404
        # Cependant, si le projet lui-même n'existe pas, cela pourrait être géré en amont ou ici.
        # Pour l'instant, retourne une liste vide si aucune tâche n'est trouvée.
        return []
    return tasks


@router.put("/{task_id}", response_model=schemas.Task)
def update_task_endpoint(task_id: int, task: schemas.TaskUpdate, db: Session = Depends(get_db)):
    try:
        db_task = task_service.update_task(db, task_id=task_id, task_update=task)
        if db_task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        return db_task
    except ProjectNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except TaskNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except InvalidTaskDataException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{task_id}", response_model=schemas.Task)
def delete_task_endpoint(task_id: int, db: Session = Depends(get_db)):
    db_task = task_service.delete_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task
