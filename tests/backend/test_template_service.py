"""
Tests pour le service de gestion des templates de blog.
"""

import pytest
from sqlalchemy.orm import Session

from app.models.models import BlogTemplate, Project, Task
from app.schemas.schemas import BlogTemplateCreate, BlogTemplateUpdate, TemplateCustomization
from app.services import template_service


class TestTemplateService:
    """Tests pour les opérations CRUD des templates."""
    
    def test_create_template(self, db_session: Session):
        """Test de création d'un template."""
        template_data = BlogTemplateCreate(
            name="Test Template",
            slug="test-template",
            description="Template de test",
            icon="🧪",
            category="Test",
            difficulty="Facile",
            estimated_duration="1h",
            target_audience="Testeurs",
            tone="Neutre",
            localization_level="moyen",
            is_boulet_style=True,
            template_structure={
                "steps": [
                    {"title": "Étape 1", "description": "Description 1"},
                    {"title": "Étape 2", "description": "Description 2"}
                ]
            },
            sample_expressions={
                "moyen": {
                    "opener": "Test opener",
                    "closer": "Test closer"
                }
            }
        )
        
        template = template_service.create_template(db_session, template_data)
        
        assert template.id is not None
        assert template.name == "Test Template"
        assert template.slug == "test-template"
        assert template.is_active is True
        assert len(template.template_structure["steps"]) == 2
    
    def test_get_template_by_id(self, db_session: Session, sample_template: BlogTemplate):
        """Test de récupération d'un template par ID."""
        template = template_service.get_template_by_id(db_session, sample_template.id)
        
        assert template is not None
        assert template.id == sample_template.id
        assert template.name == sample_template.name
    
    def test_get_template_by_slug(self, db_session: Session, sample_template: BlogTemplate):
        """Test de récupération d'un template par slug."""
        template = template_service.get_template_by_slug(db_session, sample_template.slug)
        
        assert template is not None
        assert template.slug == sample_template.slug
        assert template.name == sample_template.name
    
    def test_get_templates_with_filters(self, db_session: Session):
        """Test de récupération des templates avec filtres."""
        # Créer plusieurs templates
        templates_data = [
            ("Guide Test", "guide-test", "Guide", "Facile", "Pratique"),
            ("Analyse Test", "analyse-test", "Analyse", "Moyen", "Analytique"),
            ("Opinion Test", "opinion-test", "Opinion", "Facile", "Personnel"),
            ("Inactive Test", "inactive-test", "Guide", "Facile", "Pratique")
        ]
        
        for name, slug, category, difficulty, tone in templates_data:
            template = BlogTemplate(
                name=name,
                slug=slug,
                description=f"{name} description",
                icon="🧪",
                category=category,
                difficulty=difficulty,
                estimated_duration="1h",
                target_audience="Test",
                tone=tone,
                template_structure={"steps": []},
                is_active=(name != "Inactive Test")
            )
            db_session.add(template)
        db_session.commit()
        
        # Test filtre par catégorie
        guides = template_service.get_templates(db_session, category="Guide")
        assert len(guides) == 1  # Inactive est exclu par défaut
        assert guides[0].category == "Guide"
        
        # Test filtre par difficulté
        faciles = template_service.get_templates(db_session, difficulty="Facile")
        assert len(faciles) == 2
        assert all(t.difficulty == "Facile" for t in faciles)
        
        # Test filtre par ton
        analytiques = template_service.get_templates(db_session, tone="Analytique")
        assert len(analytiques) == 1
        assert analytiques[0].tone == "Analytique"
        
        # Test avec active_only=False
        all_templates = template_service.get_templates(db_session, active_only=False)
        assert len(all_templates) == 4
    
    def test_update_template(self, db_session: Session, sample_template: BlogTemplate):
        """Test de mise à jour d'un template."""
        update_data = BlogTemplateUpdate(
            name="Template Modifié",
            description="Description modifiée",
            difficulty="Moyen"
        )
        
        updated = template_service.update_template(
            db_session, 
            sample_template.id, 
            update_data
        )
        
        assert updated is not None
        assert updated.name == "Template Modifié"
        assert updated.description == "Description modifiée"
        assert updated.difficulty == "Moyen"
        assert updated.slug == sample_template.slug  # Non modifié
    
    def test_deactivate_template(self, db_session: Session, sample_template: BlogTemplate):
        """Test de désactivation d'un template."""
        deactivated = template_service.deactivate_template(db_session, sample_template.id)
        
        assert deactivated is not None
        assert deactivated.is_active is False
        
        # Vérifier qu'il n'apparaît plus dans la liste active
        active_templates = template_service.get_templates(db_session)
        assert sample_template.id not in [t.id for t in active_templates]
    
    def test_get_template_categories(self, db_session: Session):
        """Test de récupération des catégories."""
        # Créer des templates avec différentes catégories
        categories = ["Guide", "Analyse", "Opinion", "Guide"]  # Guide en double
        for i, cat in enumerate(categories):
            template = BlogTemplate(
                name=f"Template {i}",
                slug=f"template-{i}",
                description="Test",
                icon="🧪",
                category=cat,
                difficulty="Facile",
                estimated_duration="1h",
                target_audience="Test",
                tone="Neutre",
                template_structure={"steps": []}
            )
            db_session.add(template)
        db_session.commit()
        
        result = template_service.get_template_categories(db_session)
        
        assert len(result) == 3  # Pas de doublons
        assert set(result) == {"Guide", "Analyse", "Opinion"}
    
    def test_get_template_stats(self, db_session: Session):
        """Test des statistiques de templates."""
        # Créer des templates variés
        templates_data = [
            ("T1", "Facile", True),
            ("T2", "Facile", True),
            ("T3", "Moyen", True),
            ("T4", "Avancé", False),
            ("T5", "Moyen", True)
        ]
        
        for name, difficulty, is_boulet in templates_data:
            template = BlogTemplate(
                name=name,
                slug=name.lower(),
                description="Test",
                icon="🧪",
                category="Test",
                difficulty=difficulty,
                estimated_duration="1h",
                target_audience="Test",
                tone="Neutre",
                is_boulet_style=is_boulet,
                template_structure={"steps": []}
            )
            db_session.add(template)
        db_session.commit()
        
        stats = template_service.get_template_stats(db_session)
        
        assert stats["total_templates"] == 5
        assert stats["difficulty_distribution"]["Facile"] == 2
        assert stats["difficulty_distribution"]["Moyen"] == 2
        assert stats["difficulty_distribution"]["Avancé"] == 1
        assert stats["boulet_style_templates"] == 4


class TestProjectFromTemplate:
    """Tests pour la création de projets depuis templates."""
    
    def test_create_project_from_guide_pratique(self, db_session: Session):
        """Test de création depuis le template Guide Pratique."""
        # Créer le template Guide Pratique
        template = BlogTemplate(
            name="Guide Pratique Québécois",
            slug="guide-pratique-quebecois",
            description="Guide avec astuces",
            icon="💡",
            category="Guide",
            difficulty="Facile",
            estimated_duration="2-3h",
            target_audience="Débutants",
            tone="Pratique",
            template_structure={
                "steps": [
                    {"title": "Situation", "description": "Hook"},
                    {"title": "Préparation", "description": "Prérequis"},
                    {"title": "Étapes", "description": "Guide"},
                    {"title": "Pièges", "description": "Erreurs"},
                    {"title": "Résultat", "description": "Final"}
                ]
            },
            sample_expressions={
                "moyen": {
                    "opener": "OK, mettons que",
                    "transition": "Du coup",
                    "closer": "Au final"
                }
            }
        )
        db_session.add(template)
        db_session.commit()
        
        # Créer un projet depuis ce template
        customization = TemplateCustomization(
            title="Installer Linux sur un vieux PC",
            theme="Installation Linux",
            localization_level="moyen",
            audience="québécois"
        )
        
        project = template_service.create_project_from_template(
            db_session,
            template.id,
            customization
        )
        
        assert project is not None
        assert "Installer Linux sur un vieux PC" in project.name
        assert "Guide Pratique Québécois" in project.name
        
        # Vérifier les tâches créées
        tasks = db_session.query(Task).filter(Task.project_id == project.id).all()
        assert len(tasks) == 5
        
        # Vérifier le contenu des tâches
        first_task = tasks[0]
        assert "Situation réelle" in first_task.title
        assert "OK, mettons que" in first_task.description
        assert "Installer Linux sur un vieux PC" in first_task.description
    
    def test_create_project_from_question_engagement(self, db_session: Session):
        """Test de création depuis le template Question Engagement."""
        template = BlogTemplate(
            name="Question Engagement",
            slug="question-engagement",
            description="Question pour débat",
            icon="🤔",
            category="Opinion",
            difficulty="Facile",
            estimated_duration="1-2h",
            target_audience="Geeks",
            tone="Personnel",
            template_structure={"steps": []},
            sample_expressions={}
        )
        db_session.add(template)
        db_session.commit()
        
        customization = TemplateCustomization(
            title="L'IA va-t-elle remplacer les développeurs?",
            theme="Intelligence artificielle",
            localization_level="élevé",
            audience="québécois"
        )
        
        project = template_service.create_project_from_template(
            db_session,
            template.id,
            customization
        )
        
        assert project is not None
        tasks = db_session.query(Task).filter(Task.project_id == project.id).all()
        assert len(tasks) == 5
        
        # Vérifier que les tâches contiennent le bon thème
        for task in tasks:
            if "contexte" in task.title.lower():
                assert "Intelligence artificielle" in task.description
    
    def test_create_project_invalid_template(self, db_session: Session):
        """Test de création avec un template invalide."""
        customization = TemplateCustomization(
            title="Test",
            theme="Test",
            localization_level="moyen",
            audience="québécois"
        )
        
        project = template_service.create_project_from_template(
            db_session,
            999999,  # ID inexistant
            customization
        )
        
        assert project is None
    
    def test_create_project_with_custom_instructions(self, db_session: Session, sample_template: BlogTemplate):
        """Test avec instructions personnalisées."""
        customization = TemplateCustomization(
            title="Mon Article Test",
            theme="Technologie",
            localization_level="bas",
            audience="international",
            additional_instructions="Inclure des exemples de code Python"
        )
        
        project = template_service.create_project_from_template(
            db_session,
            sample_template.id,
            customization
        )
        
        assert project is not None
        # Les instructions supplémentaires devraient être prises en compte
        # dans la génération des tâches (à implémenter si nécessaire)


@pytest.fixture
def sample_template(db_session: Session) -> BlogTemplate:
    """Fixture pour créer un template de test."""
    template = BlogTemplate(
        name="Template Test",
        slug="template-test",
        description="Template pour les tests",
        icon="🧪",
        category="Test",
        difficulty="Facile",
        estimated_duration="1h",
        target_audience="Testeurs",
        tone="Neutre",
        localization_level="moyen",
        is_boulet_style=True,
        template_structure={
            "steps": [
                {"title": "Step 1", "description": "First step"},
                {"title": "Step 2", "description": "Second step"}
            ]
        },
        sample_expressions={
            "moyen": {"test": "expression"}
        },
        is_active=True
    )
    db_session.add(template)
    db_session.commit()
    db_session.refresh(template)
    return template