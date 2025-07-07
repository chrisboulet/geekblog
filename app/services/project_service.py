from sqlalchemy.orm import Session
from app.models import models
from app.schemas import schemas
from app.exceptions import (
    ProjectNotFound,
    ProjectAlreadyArchived,
    ProjectNotArchived,
    CannotDeleteArchivedProject
)
from typing import List, Optional, Dict, Any
from datetime import datetime

def create_project(db: Session, project: schemas.ProjectCreate) -> models.Project:
    db_project = models.Project(name=project.name, description=project.description)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def get_project(db: Session, project_id: int) -> Optional[models.Project]:
    return db.query(models.Project).filter(models.Project.id == project_id).first()

def get_projects(db: Session, skip: int = 0, limit: int = 100) -> List[models.Project]:
    return db.query(models.Project).offset(skip).limit(limit).all()

def update_project(db: Session, project_id: int, project_update: schemas.ProjectUpdate) -> Optional[models.Project]:
    db_project = get_project(db, project_id)
    if not db_project:
        return None

    update_data = project_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)

    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: int) -> Optional[models.Project]:
    """
    Supprime définitivement un projet et toutes ses tâches associées.
    
    Args:
        db: Session de base de données
        project_id: ID du projet à supprimer
    
    Returns:
        Project supprimé
        
    Raises:
        ProjectNotFound: Si le projet n'existe pas
        CannotDeleteArchivedProject: Si le projet est archivé
    """
    db_project = get_project(db, project_id)
    if not db_project:
        raise ProjectNotFound(project_id)
    
    # Vérification que le projet n'est pas archivé (sécurité)
    if db_project.archived:
        raise CannotDeleteArchivedProject(project_id)
    
    db.delete(db_project)
    db.commit()
    return db_project

# Nouvelles fonctions pour gestion avancée des projets

def archive_project(db: Session, project_id: int, reason: Optional[str] = None) -> models.Project:
    """
    Archive un projet au lieu de le supprimer définitivement.
    
    Args:
        db: Session de base de données
        project_id: ID du projet à archiver
        reason: Raison optionnelle de l'archivage
    
    Returns:
        Project archivé
        
    Raises:
        ProjectNotFound: Si le projet n'existe pas
        ProjectAlreadyArchived: Si le projet est déjà archivé
    """
    db_project = get_project(db, project_id)
    if not db_project:
        raise ProjectNotFound(project_id)
    
    if db_project.archived:
        raise ProjectAlreadyArchived(project_id)
    
    # Archivage du projet
    db_project.archived = True
    db_project.archived_at = datetime.utcnow()
    
    # Sauvegarde de la raison dans les settings si fournie
    if reason:
        current_settings = db_project.settings or {}
        current_settings['archive_reason'] = reason
        db_project.settings = current_settings
    
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def unarchive_project(db: Session, project_id: int) -> models.Project:
    """
    Désarchive un projet.
    
    Args:
        db: Session de base de données
        project_id: ID du projet à désarchiver
    
    Returns:
        Project désarchivé
        
    Raises:
        ProjectNotFound: Si le projet n'existe pas
        ProjectNotArchived: Si le projet n'est pas archivé
    """
    db_project = get_project(db, project_id)
    if not db_project:
        raise ProjectNotFound(project_id)
    
    if not db_project.archived:
        raise ProjectNotArchived(project_id)
    
    db_project.archived = False
    db_project.archived_at = None
    
    # Suppression de la raison d'archivage des settings
    if db_project.settings and 'archive_reason' in db_project.settings:
        del db_project.settings['archive_reason']
    
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def get_project_settings(db: Session, project_id: int) -> Dict[str, Any]:
    """
    Récupère les paramètres d'un projet.
    
    Args:
        db: Session de base de données
        project_id: ID du projet
    
    Returns:
        Dictionnaire des paramètres
        
    Raises:
        ProjectNotFound: Si le projet n'existe pas
    """
    db_project = get_project(db, project_id)
    if not db_project:
        raise ProjectNotFound(project_id)
    
    return db_project.settings or {}

def update_project_settings(db: Session, project_id: int, settings: Dict[str, Any]) -> models.Project:
    """
    Met à jour les paramètres d'un projet.
    
    Args:
        db: Session de base de données
        project_id: ID du projet
        settings: Nouveaux paramètres
    
    Returns:
        Project mis à jour
        
    Raises:
        ProjectNotFound: Si le projet n'existe pas
    """
    db_project = get_project(db, project_id)
    if not db_project:
        raise ProjectNotFound(project_id)
    
    # Fusion avec les paramètres existants
    current_settings = db_project.settings or {}
    current_settings.update(settings)
    db_project.settings = current_settings
    
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def duplicate_project(db: Session, project_id: int, new_name: Optional[str] = None) -> models.Project:
    """
    Duplique un projet avec toutes ses tâches.
    
    Args:
        db: Session de base de données
        project_id: ID du projet à dupliquer
        new_name: Nouveau nom (si None, ajoute "- Copie" au nom original)
    
    Returns:
        Nouveau projet dupliqué
        
    Raises:
        ProjectNotFound: Si le projet original n'existe pas
    """
    original_project = get_project(db, project_id)
    if not original_project:
        raise ProjectNotFound(project_id)
    
    # Génération du nouveau nom
    if not new_name:
        new_name = f"{original_project.name} - Copie"
    
    # Création du nouveau projet
    new_project = models.Project(
        name=new_name,
        description=original_project.description,
        settings=original_project.settings.copy() if original_project.settings else None,
        tags=original_project.tags
    )
    
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    # Duplication des tâches
    for task in original_project.tasks:
        new_task = models.Task(
            project_id=new_project.id,
            title=task.title,
            description=task.description,
            status="À faire",  # Reset du statut pour la copie
            order=task.order
        )
        db.add(new_task)
    
    db.commit()
    db.refresh(new_project)
    return new_project

def get_projects_filtered(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    include_archived: bool = False,
    tags: Optional[str] = None
) -> List[models.Project]:
    """
    Récupère les projets avec filtrage.
    
    Args:
        db: Session de base de données
        skip: Nombre de projets à ignorer
        limit: Limite de projets à retourner
        include_archived: Inclure les projets archivés
        tags: Tags à filtrer (CSV)
    
    Returns:
        Liste des projets filtrés
    """
    query = db.query(models.Project)
    
    # Filtrage par statut d'archivage
    if not include_archived:
        query = query.filter(models.Project.archived == False)
    
    # Filtrage par tags
    if tags:
        query = query.filter(models.Project.tags.contains(tags))
    
    return query.offset(skip).limit(limit).all()


def get_all_unique_tags(db: Session) -> List[str]:
    """
    Récupère tous les tags uniques utilisés dans les projets.
    
    Args:
        db: Session de base de données
    
    Returns:
        Liste des tags uniques triés alphabétiquement
    """
    all_tags = set()
    # Query all tags, filter out None, split, and add to set
    for project_tags_str in db.query(models.Project.tags).filter(models.Project.tags.isnot(None)).all():
        if project_tags_str[0]:  # project_tags_str is a tuple (tag_string,)
            for tag in project_tags_str[0].split(','):
                cleaned_tag = tag.strip()
                if cleaned_tag:  # Only add non-empty tags
                    all_tags.add(cleaned_tag)
    
    return sorted(list(all_tags))
