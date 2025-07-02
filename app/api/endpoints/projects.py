from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional

from app.schemas import schemas
from app.schemas.job_schemas import JobStatus
from app.schemas.workflow_schemas import (
    WorkflowExecutionCreate, 
    WorkflowExecutionStatus, 
    WorkflowLaunchResponse,
    WorkflowOutputsResponse,
    TaskOutputSummary
)
from app.services import project_service, task_service, ai_service # Ajout de task_service et ai_service
from app.services import job_service, workflow_service, output_service
from app.db.config import get_db
from app.tasks.ai_tasks import planning_task, finishing_task
from app.tasks.orchestrator_tasks import full_article_workflow_task
from app.models.workflow_models import WorkflowType

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
    job_service.create_job_record(
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


# Endpoint asynchrone pour l'assemblage et le raffinage IA (Code Review Fix)
@router.post("/{project_id}/assemble-async", response_model=JobStatus, tags=["Projects", "AI Finishing Crew", "Async"])
async def assemble_and_refine_project_content_async(
    project_id: int,
    payload: AssemblePayloadBody,
    db: Session = Depends(get_db)
):
    """
    Version asynchrone de l'assemblage IA - Fix code review
    Retourne immédiatement un job_id pour suivre la progression
    """
    db_project = project_service.get_project(db, project_id=project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not payload.raw_content or not payload.raw_content.strip():
        raise HTTPException(status_code=400, detail="Raw content for assembly cannot be empty.")

    # Démarrer le job asynchrone
    job = finishing_task.delay(project_id, payload.raw_content)
    
    # Créer l'enregistrement en base de données
    job_service.create_job_record(
        db=db,
        job_id=job.id,
        job_type="finishing",
        project_id=project_id
    )
    
    return JobStatus(
        job_id=job.id,
        status="PENDING",
        job_type="finishing",
        progress=0.0,
        step="Démarrage du raffinage IA..."
    )


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


# ====== WORKFLOW ENDPOINTS (Phase 2.2) ======

@router.post("/{project_id}/workflows/generate-article", response_model=WorkflowLaunchResponse, tags=["Projects", "Workflows"])
async def launch_article_workflow(
    project_id: int,
    workflow_data: WorkflowExecutionCreate,
    db: Session = Depends(get_db)
):
    """
    Lance un workflow complet de génération d'article
    
    Orchestration: Planning → Research Parallèle → Assembly → Finishing
    """
    # Vérifier que le projet existe
    db_project = project_service.get_project(db, project_id=project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Valider que le project_id correspond
    if workflow_data.project_id != project_id:
        raise HTTPException(status_code=400, detail="Project ID mismatch in URL and body")
    
    try:
        # Créer l'exécution de workflow (pas encore commitée)
        workflow_execution = workflow_service.create_workflow_execution(
            db=db,
            project_id=project_id,
            workflow_type=WorkflowType.FULL_ARTICLE,
            metadata=workflow_data.options or {}
        )
        
        # Lancer le workflow orchestré
        workflow_job = full_article_workflow_task.delay(
            project_id, 
            workflow_execution.id
        )
        
        # Créer l'enregistrement job principal (pas encore commitée)
        job_service.create_job_record(
            db=db,
            job_id=workflow_job.id,
            job_type="full_article_workflow",
            project_id=project_id,
            workflow_execution_id=workflow_execution.id
        )
        
        # Committer toutes les opérations DB en une seule transaction
        db.commit()
        
        return WorkflowLaunchResponse(
            workflow_execution_id=workflow_execution.id,
            primary_job_id=workflow_job.id,
            estimated_duration=300,  # 5 minutes estimation
            message=f"Workflow de génération d'article lancé pour le projet {project_id}"
        )
        
    except Exception as e:
        db.rollback()  # Rollback sur échec
        raise HTTPException(
            status_code=500, 
            detail=f"Échec du lancement du workflow: {str(e)}"
        )


@router.get("/workflows/{workflow_id}/status", response_model=WorkflowExecutionStatus, tags=["Workflows"])
async def get_workflow_status(
    workflow_id: str,
    db: Session = Depends(get_db)
):
    """
    Récupère le statut détaillé d'un workflow avec progression
    """
    workflow = workflow_service.get_workflow_by_id(db, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Calculer la progression basée sur les jobs
    calculated_progress = workflow_service.calculate_workflow_progress(db, workflow_id)
    
    # Récupérer les jobs associés pour les statistiques
    workflow_jobs = workflow_service.get_workflow_jobs(db, workflow_id)
    
    # Compter les jobs par statut
    total_jobs = len(workflow_jobs)
    completed_jobs = len([j for j in workflow_jobs if j.status == "SUCCESS"])
    failed_jobs = len([j for j in workflow_jobs if j.status == "FAILURE"])
    
    return WorkflowExecutionStatus(
        id=workflow.id,
        project_id=workflow.project_id,
        workflow_type=workflow.workflow_type,
        status=workflow.status,
        current_step=workflow.current_step,
        progress_percentage=calculated_progress,
        started_at=workflow.started_at,
        completed_at=workflow.completed_at,
        updated_at=workflow.updated_at,
        error_details=workflow.error_details,
        metadata=workflow.metadata,
        total_jobs=total_jobs,
        completed_jobs=completed_jobs,
        failed_jobs=failed_jobs
    )


@router.get("/workflows/{workflow_id}/outputs", response_model=WorkflowOutputsResponse, tags=["Workflows"])
async def get_workflow_outputs(
    workflow_id: str,
    db: Session = Depends(get_db)
):
    """
    Récupère tous les outputs/résultats d'un workflow
    """
    workflow = workflow_service.get_workflow_by_id(db, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Récupérer tous les outputs du workflow
    raw_outputs = output_service.get_outputs_by_workflow(db, workflow_id)
    
    # Convertir en TaskOutputSummary (task déjà préchargé via joinedload)
    output_summaries = []
    for output in raw_outputs:
        summary = TaskOutputSummary(
            id=output.id,
            task_id=output.task_id,
            task_title=output.task.title if output.task else "Tâche système",
            output_type=output.output_type,
            content_preview=output.content[:200],
            word_count=output.metadata.get('word_count') if output.metadata else len(output.content.split()),
            created_at=output.created_at,
            metadata=output.metadata
        )
        output_summaries.append(summary)
    
    # Obtenir les statistiques
    stats = output_service.get_output_statistics(db, workflow_id=workflow_id)
    
    return WorkflowOutputsResponse(
        workflow_id=workflow_id,
        outputs=output_summaries,
        total_outputs=stats["total_outputs"],
        total_words=stats["total_words"],
        outputs_by_type=stats["outputs_by_type"]
    )
