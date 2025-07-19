"""
Endpoints pour la gestion des jobs avec FastAPI BackgroundTasks
Remplacement de l'API Celery par le TaskManager
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.config import get_db
from app.core.task_manager import task_manager
from app.models.job_models import AsyncJob
from app.schemas.job_schemas import JobStatus
from app.tasks.ai_tasks_bg import planning_task_bg

router = APIRouter()


@router.get("/{job_id}/status", response_model=JobStatus, tags=["Jobs"])
async def get_job_status_bg(job_id: str, db: Session = Depends(get_db)):
    """
    Récupérer le statut d'un job asynchrone via TaskManager
    Version BackgroundTasks remplaçant Celery
    """
    try:
        # Récupérer les infos depuis TaskManager
        task_status = await task_manager.get_task_status(job_id)
        
        if not task_status:
            # Vérifier en base de données comme fallback
            db_job = db.query(AsyncJob).filter(AsyncJob.id == job_id).first()
            if not db_job:
                raise HTTPException(status_code=404, detail=f"Job {job_id} non trouvé")
                
            return JobStatus(
                job_id=job_id,
                status=db_job.status or "PENDING",
                result=None,
                progress=db_job.progress or 0,
                step=db_job.step or "",
                error=db_job.error_message,
            )

        # Construire la réponse depuis TaskManager
        status_response = JobStatus(
            job_id=job_id,
            status=task_status["status"],
            result=task_status.get("result"),
            progress=task_status.get("progress", 0),
            step=task_status.get("step", ""),
            error=task_status.get("error"),
        )

        # Ajouter les métadonnées supplémentaires si disponibles
        if task_status.get("metadata"):
            metadata = task_status["metadata"]
            if "status_message" in metadata:
                status_response.step = metadata["status_message"]

        return status_response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur récupération statut: {str(e)}")


@router.get("/{job_id}/result", tags=["Jobs"])
async def get_job_result_bg(job_id: str, db: Session = Depends(get_db)):
    """
    Récupérer le résultat d'un job terminé
    """
    try:
        task_status = await task_manager.get_task_status(job_id)
        
        if not task_status:
            raise HTTPException(status_code=404, detail=f"Job {job_id} non trouvé")
        
        if task_status["status"] == "FAILURE":
            raise HTTPException(
                status_code=500, detail=f"Job échoué: {task_status.get('error', 'Erreur inconnue')}"
            )
        
        if task_status["status"] != "SUCCESS":
            raise HTTPException(
                status_code=202, detail=f"Job en cours (statut: {task_status['status']})"
            )

        return {
            "job_id": job_id,
            "status": task_status["status"],
            "result": task_status.get("result"),
            "completed_at": task_status.get("completed_at"),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur récupération résultat: {str(e)}")


@router.delete("/{job_id}/cancel", tags=["Jobs"])
async def cancel_job_bg(job_id: str):
    """
    Annuler un job en cours d'exécution
    """
    try:
        cancelled = await task_manager.cancel_task(job_id)
        
        if not cancelled:
            # Vérifier si la tâche existe
            task_status = await task_manager.get_task_status(job_id)
            if not task_status:
                raise HTTPException(status_code=404, detail=f"Job {job_id} non trouvé")
            
            return {
                "job_id": job_id,
                "message": f"Job ne peut pas être annulé (statut: {task_status['status']})",
                "cancelled": False,
            }

        return {
            "job_id": job_id,
            "message": "Job annulé avec succès",
            "cancelled": True,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur annulation job: {str(e)}")


@router.get("/", response_model=List[JobStatus], tags=["Jobs"])
async def list_jobs_bg(
    limit: int = 50,
    status_filter: str = None,
    db: Session = Depends(get_db)
):
    """
    Lister tous les jobs avec filtrage optionnel
    """
    try:
        # Pour l'instant, on utilise la base de données comme source de vérité
        # Dans une future version, on pourrait indexer le TaskManager
        query = db.query(AsyncJob).order_by(AsyncJob.created_at.desc())
        
        if status_filter:
            query = query.filter(AsyncJob.status == status_filter.upper())
        
        jobs = query.limit(limit).all()
        
        job_statuses = []
        for job in jobs:
            # Essayer de récupérer le statut actuel depuis TaskManager
            task_status = await task_manager.get_task_status(job.id)
            
            if task_status:
                # Utiliser les données du TaskManager si disponibles
                job_status = JobStatus(
                    job_id=job.id,
                    status=task_status["status"],
                    result=task_status.get("result"),
                    progress=task_status.get("progress", 0),
                    step=task_status.get("step", ""),
                    error=task_status.get("error"),
                )
            else:
                # Fallback sur les données de la base
                job_status = JobStatus(
                    job_id=job.id,
                    status=job.status or "PENDING",
                    result=None,
                    progress=job.progress or 0,
                    step=job.step or "",
                    error=job.error_message,
                )
            
            job_statuses.append(job_status)
        
        return job_statuses

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur listage jobs: {str(e)}")


@router.post("/planning/start", tags=["Jobs", "Planning"])
async def start_planning_job_bg(
    project_id: int,
    project_goal: str,
    workflow_execution_id: str = None,
    db: Session = Depends(get_db),
):
    """
    Démarrer un job de planification avec BackgroundTasks
    """
    try:
        # Vérifier que le projet existe
        from app.services import project_service
        project = project_service.get_project(db, project_id)
        if not project:
            raise HTTPException(status_code=404, detail=f"Projet {project_id} non trouvé")

        # Lancer la tâche de planification
        task_result = await planning_task_bg.delay(
            project_id=project_id,
            project_goal=project_goal,
            workflow_execution_id=workflow_execution_id,
        )

        return {
            "job_id": task_result.task_id,
            "message": "Job de planification démarré",
            "project_id": project_id,
            "project_goal": project_goal[:100] + "..." if len(project_goal) > 100 else project_goal,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur démarrage planification: {str(e)}")


@router.get("/stats", tags=["Jobs"])
async def get_job_stats_bg(db: Session = Depends(get_db)):
    """
    Statistiques globales des jobs
    """
    try:
        # Récupérer les stats depuis la base de données
        total_jobs = db.query(AsyncJob).count()
        pending_jobs = db.query(AsyncJob).filter(AsyncJob.status == "PENDING").count()
        running_jobs = db.query(AsyncJob).filter(AsyncJob.status == "PROGRESS").count()
        completed_jobs = db.query(AsyncJob).filter(AsyncJob.status == "SUCCESS").count()
        failed_jobs = db.query(AsyncJob).filter(AsyncJob.status == "FAILURE").count()

        # Statistiques du TaskManager (tâches actives en mémoire)
        active_tasks = len(task_manager._running_tasks)
        total_tracked = len(task_manager._tasks)

        return {
            "database_stats": {
                "total_jobs": total_jobs,
                "pending": pending_jobs,
                "running": running_jobs,
                "completed": completed_jobs,
                "failed": failed_jobs,
            },
            "task_manager_stats": {
                "active_tasks": active_tasks,
                "total_tracked": total_tracked,
            },
            "system_status": "healthy" if active_tasks < 10 else "high_load",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur récupération stats: {str(e)}")