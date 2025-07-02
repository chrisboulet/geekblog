"""
Service pour la gestion des jobs asynchrones
"""
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import Optional, List
from datetime import datetime, timedelta

from app.models.job_models import AsyncJob
from app.schemas.job_schemas import JobCreate
from app.celery_config import celery_app


class JobService:
    """Service pour gérer les jobs asynchrones"""
    
    @staticmethod
    def create_job_record(
        db: Session,
        job_id: str,
        job_type: str,
        project_id: Optional[int] = None,
        task_id: Optional[int] = None
    ) -> AsyncJob:
        """
        Créer un enregistrement de job en base de données
        """
        job = AsyncJob(
            id=job_id,
            type=job_type,
            status="PENDING",
            project_id=project_id,
            task_id=task_id,
            progress=0.0
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        return job
    
    @staticmethod
    def update_job_progress(
        db: Session,
        job_id: str,
        progress: float,
        step: Optional[str] = None,
        status: Optional[str] = None
    ) -> Optional[AsyncJob]:
        """
        Mettre à jour la progression d'un job
        """
        job = db.query(AsyncJob).filter(AsyncJob.id == job_id).first()
        if job:
            job.progress = progress
            if step:
                job.step = step
            if status:
                job.status = status
            job.updated_at = func.now()
            db.commit()
            db.refresh(job)
        return job
    
    @staticmethod
    def complete_job(
        db: Session,
        job_id: str,
        success: bool,
        result_summary: Optional[str] = None,
        error_message: Optional[str] = None
    ) -> Optional[AsyncJob]:
        """
        Marquer un job comme terminé
        """
        job = db.query(AsyncJob).filter(AsyncJob.id == job_id).first()
        if job:
            job.status = "SUCCESS" if success else "FAILURE"
            job.progress = 100.0 if success else job.progress
            job.completed_at = func.now()
            job.updated_at = func.now()
            
            if result_summary:
                job.result_summary = result_summary
            if error_message:
                job.error_message = error_message
                
            db.commit()
            db.refresh(job)
        return job
    
    @staticmethod
    def get_job(db: Session, job_id: str) -> Optional[AsyncJob]:
        """
        Récupérer un job par son ID
        """
        return db.query(AsyncJob).filter(AsyncJob.id == job_id).first()
    
    @staticmethod
    def get_jobs_by_project(
        db: Session,
        project_id: int,
        limit: int = 50
    ) -> List[AsyncJob]:
        """
        Récupérer tous les jobs d'un projet
        """
        return (
            db.query(AsyncJob)
            .filter(AsyncJob.project_id == project_id)
            .order_by(AsyncJob.created_at.desc())
            .limit(limit)
            .all()
        )
    
    @staticmethod
    def get_active_jobs(db: Session, limit: int = 100) -> List[AsyncJob]:
        """
        Récupérer tous les jobs actifs (non terminés)
        """
        active_statuses = ["PENDING", "PROGRESS", "RETRY"]
        return (
            db.query(AsyncJob)
            .filter(AsyncJob.status.in_(active_statuses))
            .order_by(AsyncJob.created_at.desc())
            .limit(limit)
            .all()
        )
    
    @staticmethod
    def cleanup_old_jobs(db: Session, days_old: int = 7) -> int:
        """
        Nettoyer les anciens jobs terminés
        """
        cutoff_date = datetime.now() - timedelta(days=days_old)
        deleted_count = (
            db.query(AsyncJob)
            .filter(
                AsyncJob.completed_at < cutoff_date,
                AsyncJob.status.in_(["SUCCESS", "FAILURE", "REVOKED"])
            )
            .delete()
        )
        db.commit()
        return deleted_count