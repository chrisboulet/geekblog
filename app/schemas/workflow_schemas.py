"""
Schémas Pydantic pour les workflows orchestrés
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class WorkflowTypeEnum(str, Enum):
    FULL_ARTICLE = "full_article"
    RESEARCH_ONLY = "research_only"
    WRITING_ONLY = "writing_only"
    CUSTOM = "custom"


class WorkflowStatusEnum(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TaskOutputTypeEnum(str, Enum):
    RESEARCH = "research"
    WRITING = "writing"
    PLANNING = "planning"
    ASSEMBLY = "assembly"
    FINISHING = "finishing"


class WorkflowStep(BaseModel):
    """Étape courante d'un workflow"""
    step_name: str
    progress: float = Field(ge=0, le=100)
    timestamp: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None


class WorkflowExecutionCreate(BaseModel):
    """Création d'un nouveau workflow"""
    project_id: int
    workflow_type: WorkflowTypeEnum = WorkflowTypeEnum.FULL_ARTICLE
    options: Optional[Dict[str, Any]] = None
    
    class Config:
        schema_extra = {
            "example": {
                "project_id": 1,
                "workflow_type": "full_article",
                "options": {
                    "max_research_tasks": 10,
                    "parallel_batch_size": 5,
                    "include_finishing": True
                }
            }
        }


class WorkflowExecutionStatus(BaseModel):
    """Statut détaillé d'un workflow"""
    id: str
    project_id: int
    workflow_type: WorkflowTypeEnum
    status: WorkflowStatusEnum
    current_step: Optional[WorkflowStep] = None
    total_steps: int = 4
    progress_percentage: float = Field(ge=0, le=100)
    started_at: datetime
    completed_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    error_details: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    
    # Statistiques additionnelles
    total_jobs: Optional[int] = None
    completed_jobs: Optional[int] = None
    failed_jobs: Optional[int] = None
    
    class Config:
        from_attributes = True


class WorkflowExecutionSummary(BaseModel):
    """Résumé d'un workflow pour les listes"""
    id: str
    project_id: int
    workflow_type: WorkflowTypeEnum
    status: WorkflowStatusEnum
    progress_percentage: float
    started_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class TaskOutputCreate(BaseModel):
    """Création d'un output de tâche"""
    task_id: int
    output_type: TaskOutputTypeEnum
    content: str
    metadata: Optional[Dict[str, Any]] = None


class TaskOutputSummary(BaseModel):
    """Résumé d'un output de tâche"""
    id: str
    task_id: int
    task_title: Optional[str] = None
    output_type: TaskOutputTypeEnum
    content_preview: str = Field(max_length=200)
    word_count: Optional[int] = None
    created_at: datetime
    metadata: Optional[Dict[str, Any]] = None
    
    @validator('content_preview', pre=True)
    def truncate_content(cls, v, values):
        if isinstance(v, str) and len(v) > 200:
            return v[:197] + "..."
        return v
    
    class Config:
        from_attributes = True


class WorkflowJobTree(BaseModel):
    """Arbre des jobs d'un workflow"""
    job_id: str
    job_type: str
    status: str
    progress: float
    created_at: datetime
    children: List['WorkflowJobTree'] = []
    
    class Config:
        from_attributes = True


class WorkflowLaunchResponse(BaseModel):
    """Réponse au lancement d'un workflow"""
    workflow_execution_id: str
    primary_job_id: str
    estimated_duration: Optional[int] = Field(
        None, 
        description="Durée estimée en secondes"
    )
    message: str = "Workflow lancé avec succès"


class WorkflowOutputsResponse(BaseModel):
    """Réponse contenant les outputs d'un workflow"""
    workflow_id: str
    outputs: List[TaskOutputSummary]
    total_outputs: int
    total_words: int
    outputs_by_type: Dict[str, int]


class BatchJobStatus(BaseModel):
    """Statut d'un groupe de jobs (pour les recherches parallèles)"""
    total_jobs: int
    completed_jobs: int
    failed_jobs: int
    pending_jobs: int
    average_progress: float
    estimated_completion: Optional[datetime] = None


# Update forward references
WorkflowJobTree.model_rebuild()