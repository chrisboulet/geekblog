from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional

from app.schemas import schemas
from app.schemas.job_schemas import JobStatus
from app.services import project_service, task_service, ai_service # Ajout de task_service et ai_service
from app.services.job_service import JobService
from app.db.config import get_db
from app.tasks.ai_tasks import planning_task

router = APIRouter()

@router.post("/", response_model=schemas.Project, status_code=201)
def create_project_endpoint(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    return project_service.create_project(db=db, project=project)

@router.get("/", response_model=List[schemas.Project])
def read_projects_endpoint(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    projects = project_service.get_projects(db, skip=skip, limit=limit)
    return projects

@router.get("/{project_id}", response_model=schemas.Project)
def read_project_endpoint(project_id: int, db: Session = Depends(get_db)):
    db_project = project_service.get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

# Endpoint pour la planification IA (synchrone - version originale)
@router.post("/{project_id}/plan", response_model=schemas.Project, tags=["Projects", "AI Planning"])
async def plan_project_with_ai(
    project_id: int,
    project_goal: Optional[str] = Body(None, description="Objectif détaillé du projet pour guider la planification IA. Si non fourni, la description du projet sera utilisée."),
    db: Session = Depends(get_db)
):
    db_project = project_service.get_project(db, project_id=project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    goal_to_plan = project_goal if project_goal else db_project.description
    if not goal_to_plan:
        raise HTTPException(status_code=400, detail="Project goal or description is required for AI planning.")

    try:
        task_titles = ai_service.run_planning_crew(goal_to_plan)
    except EnvironmentError as e:
        # Capturer spécifiquement l'erreur de LLM non configuré
        raise HTTPException(status_code=503, detail=f"AI Service Unavailable: {e}")
    except Exception as e:
        # Autres erreurs potentielles du service IA
        raise HTTPException(status_code=500, detail=f"AI planning failed: {str(e)}")

    if not task_titles:
        # Ne rien faire si aucune tâche n'est retournée, ou retourner une réponse indiquant cela.
        # Pour l'instant, on retourne le projet tel quel.
        return db_project
        # Alternative: raise HTTPException(status_code=400, detail="AI planner did not return any tasks.")

    # Créer les tâches dans la base de données
    # On s'assure de ne pas dupliquer les tâches si elles existent déjà avec le même titre pour ce projet (optionnel)
    # Pour cette version, on les ajoute simplement.
    order_start = len(db_project.tasks) # Pour que les nouvelles tâches soient ajoutées à la fin
    for i, title in enumerate(task_titles):
        task_create_schema = schemas.TaskCreate(
            title=title,
            project_id=project_id,
            status="À faire", # Statut initial
            order=order_start + i
        )
        task_service.create_task(db=db, task=task_create_schema)

    # Rafraîchir l'objet projet pour inclure les nouvelles tâches
    db.refresh(db_project)
    return db_project


# Endpoint pour la planification IA (asynchrone - POC Phase 1.3)
@router.post("/{project_id}/plan-async", response_model=JobStatus, tags=["Projects", "AI Planning", "Async"])
async def plan_project_async(
    project_id: int,
    project_goal: Optional[str] = Body(None, description="Objectif détaillé du projet pour guider la planification IA. Si non fourni, la description du projet sera utilisée."),
    db: Session = Depends(get_db)
):
    """
    Version asynchrone de la planification IA - POC Phase 1.3
    Retourne immédiatement un job_id pour suivre la progression
    """
    db_project = project_service.get_project(db, project_id=project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    goal_to_plan = project_goal if project_goal else db_project.description
    if not goal_to_plan:
        raise HTTPException(status_code=400, detail="Project goal or description is required for AI planning.")

    # Démarrer le job asynchrone
    job = planning_task.delay(project_id, goal_to_plan)
    
    # Créer l'enregistrement en base de données
    JobService.create_job_record(
        db=db,
        job_id=job.id,
        job_type="planning",
        project_id=project_id
    )
    
    return JobStatus(
        job_id=job.id,
        status="PENDING",
        job_type="planning",
        progress=0.0,
        step="Démarrage de la planification IA..."
    )

# Endpoint pour l'assemblage et le raffinage IA
class AssemblePayloadBody(schemas.BaseModel): # Renommé pour éviter conflit avec un potentiel type AssemblePayload de l'API
    raw_content: str

@router.post("/{project_id}/assemble", response_model=str, tags=["Projects", "AI Finishing Crew"]) # Réponse est le texte raffiné
async def assemble_and_refine_project_content(
    project_id: int,
    payload: AssemblePayloadBody, # Utilisation du nom corrigé
    db: Session = Depends(get_db)
):
    db_project = project_service.get_project(db, project_id=project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not payload.raw_content or not payload.raw_content.strip():
        raise HTTPException(status_code=400, detail="Raw content for assembly cannot be empty.")

    try:
        refined_article = ai_service.run_finishing_crew(payload.raw_content)
    except EnvironmentError as e:
        raise HTTPException(status_code=503, detail=f"AI Service Unavailable: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI finishing crew failed: {str(e)}")

    if not refined_article:
        raise HTTPException(status_code=500, detail="AI finishing crew did not return any content.")

    # Optionnel: Sauvegarder l'article raffiné quelque part ?
    # Pour l'instant, on le retourne directement.
    # On pourrait créer une tâche spéciale "Article Final" ou un champ sur le projet.
    # db_project.final_content = refined_article
    # db.commit()

    return refined_article


@router.put("/{project_id}", response_model=schemas.Project)
def update_project_endpoint(project_id: int, project: schemas.ProjectUpdate, db: Session = Depends(get_db)):
    db_project = project_service.update_project(db, project_id=project_id, project_update=project)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

@router.delete("/{project_id}", response_model=schemas.Project)
def delete_project_endpoint(project_id: int, db: Session = Depends(get_db)):
    db_project = project_service.delete_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project
