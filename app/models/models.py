from sqlalchemy import Column, Integer, BigInteger, String, Text, ForeignKey, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.config import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Contenu final assemblé
    final_content = Column(Text, nullable=True)
    final_content_updated_at = Column(DateTime(timezone=True), nullable=True)
    
    # Extensions pour gestion avancée des projets
    archived = Column(Boolean, default=False, nullable=False)
    archived_at = Column(DateTime(timezone=True), nullable=True)
    settings = Column(JSON, nullable=True)
    tags = Column(String, nullable=True)  # Format CSV pour simplicité
    
    # Planification IA
    planning_status = Column(String, default="NOT_STARTED", nullable=False)  # NOT_STARTED|IN_PROGRESS|COMPLETED|FAILED
    planning_job_id = Column(String, nullable=True)  # Pour le suivi des jobs async

    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True) # Contenu de la tâche, éditable
    status = Column(String, default="À faire", nullable=False) # Ex: "À faire", "En cours", "Révision", "Terminé"
    order = Column(BigInteger, default=0) # Pour l'assemblage
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Suivi IA
    created_by_ai = Column(Boolean, default=False, nullable=False)
    last_updated_by_ai_at = Column(DateTime(timezone=True), nullable=True)

    project = relationship("Project", back_populates="tasks")


class BlogTemplate(Base):
    __tablename__ = "blog_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)  # Ex: "Guide Pratique Québécois"
    slug = Column(String, unique=True, nullable=False)  # Ex: "guide-pratique-quebecois"
    description = Column(Text, nullable=False)  # Description du template
    icon = Column(String, nullable=False)  # Emoji/icône pour l'interface
    
    # Classification du template
    category = Column(String, nullable=False)  # Ex: "Guide", "Opinion", "Analyse"
    difficulty = Column(String, nullable=False)  # "Facile", "Moyen", "Avancé"
    estimated_duration = Column(String, nullable=False)  # Ex: "2-3h"
    target_audience = Column(String, nullable=False)  # Ex: "Débutants pragmatiques"
    
    # Métadonnées spécifiques au style
    tone = Column(String, nullable=False)  # Ex: "Pratique", "Personnel", "Analytique"
    localization_level = Column(String, default="moyen")  # "bas", "moyen", "élevé"
    is_boulet_style = Column(Boolean, default=True)  # Basé sur analyse blog
    
    # Structure du template (JSON)
    template_structure = Column(JSON, nullable=False)  # Liste des étapes avec descriptions
    sample_expressions = Column(JSON, nullable=True)  # Expressions signature par niveau
    additional_metadata = Column(JSON, nullable=True)  # Informations supplémentaires
    
    # Audit trail
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)  # Pour désactiver sans supprimer
