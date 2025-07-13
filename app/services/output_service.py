"""
Service pour la gestion des outputs de tâches
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy.sql import func
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
import hashlib

from app.models.workflow_models import TaskOutput, TaskOutputType
from app.models.models import Task


def calculate_content_hash(content: str) -> str:
    """
    Calculer le hash SHA-256 d'un contenu pour déduplication
    """
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def save_task_output(
    db: Session,
    task_id: int,
    output_type: TaskOutputType,
    content: str,
    workflow_execution_id: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> TaskOutput:
    """
    Sauvegarder le résultat d'une tâche
    """
    # Calculer le hash du contenu
    content_hash = calculate_content_hash(content)

    # Vérifier si un output identique existe déjà
    existing = (
        db.query(TaskOutput)
        .filter(TaskOutput.task_id == task_id, TaskOutput.content_hash == content_hash)
        .first()
    )

    if existing:
        return existing

    # Enrichir les métadonnées
    enriched_metadata = metadata or {}
    enriched_metadata.update(
        {
            "word_count": len(content.split()),
            "character_count": len(content),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    )

    # Créer le nouvel output
    output = TaskOutput(
        task_id=task_id,
        workflow_execution_id=workflow_execution_id,
        output_type=output_type,
        content=content,
        content_hash=content_hash,
        metadata=enriched_metadata,
    )

    db.add(output)
    db.flush()  # Use flush to get the ID before transaction commit
    db.refresh(output)

    return output


def get_outputs_by_task(
    db: Session, task_id: int, output_type: Optional[TaskOutputType] = None
) -> List[TaskOutput]:
    """
    Récupérer tous les outputs d'une tâche
    """
    query = db.query(TaskOutput).filter(TaskOutput.task_id == task_id)

    if output_type:
        query = query.filter(TaskOutput.output_type == output_type)

    return query.order_by(TaskOutput.created_at.desc()).all()


def get_outputs_by_workflow(
    db: Session, workflow_id: str, output_type: Optional[TaskOutputType] = None
) -> List[TaskOutput]:
    """
    Récupérer tous les outputs d'un workflow
    """
    query = (
        db.query(TaskOutput)
        .options(joinedload(TaskOutput.task))
        .filter(TaskOutput.workflow_execution_id == workflow_id)
    )

    if output_type:
        query = query.filter(TaskOutput.output_type == output_type)

    return query.order_by(TaskOutput.created_at).all()


def get_latest_output(
    db: Session, task_id: int, output_type: Optional[TaskOutputType] = None
) -> Optional[TaskOutput]:
    """
    Récupérer le dernier output d'une tâche
    """
    query = db.query(TaskOutput).filter(TaskOutput.task_id == task_id)

    if output_type:
        query = query.filter(TaskOutput.output_type == output_type)

    return query.order_by(TaskOutput.created_at.desc()).first()


def merge_outputs_for_assembly(
    db: Session, task_ids: List[int], separator: str = "\n\n---\n\n"
) -> str:
    """
    Fusionner les outputs de plusieurs tâches pour l'assemblage
    """
    outputs = []

    for task_id in task_ids:
        latest_output = get_latest_output(
            db, task_id, output_type=TaskOutputType.RESEARCH
        )

        if latest_output:
            # Inclure le titre de la tâche comme en-tête
            task = db.query(Task).filter(Task.id == task_id).first()
            if task:
                section_header = f"# {task.title}\n\n"
                outputs.append(section_header + latest_output.content)
            else:
                outputs.append(latest_output.content)

    return separator.join(outputs)


def cleanup_old_outputs(
    db: Session, days_old: int = 30, keep_latest_per_task: bool = True
) -> int:
    """
    Nettoyer les anciens outputs
    """
    cutoff_date = datetime.utcnow() - timedelta(days=days_old)

    if keep_latest_per_task:
        # Sous-requête pour identifier les derniers outputs par tâche
        latest_outputs = (
            db.query(
                TaskOutput.task_id, func.max(TaskOutput.created_at).label("max_created")
            )
            .group_by(TaskOutput.task_id)
            .subquery()
        )

        # Supprimer seulement les outputs qui ne sont pas les derniers
        deleted_count = (
            db.query(TaskOutput)
            .filter(
                TaskOutput.created_at < cutoff_date,
                ~db.query(TaskOutput)
                .filter(
                    TaskOutput.task_id == latest_outputs.c.task_id,
                    TaskOutput.created_at == latest_outputs.c.max_created,
                )
                .exists(),
            )
            .delete(synchronize_session=False)
        )
    else:
        # Supprimer tous les outputs anciens
        deleted_count = (
            db.query(TaskOutput)
            .filter(TaskOutput.created_at < cutoff_date)
            .delete(synchronize_session=False)
        )

    db.commit()
    return deleted_count


def get_output_statistics(
    db: Session, workflow_id: Optional[str] = None, project_id: Optional[int] = None
) -> Dict[str, Any]:
    """
    Obtenir des statistiques sur les outputs
    """
    query = db.query(TaskOutput)

    if workflow_id:
        query = query.filter(TaskOutput.workflow_execution_id == workflow_id)
    elif project_id:
        query = query.join(Task).filter(Task.project_id == project_id)

    outputs = query.all()

    if not outputs:
        return {
            "total_outputs": 0,
            "total_words": 0,
            "average_words_per_output": 0,
            "outputs_by_type": {},
        }

    # Calculer les statistiques
    total_words = 0
    outputs_by_type = {}

    for output in outputs:
        # Compter les mots
        if output.metadata and "word_count" in output.metadata:
            total_words += output.metadata["word_count"]
        else:
            total_words += len(output.content.split())

        # Compter par type
        type_name = output.output_type.value
        outputs_by_type[type_name] = outputs_by_type.get(type_name, 0) + 1

    return {
        "total_outputs": len(outputs),
        "total_words": total_words,
        "average_words_per_output": total_words / len(outputs) if outputs else 0,
        "outputs_by_type": outputs_by_type,
        "latest_output": outputs[-1].created_at.isoformat() if outputs else None,
    }
