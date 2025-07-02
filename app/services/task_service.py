from sqlalchemy.orm import Session
from app.models import models
from app.schemas import schemas
from app.services.exceptions import ProjectNotFoundException, TaskNotFoundException, InvalidTaskDataException
from typing import List, Optional

def create_task(db: Session, task: schemas.TaskCreate) -> models.Task:
    # Vérifier si le projet associé existe
    db_project = db.query(models.Project).filter(models.Project.id == task.project_id).first()
    if not db_project:
        raise ProjectNotFoundException(task.project_id)

    db_task = models.Task(
        title=task.title,
        description=task.description,
        status=task.status,
        order=task.order,
        project_id=task.project_id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def get_task(db: Session, task_id: int) -> Optional[models.Task]:
    return db.query(models.Task).filter(models.Task.id == task_id).first()

def get_tasks_by_project(db: Session, project_id: int, skip: int = 0, limit: int = 1000) -> List[models.Task]:
    return db.query(models.Task).filter(models.Task.project_id == project_id).offset(skip).limit(limit).all()

def update_task(db: Session, task_id: int, task_update: schemas.TaskUpdate) -> Optional[models.Task]:
    db_task = get_task(db, task_id)
    if not db_task:
        return None

    update_data = task_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)

    # Si project_id est mis à jour, vérifier que le nouveau projet existe
    if 'project_id' in update_data:
        db_project = db.query(models.Project).filter(models.Project.id == update_data['project_id']).first()
        if not db_project:
            raise ProjectNotFoundException(update_data['project_id'])

    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int) -> Optional[models.Task]:
    db_task = get_task(db, task_id)
    if not db_task:
        return None
    db.delete(db_task)
    db.commit()
    return db_task
