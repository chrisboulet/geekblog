from pydantic import BaseModel
from typing import List, Optional
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

class Project(ProjectBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    tasks: List[Task] = []

    class Config:
        from_attributes = True
