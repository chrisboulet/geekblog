"""
Modèles pour la gestion des workflows orchestrés
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import relationship
import enum
import uuid

from app.db.config import Base
from app.db.compat import JSON, DateTimeFunc, DateTimeType, get_enum_type, get_enum_check_constraint


class WorkflowType(str, enum.Enum):
    """Types de workflows supportés"""

    FULL_ARTICLE = "full_article"
    RESEARCH_ONLY = "research_only"
    WRITING_ONLY = "writing_only"
    CUSTOM = "custom"


class WorkflowStatus(str, enum.Enum):
    """Statuts possibles d'un workflow"""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TaskOutputType(str, enum.Enum):
    """Types de sorties de tâches"""

    RESEARCH = "research"
    WRITING = "writing"
    PLANNING = "planning"
    ASSEMBLY = "assembly"
    FINISHING = "finishing"


class WorkflowExecution(Base):
    """
    Modèle pour tracker l'exécution complète d'un workflow
    """

    __tablename__ = "workflow_executions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    workflow_type = Column(get_enum_type(WorkflowType), nullable=False)
    status = Column(
        get_enum_type(WorkflowStatus), default=WorkflowStatus.PENDING, nullable=False
    )

    # Progression du workflow
    current_step = Column(
        JSON, nullable=True
    )  # {"step_name": "research", "progress": 60}
    total_steps = Column(Integer, default=4)  # planning, research, assembly, finishing

    # Métadonnées et configuration
    workflow_metadata = Column(
        JSON, nullable=True
    )  # Options du workflow, paramètres, etc.

    # Horodatage
    started_at = Column(DateTimeType, server_default=DateTimeFunc)
    completed_at = Column(DateTimeType, nullable=True)
    updated_at = Column(DateTimeType, onupdate=DateTimeFunc)

    # Gestion d'erreurs
    error_details = Column(
        JSON, nullable=True
    )  # {"error": "...", "step": "...", "traceback": "..."}

    # Relations
    project = relationship("Project", backref="workflow_executions")
    async_jobs = relationship("AsyncJob", backref="workflow_execution")
    task_outputs = relationship("TaskOutput", backref="workflow_execution")

    # Index pour performances et contraintes SQLite
    __table_args__ = tuple(filter(None, [
        Index("idx_workflow_project_status", "project_id", "status"),
        Index("idx_workflow_started", "started_at"),
        # Contraintes CHECK pour SQLite (ignorées par PostgreSQL)
        get_enum_check_constraint("workflow_type", WorkflowType),
        get_enum_check_constraint("status", WorkflowStatus),
    ]))


class TaskOutput(Base):
    """
    Modèle pour stocker les résultats intermédiaires des tâches
    """

    __tablename__ = "task_outputs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    workflow_execution_id = Column(
        String, ForeignKey("workflow_executions.id"), nullable=True
    )

    output_type = Column(get_enum_type(TaskOutputType), nullable=False)
    content = Column(Text, nullable=False)
    content_hash = Column(String(64), nullable=True)  # SHA-256 pour déduplication

    # Métadonnées enrichies
    output_metadata = Column(JSON, nullable=True)
    # Exemples: {
    #   "source": "research_agent",
    #   "word_count": 1500,
    #   "processing_time": 45.2,
    #   "model_used": "groq-mixtral",
    #   "confidence_score": 0.85
    # }

    # Horodatage
    created_at = Column(DateTimeType, server_default=DateTimeFunc)

    # Relations
    task = relationship("Task", backref="outputs")

    # Index pour performances et contraintes SQLite
    __table_args__ = tuple(filter(None, [
        Index("idx_output_task_type", "task_id", "output_type"),
        Index("idx_output_workflow", "workflow_execution_id"),
        Index("idx_output_created", "created_at"),
        Index("idx_output_hash", "content_hash"),
        # Contraintes CHECK pour SQLite (ignorées par PostgreSQL)
        get_enum_check_constraint("output_type", TaskOutputType),
    ]))
