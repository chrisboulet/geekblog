"""
Service pour la gestion des jobs asynchrones
"""

from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta, timezone

from app.models.job_models import AsyncJob


def create_job_record(
    db: Session,
    job_id: str,
    job_type: str,
    project_id: Optional[int] = None,
    task_id: Optional[int] = None,
    metadata: Optional[Dict[str, Any]] = None,
    estimated_duration: Optional[float] = None,
) -> AsyncJob:
    """
    Créer un enregistrement de job en base de données avec métadonnées enrichies
    """
    job = AsyncJob(
        id=job_id,
        type=job_type,
        status="PENDING",
        project_id=project_id,
        task_id=task_id,
        progress=0.0,
        metadata=metadata,
        estimated_duration=estimated_duration,
        progress_history=[],
    )
    db.add(job)
    db.flush()  # Let caller control transaction
    db.refresh(job)
    return job


def update_job_progress(
    db: Session,
    job_id: str,
    progress: float,
    step: Optional[str] = None,
    status: Optional[str] = None,
    status_message: Optional[str] = None,
    add_to_history: bool = True,
) -> Optional[AsyncJob]:
    """
    Mettre à jour la progression d'un job avec historique enrichi
    """
    job = db.query(AsyncJob).filter(AsyncJob.id == job_id).first()
    if job:
        job.progress = progress
        if step:
            job.step = step
        if status:
            job.status = status
        if status_message:
            job.status_message = status_message

        # Ajouter à l'historique de progression
        if add_to_history and step:
            if job.progress_history is None:
                job.progress_history = []

            # Créer une nouvelle entrée d'historique
            history_entry = {
                "step": step,
                "progress": progress,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "message": status_message,
            }
            job.progress_history.append(history_entry)

        job.updated_at = func.now()
        db.flush()  # Let caller control transaction
        db.refresh(job)
    return job


def complete_job(
    db: Session,
    job_id: str,
    success: bool,
    result_summary: Optional[str] = None,
    error_message: Optional[str] = None,
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

        db.flush()  # Let caller control transaction
        db.refresh(job)
    return job


def get_job(db: Session, job_id: str) -> Optional[AsyncJob]:
    """
    Récupérer un job par son ID
    """
    return db.query(AsyncJob).filter(AsyncJob.id == job_id).first()


def get_jobs_by_project(
    db: Session, project_id: int, limit: int = 50
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


def cleanup_old_jobs(db: Session, days_old: int = 7) -> int:
    """
    Nettoyer les anciens jobs terminés avec transaction sécurisée
    """
    try:
        # Utiliser func.now() pour cohérence avec la timezone de la DB
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days_old)

        deleted_count = (
            db.query(AsyncJob)
            .filter(
                AsyncJob.completed_at < cutoff_date,
                AsyncJob.status.in_(["SUCCESS", "FAILURE", "REVOKED"]),
            )
            .delete(synchronize_session=False)
        )

        db.flush()  # Let caller control transaction
        return deleted_count
    except Exception as e:
        db.rollback()
        raise Exception(f"Erreur lors du nettoyage des jobs: {e}")
