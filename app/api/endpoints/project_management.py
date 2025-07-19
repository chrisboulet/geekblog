"""
Endpoints pour la gestion avancée des projets.

Ce module contient les endpoints pour :
- Archivage/désarchivage de projets
- Gestion des paramètres de projets
- Duplication de projets
- Filtrage et recherche avancée
"""

from fastapi import APIRouter, Depends, HTTPException, Body, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.schemas import schemas
from app.services import project_service
from app.db.config import get_db
from app.exceptions import (
    ProjectNotFound,
    ProjectAlreadyArchived,
    ProjectNotArchived,
    CannotDeleteArchivedProject,
)

router = APIRouter()

# ====== ARCHIVAGE ET GESTION ======


@router.post(
    "/{project_id}/archive",
    response_model=schemas.ProjectWithExtensions,
    tags=["Project Management"],
)
def archive_project_endpoint(
    project_id: int,
    archive_data: schemas.ProjectArchive = Body(...),
    db: Session = Depends(get_db),
):
    """
    Archive un projet au lieu de le supprimer définitivement.

    L'archivage permet de masquer un projet tout en préservant ses données.
    """
    try:
        db_project = project_service.archive_project(
            db=db, project_id=project_id, reason=archive_data.reason
        )
        return db_project
    except ProjectNotFound:
        raise HTTPException(status_code=404, detail="Project not found")
    except ProjectAlreadyArchived:
        raise HTTPException(status_code=400, detail="Project is already archived")


@router.post(
    "/{project_id}/unarchive",
    response_model=schemas.ProjectWithExtensions,
    tags=["Project Management"],
)
def unarchive_project_endpoint(project_id: int, db: Session = Depends(get_db)):
    """
    Désarchive un projet pour le remettre en usage normal.
    """
    try:
        db_project = project_service.unarchive_project(db=db, project_id=project_id)
        return db_project
    except ProjectNotFound:
        raise HTTPException(status_code=404, detail="Project not found")
    except ProjectNotArchived:
        raise HTTPException(status_code=400, detail="Project is not archived")


@router.delete("/{project_id}", tags=["Project Management"])
def delete_project_endpoint(project_id: int, db: Session = Depends(get_db)):
    """
    Supprime définitivement un projet et toutes ses tâches.

    ⚠️ ATTENTION: Cette action est irréversible. Le projet archivé doit être désarchivé avant suppression.
    """
    try:
        db_project = project_service.delete_project(db=db, project_id=project_id)
        return {"message": f"Project {project_id} deleted successfully"}
    except ProjectNotFound:
        raise HTTPException(status_code=404, detail="Project not found")
    except CannotDeleteArchivedProject:
        raise HTTPException(
            status_code=400, detail="Cannot delete archived project. Unarchive first."
        )


# ====== PARAMÈTRES DE PROJET ======


@router.get(
    "/{project_id}/settings",
    response_model=schemas.ProjectSettings,
    tags=["Project Settings"],
)
def get_project_settings_endpoint(project_id: int, db: Session = Depends(get_db)):
    """
    Récupère les paramètres configurables d'un projet.
    """
    try:
        settings = project_service.get_project_settings(db=db, project_id=project_id)
        return schemas.ProjectSettings(
            project_id=project_id, updated_at=None, **settings
        )
    except ProjectNotFound:
        raise HTTPException(status_code=404, detail="Project not found")


@router.put(
    "/{project_id}/settings",
    response_model=schemas.ProjectWithExtensions,
    tags=["Project Settings"],
)
def update_project_settings_endpoint(
    project_id: int,
    settings: schemas.ProjectSettingsUpdate,
    db: Session = Depends(get_db),
):
    """
    Met à jour les paramètres d'un projet.

    Les paramètres sont fusionnés avec les existants.
    """
    try:
        settings_dict = settings.model_dump(exclude_unset=True)
        db_project = project_service.update_project_settings(
            db=db, project_id=project_id, settings=settings_dict
        )
        return db_project
    except ProjectNotFound:
        raise HTTPException(status_code=404, detail="Project not found")


# ====== DUPLICATION ======


class DuplicateProjectRequest(schemas.BaseModel):
    new_name: Optional[str] = None


@router.post(
    "/{project_id}/duplicate",
    response_model=schemas.ProjectWithExtensions,
    tags=["Project Management"],
)
def duplicate_project_endpoint(
    project_id: int,
    request: DuplicateProjectRequest = Body(...),
    db: Session = Depends(get_db),
):
    """
    Duplique un projet avec toutes ses tâches.

    Si aucun nom n'est fourni, ajoute "- Copie" au nom original.
    """
    try:
        db_project = project_service.duplicate_project(
            db=db, project_id=project_id, new_name=request.new_name
        )
        return db_project
    except ProjectNotFound:
        raise HTTPException(status_code=404, detail="Project not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Duplication failed: {str(e)}")


# ====== FILTRAGE ET RECHERCHE AVANCÉE ======


@router.get(
    "/filtered",
    response_model=List[schemas.ProjectWithExtensions],
    tags=["Project Search"],
)
def get_filtered_projects_endpoint(
    skip: int = Query(0, description="Nombre de projets à ignorer"),
    limit: int = Query(100, description="Limite de projets à retourner"),
    include_archived: bool = Query(False, description="Inclure les projets archivés"),
    tags: Optional[str] = Query(None, description="Filtrer par tags (CSV)"),
    db: Session = Depends(get_db),
):
    """
    Récupère les projets avec filtrage avancé.

    Permet de filtrer par statut d'archivage, tags, et avec pagination.
    """
    projects = project_service.get_projects_filtered(
        db=db, skip=skip, limit=limit, include_archived=include_archived, tags=tags
    )
    return projects


# ====== GESTION DES TAGS ======


@router.get("/tags", response_model=List[str], tags=["Project Tags"])
def get_all_project_tags_endpoint(db: Session = Depends(get_db)):
    """
    Récupère tous les tags utilisés dans les projets.

    Utile pour l'auto-complétion et les suggestions.
    """
    return project_service.get_all_unique_tags(db)


@router.put(
    "/{project_id}/tags",
    response_model=schemas.ProjectWithExtensions,
    tags=["Project Tags"],
)
def update_project_tags_endpoint(
    project_id: int,
    tags: List[str] = Body(..., description="Liste des tags à assigner"),
    db: Session = Depends(get_db),
):
    """
    Met à jour les tags d'un projet.

    Remplace complètement les tags existants.
    """
    tags_csv = ",".join(tags) if tags else None  # Use None for empty list to clear tags

    # Utiliser le service de mise à jour avec ProjectUpdate schema
    project_update_schema = schemas.ProjectUpdate(tags=tags_csv)

    try:
        db_project = project_service.update_project(
            db=db, project_id=project_id, project_update=project_update_schema
        )
        if db_project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        return db_project
    except ProjectNotFound:
        raise HTTPException(status_code=404, detail="Project not found")
