"""
Service pour la gestion des workflows orchestrés
"""
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import json

from app.models.workflow_models import WorkflowExecution, WorkflowType, WorkflowStatus
from app.models.job_models import AsyncJob


def create_workflow_execution(
    db: Session,
    project_id: int,
    workflow_type: WorkflowType,
    metadata: Optional[Dict[str, Any]] = None
) -> WorkflowExecution:
    """
    Créer une nouvelle exécution de workflow
    """
    workflow = WorkflowExecution(
        project_id=project_id,
        workflow_type=workflow_type,
        status=WorkflowStatus.PENDING,
        metadata=metadata or {},
        current_step={
            "step_name": "initialization",
            "progress": 0
        }
    )
    db.add(workflow)
    db.flush()  # Use flush to get the ID before transaction commit
    db.refresh(workflow)
    return workflow


def update_workflow_status(
    db: Session,
    workflow_id: str,
    status: WorkflowStatus,
    current_step: Optional[Dict[str, Any]] = None,
    error_details: Optional[Dict[str, Any]] = None
) -> Optional[WorkflowExecution]:
    """
    Mettre à jour le statut d'un workflow
    """
    workflow = db.query(WorkflowExecution).filter(
        WorkflowExecution.id == workflow_id
    ).first()
    
    if workflow:
        workflow.status = status
        workflow.updated_at = func.now()
        
        if current_step:
            workflow.current_step = current_step
            
        if error_details:
            workflow.error_details = error_details
            
        if status == WorkflowStatus.COMPLETED:
            workflow.completed_at = func.now()
            
        db.flush()  # Let caller control transaction
        db.refresh(workflow)
        
    return workflow


def get_workflow_by_id(
    db: Session,
    workflow_id: str
) -> Optional[WorkflowExecution]:
    """
    Récupérer un workflow par son ID
    """
    return db.query(WorkflowExecution).filter(
        WorkflowExecution.id == workflow_id
    ).first()


def get_workflows_by_project(
    db: Session,
    project_id: int,
    status: Optional[WorkflowStatus] = None,
    limit: int = 50
) -> List[WorkflowExecution]:
    """
    Récupérer les workflows d'un projet
    """
    query = db.query(WorkflowExecution).filter(
        WorkflowExecution.project_id == project_id
    )
    
    if status:
        query = query.filter(WorkflowExecution.status == status)
        
    return query.order_by(
        WorkflowExecution.started_at.desc()
    ).limit(limit).all()


def mark_workflow_complete(
    db: Session,
    workflow_id: str,
    success: bool = True,
    error_details: Optional[Dict[str, Any]] = None
) -> Optional[WorkflowExecution]:
    """
    Marquer un workflow comme terminé
    """
    status = WorkflowStatus.COMPLETED if success else WorkflowStatus.FAILED
    
    workflow = update_workflow_status(
        db=db,
        workflow_id=workflow_id,
        status=status,
        current_step={
            "step_name": "completed" if success else "failed",
            "progress": 100
        },
        error_details=error_details
    )
    
    return workflow


def get_workflow_jobs(
    db: Session,
    workflow_id: str
) -> List[AsyncJob]:
    """
    Récupérer tous les jobs associés à un workflow
    """
    return db.query(AsyncJob).filter(
        AsyncJob.workflow_execution_id == workflow_id
    ).order_by(AsyncJob.created_at).all()


def get_active_workflows(
    db: Session,
    limit: int = 100
) -> List[WorkflowExecution]:
    """
    Récupérer les workflows actifs
    """
    return db.query(WorkflowExecution).filter(
        WorkflowExecution.status.in_([
            WorkflowStatus.PENDING,
            WorkflowStatus.RUNNING
        ])
    ).order_by(
        WorkflowExecution.started_at.desc()
    ).limit(limit).all()


def update_workflow_step(
    db: Session,
    workflow_id: str,
    step_name: str,
    progress: float,
    metadata: Optional[Dict[str, Any]] = None
) -> Optional[WorkflowExecution]:
    """
    Mettre à jour l'étape courante d'un workflow
    """
    current_step = {
        "step_name": step_name,
        "progress": progress,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    if metadata:
        current_step["metadata"] = metadata
    
    return update_workflow_status(
        db=db,
        workflow_id=workflow_id,
        status=WorkflowStatus.RUNNING,
        current_step=current_step
    )


def calculate_workflow_progress(
    db: Session,
    workflow_id: str
) -> float:
    """
    Calculer la progression globale d'un workflow basée sur ses jobs
    """
    jobs = get_workflow_jobs(db, workflow_id)
    
    if not jobs:
        return 0.0
        
    total_progress = sum(job.progress for job in jobs)
    return total_progress / len(jobs)