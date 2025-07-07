"""
Tests unitaires pour les services de gestion avancée des projets.

Tests pour :
- Archivage/désarchivage
- Gestion des paramètres
- Duplication de projets
- Filtrage avancé
"""

import pytest
from datetime import datetime
from sqlalchemy.orm import Session

from app.models import models
from app.schemas import schemas
from app.services import project_service
from app.exceptions import (
    ProjectNotFound,
    ProjectAlreadyArchived,
    ProjectNotArchived,
    CannotDeleteArchivedProject
)


class TestProjectArchiving:
    """Tests pour l'archivage/désarchivage de projets"""
    
    def test_archive_project_success(self, db: Session, sample_project: models.Project):
        """Test d'archivage réussi d'un projet"""
        reason = "Projet terminé"
        
        # Archiver le projet
        archived_project = project_service.archive_project(
            db=db, 
            project_id=sample_project.id, 
            reason=reason
        )
        
        # Vérifications
        assert archived_project is not None
        assert archived_project.archived is True
        assert archived_project.archived_at is not None
        assert archived_project.settings is not None
        assert archived_project.settings.get('archive_reason') == reason
        
    def test_archive_nonexistent_project(self, db: Session):
        """Test d'archivage d'un projet inexistant"""
        with pytest.raises(ProjectNotFound):
            project_service.archive_project(db=db, project_id=999)
        
    def test_archive_already_archived_project(self, db: Session, archived_project: models.Project):
        """Test d'archivage d'un projet déjà archivé"""
        with pytest.raises(ProjectAlreadyArchived):
            project_service.archive_project(db=db, project_id=archived_project.id)
        
    def test_unarchive_project_success(self, db: Session, archived_project: models.Project):
        """Test de désarchivage réussi"""
        unarchived_project = project_service.unarchive_project(
            db=db, 
            project_id=archived_project.id
        )
        
        # Vérifications
        assert unarchived_project is not None
        assert unarchived_project.archived is False
        assert unarchived_project.archived_at is None
        
    def test_unarchive_active_project(self, db: Session, sample_project: models.Project):
        """Test de désarchivage d'un projet actif"""
        with pytest.raises(ProjectNotArchived):
            project_service.unarchive_project(db=db, project_id=sample_project.id)


class TestProjectSettings:
    """Tests pour la gestion des paramètres de projets"""
    
    def test_get_project_settings_empty(self, db: Session, sample_project: models.Project):
        """Test de récupération des paramètres d'un projet sans paramètres"""
        settings = project_service.get_project_settings(db=db, project_id=sample_project.id)
        assert settings == {}
        
    def test_update_project_settings_new(self, db: Session, sample_project: models.Project):
        """Test d'ajout de nouveaux paramètres"""
        new_settings = {
            "auto_archive_days": 30,
            "ai_model_preference": "gpt-4",
            "notification_enabled": True
        }
        
        updated_project = project_service.update_project_settings(
            db=db,
            project_id=sample_project.id,
            settings=new_settings
        )
        
        assert updated_project is not None
        assert updated_project.settings == new_settings
        
    def test_update_project_settings_merge(self, db: Session, project_with_settings: models.Project):
        """Test de fusion avec des paramètres existants"""
        additional_settings = {
            "custom_prompts": {"intro": "Commencez par..."},
            "notification_enabled": False  # Override existing
        }
        
        updated_project = project_service.update_project_settings(
            db=db,
            project_id=project_with_settings.id,
            settings=additional_settings
        )
        
        # Vérifier la fusion
        assert updated_project.settings["auto_archive_days"] == 30  # Preserved
        assert updated_project.settings["notification_enabled"] is False  # Updated
        assert updated_project.settings["custom_prompts"] == {"intro": "Commencez par..."}  # Added
        
    def test_get_settings_nonexistent_project(self, db: Session):
        """Test de récupération des paramètres d'un projet inexistant"""
        settings = project_service.get_project_settings(db=db, project_id=999)
        assert settings is None


class TestProjectDuplication:
    """Tests pour la duplication de projets"""
    
    def test_duplicate_project_default_name(self, db: Session, sample_project_with_tasks: models.Project):
        """Test de duplication avec nom par défaut"""
        duplicated_project = project_service.duplicate_project(
            db=db, 
            project_id=sample_project_with_tasks.id
        )
        
        # Vérifications du projet dupliqué
        assert duplicated_project is not None
        assert duplicated_project.id != sample_project_with_tasks.id
        assert duplicated_project.name == f"{sample_project_with_tasks.name} - Copie"
        assert duplicated_project.description == sample_project_with_tasks.description
        assert len(duplicated_project.tasks) == len(sample_project_with_tasks.tasks)
        
        # Vérifications des tâches dupliquées
        for i, task in enumerate(duplicated_project.tasks):
            original_task = sample_project_with_tasks.tasks[i]
            assert task.title == original_task.title
            assert task.description == original_task.description
            assert task.status == "À faire"  # Reset du statut
            assert task.project_id == duplicated_project.id
            
    def test_duplicate_project_custom_name(self, db: Session, sample_project: models.Project):
        """Test de duplication avec nom personnalisé"""
        custom_name = "Mon Projet Dupliqué"
        
        duplicated_project = project_service.duplicate_project(
            db=db,
            project_id=sample_project.id,
            new_name=custom_name
        )
        
        assert duplicated_project is not None
        assert duplicated_project.name == custom_name
        
    def test_duplicate_nonexistent_project(self, db: Session):
        """Test de duplication d'un projet inexistant"""
        result = project_service.duplicate_project(db=db, project_id=999)
        assert result is None


class TestProjectFiltering:
    """Tests pour le filtrage avancé des projets"""
    
    def test_get_projects_filtered_exclude_archived(
        self, 
        db: Session, 
        sample_project: models.Project,
        archived_project: models.Project
    ):
        """Test de filtrage excluant les projets archivés"""
        projects = project_service.get_projects_filtered(
            db=db,
            include_archived=False
        )
        
        project_ids = [p.id for p in projects]
        assert sample_project.id in project_ids
        assert archived_project.id not in project_ids
        
    def test_get_projects_filtered_include_archived(
        self,
        db: Session,
        sample_project: models.Project,
        archived_project: models.Project
    ):
        """Test de filtrage incluant les projets archivés"""
        projects = project_service.get_projects_filtered(
            db=db,
            include_archived=True
        )
        
        project_ids = [p.id for p in projects]
        assert sample_project.id in project_ids
        assert archived_project.id in project_ids
        
    def test_get_projects_filtered_by_tags(self, db: Session, project_with_tags: models.Project):
        """Test de filtrage par tags"""
        projects = project_service.get_projects_filtered(
            db=db,
            tags="blog"
        )
        
        assert len(projects) > 0
        assert project_with_tags.id in [p.id for p in projects]
        
    def test_get_projects_filtered_pagination(self, db: Session, multiple_projects: list):
        """Test de pagination"""
        # Premier batch
        first_batch = project_service.get_projects_filtered(
            db=db,
            skip=0,
            limit=2
        )
        
        # Deuxième batch
        second_batch = project_service.get_projects_filtered(
            db=db,
            skip=2,
            limit=2
        )
        
        assert len(first_batch) == 2
        assert len(second_batch) >= 1
        
        # Vérifier qu'il n'y a pas de doublons
        first_ids = {p.id for p in first_batch}
        second_ids = {p.id for p in second_batch}
        assert first_ids.isdisjoint(second_ids)


class TestProjectDeletionSafety:
    """Tests pour la sécurité de suppression"""
    
    def test_delete_archived_project_fails(self, db: Session, archived_project: models.Project):
        """Test que la suppression d'un projet archivé échoue"""
        with pytest.raises(CannotDeleteArchivedProject):
            project_service.delete_project(db=db, project_id=archived_project.id)
        
    def test_delete_active_project_success(self, db: Session, sample_project: models.Project):
        """Test que la suppression d'un projet actif fonctionne"""
        deleted_project = project_service.delete_project(db=db, project_id=sample_project.id)
        assert deleted_project is not None
        assert deleted_project.id == sample_project.id
        
        # Vérifier que le projet n'existe plus
        remaining_project = project_service.get_project(db=db, project_id=sample_project.id)
        assert remaining_project is None