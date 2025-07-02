"""
Schémas Pydantic pour les jobs asynchrones
"""
from pydantic import BaseModel, validator
from typing import Optional, Any, Dict, List
from datetime import datetime


class JobCreate(BaseModel):
    """Données pour créer un nouveau job"""
    type: str
    project_id: Optional[int] = None
    task_id: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None
    estimated_duration: Optional[float] = None


class ProgressStep(BaseModel):
    """Étape de progression avec timestamp"""
    step: str
    progress: float
    timestamp: datetime
    message: Optional[str] = None


class JobStatus(BaseModel):
    """Statut d'un job asynchrone avec tracking enrichi"""
    job_id: str
    status: str  # PENDING, PROGRESS, SUCCESS, FAILURE, RETRY, REVOKED
    job_type: Optional[str] = None
    progress: float = 0.0  # 0-100
    step: Optional[str] = None
    status_message: Optional[str] = None  # Message de statut détaillé
    error: Optional[str] = None
    result: Optional[Any] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    estimated_duration: Optional[float] = None  # Durée estimée en secondes
    progress_history: Optional[List[ProgressStep]] = None  # Historique des étapes
    metadata: Optional[Dict[str, Any]] = None

    @validator('progress')
    def validate_progress(cls, v):
        if v < 0 or v > 100:
            raise ValueError('Progress must be between 0 and 100')
        return v
    
    @validator('progress_history', pre=True)
    def validate_progress_history(cls, v):
        if v is None:
            return v
        if isinstance(v, list):
            # Convertir les dicts en ProgressStep si nécessaire
            result = []
            for item in v:
                if isinstance(item, dict):
                    # Parse timestamps strings si nécessaire
                    if 'timestamp' in item and isinstance(item['timestamp'], str):
                        try:
                            item['timestamp'] = datetime.fromisoformat(item['timestamp'])
                        except:
                            pass
                    result.append(item)
                else:
                    result.append(item)
            return result
        return v

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