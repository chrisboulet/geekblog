"""
Schémas Pydantic pour les jobs asynchrones
"""
from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import datetime


class JobCreate(BaseModel):
    """Données pour créer un nouveau job"""
    type: str
    project_id: Optional[int] = None
    task_id: Optional[int] = None


class JobStatus(BaseModel):
    """Statut d'un job asynchrone"""
    job_id: str
    status: str  # PENDING, PROGRESS, SUCCESS, FAILURE, RETRY, REVOKED
    job_type: Optional[str] = None
    progress: float = 0.0  # 0-100
    step: Optional[str] = None
    error: Optional[str] = None
    result: Optional[Any] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class JobResult(BaseModel):
    """Résultat d'un job terminé"""
    job_id: str
    status: str
    result: Any
    completed_at: Optional[datetime] = None


class JobSummary(BaseModel):
    """Résumé d'un job pour les listes"""
    job_id: str
    type: str
    status: str
    progress: float
    project_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True