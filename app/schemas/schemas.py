from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime

# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "À faire"
    order: Optional[int] = 0

class TaskCreate(TaskBase):
    project_id: int

class TaskUpdate(TaskBase):
    title: Optional[str] = None
    project_id: Optional[int] = None # Au cas où on voudrait changer le projet d'une tâche, peu probable

class Task(TaskBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Project Schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    name: Optional[str] = None
    tags: Optional[str] = None

# Nouveaux schémas pour gestion avancée des projets
class ProjectSettingsBase(BaseModel):
    """Paramètres configurables d'un projet"""
    auto_archive_days: Optional[int] = None
    ai_model_preference: Optional[str] = None
    notification_enabled: Optional[bool] = True
    custom_prompts: Optional[Dict[str, str]] = None

class ProjectSettingsUpdate(ProjectSettingsBase):
    pass

class ProjectSettings(ProjectSettingsBase):
    project_id: int
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ProjectArchive(BaseModel):
    """Schéma pour archivage de projet"""
    reason: Optional[str] = None
    
class ProjectWithExtensions(ProjectBase):
    """Project avec toutes les extensions"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    archived: bool = False
    archived_at: Optional[datetime] = None
    settings: Optional[Dict[str, Any]] = None
    tags: Optional[str] = None
    tasks: List[Task] = []

    class Config:
        from_attributes = True

# Maintien de la compatibilité avec le schéma Project existant
class Project(ProjectBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    tasks: List[Task] = []

    class Config:
        from_attributes = True

# Blog Template Schemas
class BlogTemplateBase(BaseModel):
    name: str
    slug: str
    description: str
    icon: str
    category: str
    difficulty: str
    estimated_duration: str
    target_audience: str
    tone: str
    localization_level: str = "moyen"
    is_boulet_style: bool = True
    template_structure: Dict[str, Any]
    sample_expressions: Optional[Dict[str, Any]] = None
    additional_metadata: Optional[Dict[str, Any]] = None
    is_active: bool = True

class BlogTemplateCreate(BlogTemplateBase):
    pass

class BlogTemplateUpdate(BlogTemplateBase):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    estimated_duration: Optional[str] = None
    target_audience: Optional[str] = None
    tone: Optional[str] = None
    template_structure: Optional[Dict[str, Any]] = None
    sample_expressions: Optional[Dict[str, Any]] = None
    additional_metadata: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class BlogTemplate(BlogTemplateBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Template customization schemas
class TemplateCustomization(BaseModel):
    """Options de personnalisation pour un template"""
    title: str
    theme: str
    localization_level: Literal["bas", "moyen", "élevé"] = "moyen"
    audience: Literal["québécois", "francophone", "international"] = "québécois"
    additional_instructions: Optional[str] = None

class ProjectFromTemplate(BaseModel):
    """Création de projet depuis un template"""
    template_id: int
    customization: TemplateCustomization
