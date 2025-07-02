"""
Endpoints pour la gestion des jobs asynchrones
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import json

from app.db.config import get_db
from app.celery_config import celery_app
from app.models.job_models import AsyncJob
from app.schemas.job_schemas import JobStatus, JobCreate
from app.services.job_service import JobService
from app.tasks.ai_tasks import planning_task

router = APIRouter()


@router.get("/{job_id}/status", response_model=JobStatus, tags=["Jobs"])
def get_job_status(job_id: str, db: Session = Depends(get_db)):
    """
    Récupérer le statut d'un job asynchrone
    """
    try:
        # Récupérer les infos depuis Celery
        celery_result = celery_app.AsyncResult(job_id)
        
        # Récupérer les infos depuis la DB si disponibles
        db_job = db.query(AsyncJob).filter(AsyncJob.id == job_id).first()
        
        # Construire la réponse
        status_response = JobStatus(
            job_id=job_id,
            status=celery_result.status,
            result=celery_result.result if celery_result.ready() else None,
            progress=0,
            step="",
            error=None
        )
        
        # Ajouter les métadonnées depuis Celery si disponibles
        if celery_result.status == 'PROGRESS' and celery_result.result:
            meta = celery_result.result
            status_response.progress = meta.get('progress', 0)
            status_response.step = meta.get('step', '')
        elif celery_result.status == 'FAILURE':
            status_response.error = str(celery_result.result)
        
        # Compléter avec les infos DB si disponibles
        if db_job:
            status_response.progress = db_job.progress or status_response.progress
            status_response.step = db_job.step or status_response.step
            status_response.error = db_job.error_message or status_response.error
            status_response.created_at = db_job.created_at
            status_response.updated_at = db_job.updated_at
            status_response.job_type = db_job.type
        
        return status_response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération du statut: {str(e)}")


@router.get("/{job_id}/result", tags=["Jobs"])
def get_job_result(job_id: str):
    """
    Récupérer le résultat d'un job terminé
    """
    try:
        celery_result = celery_app.AsyncResult(job_id)
        
        if not celery_result.ready():
            raise HTTPException(status_code=400, detail="Job not yet completed")
        
        if celery_result.failed():
            raise HTTPException(status_code=500, detail=f"Job failed: {celery_result.result}")
        
        return {
            "job_id": job_id,
            "status": celery_result.status,
            "result": celery_result.result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération du résultat: {str(e)}")


@router.delete("/{job_id}", tags=["Jobs"])
def cancel_job(job_id: str, db: Session = Depends(get_db)):
    """
    Annuler un job en cours (si possible)
    """
    try:
        # Révoquer le job dans Celery
        celery_app.control.revoke(job_id, terminate=True)
        
        # Mettre à jour le statut en DB si le job existe
        db_job = db.query(AsyncJob).filter(AsyncJob.id == job_id).first()
        if db_job:
            db_job.status = "REVOKED"
            db_job.error_message = "Job cancelled by user"
            db.commit()
        
        return {
            "job_id": job_id,
            "message": "Job cancellation requested"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'annulation: {str(e)}")


@router.get("/", response_model=List[JobStatus], tags=["Jobs"])
def list_jobs(
    project_id: int = None,
    status: str = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Lister les jobs avec filtres optionnels
    """
    try:
        query = db.query(AsyncJob)
        
        if project_id:
            query = query.filter(AsyncJob.project_id == project_id)
        
        if status:
            query = query.filter(AsyncJob.status == status)
        
        jobs = query.order_by(AsyncJob.created_at.desc()).limit(limit).all()
        
        # Convertir en réponse avec statuts Celery optimisés (Fix N+1 queries)
        result = []
        final_statuses = {"SUCCESS", "FAILURE", "REVOKED"}
        
        for job in jobs:
            # Optimisation: interroger Celery seulement pour les jobs non-finaux
            status_from_celery = job.status
            result_from_celery = None
            
            # N'interroger Celery que si le job n'a pas de statut final en DB
            if job.status not in final_statuses:
                try:
                    celery_result = celery_app.AsyncResult(job.id)
                    status_from_celery = celery_result.status or job.status
                    if celery_result.ready():
                        result_from_celery = celery_result.result
                except Exception:
                    # En cas d'erreur Celery, utiliser les données DB
                    status_from_celery = job.status
            
            job_status = JobStatus(
                job_id=job.id,
                status=status_from_celery,
                job_type=job.type,
                progress=job.progress,
                step=job.step,
                error=job.error_message,
                created_at=job.created_at,
                updated_at=job.updated_at,
                result=result_from_celery
            )
            
            result.append(job_status)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des jobs: {str(e)}")


@router.post("/test", tags=["Jobs", "Development"])
def create_test_job():
    """
    Endpoint de test pour créer un job de démonstration
    Utile pour tester l'infrastructure async sans dépendre de l'IA
    """
    
    # Créer un job de test avec des données simulées
    job = planning_task.delay(
        project_id=1,
        project_goal="Test de l'infrastructure asynchrone"
    )
    
    return {
        "job_id": job.id,
        "message": "Job de test créé",
        "status": "PENDING"
    }