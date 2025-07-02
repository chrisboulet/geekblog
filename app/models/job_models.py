"""
Modèles pour le suivi des jobs asynchrones
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, JSON
from sqlalchemy.sql import func
from app.db.config import Base


class AsyncJob(Base):
    """
    Modèle pour tracker les jobs asynchrones dans la base de données
    Complète les informations stockées dans Redis par Celery
    """
    __tablename__ = "async_jobs"

    id = Column(String, primary_key=True)  # Celery task ID
    type = Column(String, nullable=False)  # Type de job: planning, research, writing, finishing
    status = Column(String, default="PENDING")  # PENDING, PROGRESS, SUCCESS, FAILURE, RETRY
    project_id = Column(Integer, nullable=True)  # ID du projet associé
    task_id = Column(Integer, nullable=True)  # ID de la tâche associée (pour research/writing)
    
    # Métadonnées du job
    step = Column(String, nullable=True)  # Étape actuelle
    progress = Column(Float, default=0.0)  # Progression 0-100
    status_message = Column(Text, nullable=True)  # Message de statut détaillé
    error_message = Column(Text, nullable=True)  # Message d'erreur si échec
    metadata = Column(JSON, nullable=True)  # Métadonnées additionnelles (configs, paramètres)
    
    # Progress tracking avancé
    estimated_duration = Column(Float, nullable=True)  # Durée estimée en secondes
    progress_history = Column(JSON, nullable=True)  # Historique des étapes avec timestamps
    
    # Horodatage
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Résultat (optionnel, peut être stocké dans Redis)
    result_summary = Column(Text, nullable=True)  # Résumé du résultat