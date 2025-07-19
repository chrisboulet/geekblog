"""
Endpoints pour la gestion des templates de blog.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict

from app.db.config import get_db
from app.dependencies import get_current_admin_user, User
from app.schemas.schemas import (
    BlogTemplate,
    BlogTemplateCreate,
    BlogTemplateUpdate,
    ProjectFromTemplate,
    Project,
)
from app.services import template_service

router = APIRouter()


@router.get("/", response_model=List[BlogTemplate])
def get_templates(
    category: Optional[str] = Query(None, description="Filtrer par catégorie"),
    difficulty: Optional[str] = Query(None, description="Filtrer par difficulté"),
    tone: Optional[str] = Query(None, description="Filtrer par ton"),
    active_only: bool = Query(True, description="Seuls les templates actifs"),
    db: Session = Depends(get_db),
):
    """
    Récupère la liste des templates disponibles avec filtres optionnels.

    - **category**: Guide, Opinion, Analyse, etc.
    - **difficulty**: Facile, Moyen, Avancé
    - **tone**: Pratique, Personnel, Analytique
    - **active_only**: Exclure les templates désactivés
    """
    return template_service.get_templates(
        db, category=category, difficulty=difficulty, tone=tone, active_only=active_only
    )


@router.get("/categories", response_model=List[str])
def get_template_categories(db: Session = Depends(get_db)):
    """
    Récupère la liste des catégories de templates disponibles.

    Utile pour créer des filtres dans l'interface.
    """
    return template_service.get_template_categories(db)


@router.get("/stats")
def get_template_stats(db: Session = Depends(get_db)):
    """
    Récupère les statistiques des templates.

    Retourne:
    - Nombre total de templates
    - Distribution par difficulté
    - Templates style Boulet
    - Catégories disponibles
    """
    return template_service.get_template_stats(db)


@router.get("/{template_id}", response_model=BlogTemplate)
def get_template(template_id: int, db: Session = Depends(get_db)):
    """
    Récupère un template spécifique par son ID.
    """
    template = template_service.get_template_by_id(db, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template non trouvé")
    return template


@router.get("/slug/{slug}", response_model=BlogTemplate)
def get_template_by_slug(slug: str, db: Session = Depends(get_db)):
    """
    Récupère un template par son slug unique.

    Utile pour les URLs propres dans l'interface.
    """
    template = template_service.get_template_by_slug(db, slug)
    if not template:
        raise HTTPException(status_code=404, detail="Template non trouvé")
    return template


@router.post("/", response_model=BlogTemplate)
def create_template(
    template: BlogTemplateCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    """
    Crée un nouveau template de blog.

    Réservé aux administrateurs.
    """
    return template_service.create_template(db, template)


@router.put("/{template_id}", response_model=BlogTemplate)
def update_template(
    template_id: int,
    template_update: BlogTemplateUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    """
    Met à jour un template existant.

    Réservé aux administrateurs.
    """
    template = template_service.update_template(db, template_id, template_update)
    if not template:
        raise HTTPException(status_code=404, detail="Template non trouvé")
    return template


@router.delete("/{template_id}")
def deactivate_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    """
    Désactive un template (soft delete).

    Réservé aux administrateurs.
    """
    template = template_service.deactivate_template(db, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template non trouvé")
    return {"message": "Template désactivé avec succès"}


@router.post("/preview-tasks", response_model=List[Dict[str, str]])
def preview_template_tasks_endpoint(
    request: ProjectFromTemplate, db: Session = Depends(get_db)
):
    """
    Génère un aperçu des tâches qui seraient créées avec ce template et cette personnalisation.

    Permet de prévisualiser sans créer effectivement le projet.
    """
    template = template_service.get_template_by_id(db, request.template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template non trouvé")

    # Use the internal task generation function directly
    tasks = template_service._generate_tasks_from_template(
        template, request.customization
    )
    return tasks


@router.post("/projects/from-template", response_model=Project)
def create_project_from_template(
    request: ProjectFromTemplate, db: Session = Depends(get_db)
):
    """
    Crée un nouveau projet basé sur un template avec personnalisation.

    Le projet créé contiendra toutes les tâches pré-définies selon
    le template choisi et les options de personnalisation.
    """
    project = template_service.create_project_from_template(
        db, request.template_id, request.customization
    )
    if not project:
        raise HTTPException(status_code=404, detail="Template non trouvé")
    return project
