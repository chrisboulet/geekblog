"""
Service pour la gestion des templates de blog basés sur l'analyse du blog Boulet.
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.models.models import BlogTemplate, Project, Task
from app.schemas.schemas import BlogTemplateCreate, BlogTemplateUpdate, TemplateCustomization
from app.services.project_service import create_project


def get_templates(
    db: Session, 
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    tone: Optional[str] = None,
    active_only: bool = True
) -> List[BlogTemplate]:
    """
    Récupère les templates avec filtres optionnels.
    
    Args:
        db: Session de base de données
        category: Filtre par catégorie (Guide, Opinion, Analyse, etc.)
        difficulty: Filtre par difficulté (Facile, Moyen, Avancé)
        tone: Filtre par ton (Pratique, Personnel, Analytique)
        active_only: Seuls les templates actifs
    
    Returns:
        Liste des templates correspondant aux critères
    """
    query = db.query(BlogTemplate)
    
    if active_only:
        query = query.filter(BlogTemplate.is_active == True)
    
    if category:
        query = query.filter(BlogTemplate.category == category)
    
    if difficulty:
        query = query.filter(BlogTemplate.difficulty == difficulty)
    
    if tone:
        query = query.filter(BlogTemplate.tone == tone)
    
    return query.order_by(BlogTemplate.name).all()


def get_template_by_id(db: Session, template_id: int) -> Optional[BlogTemplate]:
    """
    Récupère un template par son ID.
    
    Args:
        db: Session de base de données
        template_id: ID du template
    
    Returns:
        Template trouvé ou None
    """
    return db.query(BlogTemplate).filter(
        and_(
            BlogTemplate.id == template_id,
            BlogTemplate.is_active == True
        )
    ).first()


def get_template_by_slug(db: Session, slug: str) -> Optional[BlogTemplate]:
    """
    Récupère un template par son slug.
    
    Args:
        db: Session de base de données
        slug: Slug unique du template
    
    Returns:
        Template trouvé ou None
    """
    return db.query(BlogTemplate).filter(
        and_(
            BlogTemplate.slug == slug,
            BlogTemplate.is_active == True
        )
    ).first()


def create_template(db: Session, template: BlogTemplateCreate) -> BlogTemplate:
    """
    Crée un nouveau template de blog.
    
    Args:
        db: Session de base de données
        template: Données du template à créer
    
    Returns:
        Template créé
    """
    db_template = BlogTemplate(**template.dict())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template


def update_template(
    db: Session, 
    template_id: int, 
    template_update: BlogTemplateUpdate
) -> Optional[BlogTemplate]:
    """
    Met à jour un template existant.
    
    Args:
        db: Session de base de données
        template_id: ID du template à modifier
        template_update: Nouvelles données du template
    
    Returns:
        Template mis à jour ou None si non trouvé
    """
    db_template = get_template_by_id(db, template_id)
    if not db_template:
        return None
    
    update_data = template_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_template, field, value)
    
    db.commit()
    db.refresh(db_template)
    return db_template


def deactivate_template(db: Session, template_id: int) -> Optional[BlogTemplate]:
    """
    Désactive un template (soft delete).
    
    Args:
        db: Session de base de données
        template_id: ID du template à désactiver
    
    Returns:
        Template désactivé ou None si non trouvé
    """
    db_template = get_template_by_id(db, template_id)
    if not db_template:
        return None
    
    db_template.is_active = False
    db.commit()
    db.refresh(db_template)
    return db_template


def create_project_from_template(
    db: Session,
    template_id: int,
    customization: TemplateCustomization
) -> Optional[Project]:
    """
    Crée un nouveau projet basé sur un template avec personnalisation.
    TRANSACTIONAL: Toute l'opération se fait dans une seule transaction.
    
    Args:
        db: Session de base de données
        template_id: ID du template à utiliser
        customization: Options de personnalisation
    
    Returns:
        Projet créé ou None si template non trouvé
    """
    template = get_template_by_id(db, template_id)
    if not template:
        return None
    
    try:
        # Création du projet avec nom personnalisé via project_service
        project_name = f"{customization.title} - {template.name}"
        project_description = f"Article créé avec le template '{template.name}' - {template.description}"
        
        # Utilisation du service projet pour création centralisée SANS commit
        from app.services.project_service import create_project
        from app.schemas.schemas import ProjectCreate
        project_data = ProjectCreate(name=project_name, description=project_description)
        db_project = create_project(db=db, project=project_data, commit=False)
        
        # Génération des tâches basées sur la structure du template
        tasks = _generate_tasks_from_template(template, customization)
        
        # Création des tâches
        for i, task_data in enumerate(tasks):
            task = Task(
                project_id=db_project.id,
                title=task_data["title"],
                description=task_data["description"],
                order=i + 1,
                status="À faire"
            )
            db.add(task)
        
        # Commit atomique de tout ou rien
        db.commit()
        db.refresh(db_project)
        return db_project
        
    except Exception as e:
        # Rollback complet en cas d'erreur
        db.rollback()
        raise e


# Strategy Pattern: Define a dictionary mapping slugs to their respective task generation functions
TASK_GENERATORS = {
    "guide-pratique-quebecois": "_generate_guide_pratique_tasks",
    "question-engagement": "_generate_question_engagement_tasks", 
    "comparaison-analyse": "_generate_comparaison_analyse_tasks",
    # Add other specific template generators here
}


def _generate_tasks_from_template(
    template: BlogTemplate, 
    customization: TemplateCustomization
) -> List[Dict[str, str]]:
    """
    Génère les tâches spécifiques selon le template et la personnalisation.
    
    Args:
        template: Template de blog
        customization: Options de personnalisation
    
    Returns:
        Liste des tâches à créer
    """
    structure = template.template_structure
    expressions = template.sample_expressions or {}
    
    # Sélection des expressions selon le niveau de localisation
    level_expressions = expressions.get(customization.localization_level, {})
    
    # Use Strategy Pattern to get the appropriate task generator
    generator_func_name = TASK_GENERATORS.get(template.slug)
    if generator_func_name:
        # Get the actual function by name
        generator_func = globals()[generator_func_name]
        tasks = generator_func(customization, level_expressions)
    else:
        # Generic fallback for templates without specific logic
        tasks = []
        for step in structure.get("steps", []):
            tasks.append({
                "title": step["title"],
                "description": step["description"]
            })
    
    return tasks


def _generate_guide_pratique_tasks(
    customization: TemplateCustomization,
    expressions: Dict[str, str]
) -> List[Dict[str, str]]:
    """Génère les tâches pour le template Guide Pratique."""
    opener = expressions.get("opener", "Voici comment")
    transition = expressions.get("transition", "Ensuite")
    closer = expressions.get("closer", "Au final")
    
    return [
        {
            "title": "1. Situation réelle - Hook engageant",
            "description": f"Commencer par: '{opener} {customization.title}...'\n\nDécrivez une situation concrète où votre lecteur se trouve. Utilisez un ton {customization.audience} et restez proche de la réalité quotidienne."
        },
        {
            "title": "2. Préparation - Ce qu'il faut savoir",
            "description": f"Expliquez ce dont le lecteur aura besoin avant de commencer.\n\nInclure: outils, prérequis, temps nécessaire.\nTon: pratique et rassurant pour niveau {customization.localization_level}."
        },
        {
            "title": "3. Étapes concrètes - Guide pas à pas",
            "description": f"Détaillez chaque étape avec '{transition}' entre les parties.\n\nStructure:\n- Première affaire: [étape 1]\n- Deuxième affaire: [étape 2]\n- Etc.\n\nRestez spécifique et actionnable."
        },
        {
            "title": "4. Pièges à éviter - Votre expérience",
            "description": f"Partagez les erreurs courantes: 'Attention à ça, ça m'est arrivé...'\n\nTon personnel et préventif. Utilisez votre expérience pour guider le lecteur."
        },
        {
            "title": "5. Résultat final - Conclusion pratique",
            "description": f"Terminer par: '{closer}, vous devriez avoir...'\n\nRésumez le résultat attendu et invitez aux commentaires: 'Écrivez-moi si vous avez des questions!'"
        }
    ]


def _generate_question_engagement_tasks(
    customization: TemplateCustomization,
    expressions: Dict[str, str]
) -> List[Dict[str, str]]:
    """Génère les tâches pour le template Question Engagement."""
    return [
        {
            "title": "1. Hook Question - Interpellation directe",
            "description": f"Commencer par une question sur {customization.theme}: 'Et vous, qu'est-ce que vous en pensez?'\n\nRendre la question personnelle et engageante pour votre audience {customization.audience}."
        },
        {
            "title": "2. Contexte actuel - 'En fait, voici ce qui se passe'",
            "description": "Expliquer la situation qui motive votre question.\n\nUtiliser 'En fait' pour introduire le contexte. Rester factuel mais accessible."
        },
        {
            "title": "3. Exploration - 'Du coup, ça soulève plusieurs questions'",
            "description": "Développer les différents angles du sujet.\n\nUtiliser 'Du coup' pour les transitions. Présenter plusieurs perspectives."
        },
        {
            "title": "4. Opinion personnelle - Votre position",
            "description": "Partager votre point de vue personnel sur la question.\n\nÊtre authentique et assumé dans votre position."
        },
        {
            "title": "5. Appel engagement - 'Écrivez-moi!'",
            "description": "Terminer par un appel direct aux commentaires.\n\n'Écrivez-moi vos expériences!' ou 'Qu'est-ce que vous en pensez?' - Encourager la discussion."
        }
    ]


def _generate_comparaison_analyse_tasks(
    customization: TemplateCustomization,
    expressions: Dict[str, str]
) -> List[Dict[str, str]]:
    """Génère les tâches pour le template Comparaison Analyse."""
    return [
        {
            "title": "1. Setup comparaison - Présentation équilibrée",
            "description": f"Introduire la comparaison sur {customization.theme}: 'Bon, on va regarder ça ensemble...'\n\nPrésenter les deux options de manière neutre."
        },
        {
            "title": "2. Option A - Forces et faiblesses",
            "description": "Analyser la première option en détail.\n\nStructure: avantages, inconvénients, cas d'usage. Rester objectif."
        },
        {
            "title": "3. Option B - Forces et faiblesses",
            "description": "Analyser la deuxième option avec la même structure.\n\nMaintenir l'équilibre dans l'analyse. Même niveau de détail."
        },
        {
            "title": "4. Verdict personnel - 'Voici ce que j'en pense'",
            "description": "Donner votre recommandation personnelle.\n\nAssumer votre choix avec des arguments concrets basés sur l'analyse."
        },
        {
            "title": "5. Recommandation contextuelle - 'Si j'étais vous'",
            "description": "Adapter la recommandation selon différents profils d'utilisateurs.\n\nPersonnaliser selon l'audience québécoise et le contexte local."
        }
    ]


def get_template_categories(db: Session) -> List[str]:
    """
    Récupère toutes les catégories de templates disponibles.
    
    Args:
        db: Session de base de données
    
    Returns:
        Liste des catégories uniques
    """
    categories = db.query(BlogTemplate.category).filter(
        BlogTemplate.is_active == True
    ).distinct().all()
    
    return [cat[0] for cat in categories if cat[0]]


def get_template_stats(db: Session) -> Dict[str, Any]:
    """
    Récupère les statistiques des templates.
    
    Args:
        db: Session de base de données
    
    Returns:
        Dictionnaire avec les statistiques
    """
    total_templates = db.query(BlogTemplate).filter(
        BlogTemplate.is_active == True
    ).count()
    
    categories = get_template_categories(db)
    
    difficulty_stats = {}
    for difficulty in ["Facile", "Moyen", "Avancé"]:
        count = db.query(BlogTemplate).filter(
            and_(
                BlogTemplate.difficulty == difficulty,
                BlogTemplate.is_active == True
            )
        ).count()
        difficulty_stats[difficulty] = count
    
    return {
        "total_templates": total_templates,
        "categories": categories,
        "difficulty_distribution": difficulty_stats,
        "boulet_style_templates": db.query(BlogTemplate).filter(
            and_(
                BlogTemplate.is_boulet_style == True,
                BlogTemplate.is_active == True
            )
        ).count()
    }