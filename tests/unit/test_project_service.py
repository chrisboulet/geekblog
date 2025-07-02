"""
Tests unitaires pour le service Project
Tests de la logique métier avec base de données mockée
"""
import pytest
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session

from app.services import project_service
from app.models.models import Project
from app.schemas.schemas import ProjectCreate, ProjectUpdate


@pytest.mark.unit
class TestProjectService:
    """Tests du service Project"""

    def test_create_project_success(self):
        """Test création projet avec données valides"""
        # Setup mocks
        mock_db = Mock(spec=Session)
        mock_project = Project(id=1, name="Test Project", description="Test Description")
        
        # Mock des opérations DB
        mock_db.add.return_value = None
        mock_db.commit.return_value = None
        mock_db.refresh.return_value = None
        
        # Mock du constructeur Project pour retourner notre mock
        with patch('app.services.project_service.Project', return_value=mock_project):
            project_data = ProjectCreate(name="Test Project", description="Test Description")
            result = project_service.create_project(mock_db, project_data)
        
        # Vérifications
        assert result == mock_project
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(mock_project)

    def test_get_project_success(self, sample_project: Project):
        """Test récupération projet existant"""
        mock_db = Mock(spec=Session)
        mock_db.query.return_value.filter.return_value.first.return_value = sample_project
        
        result = project_service.get_project(mock_db, sample_project.id)
        
        assert result == sample_project
        mock_db.query.assert_called_once_with(Project)

    def test_get_project_not_found(self):
        """Test récupération projet inexistant"""
        mock_db = Mock(spec=Session)
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        result = project_service.get_project(mock_db, 99999)
        
        assert result is None

    def test_get_projects_with_pagination(self):
        """Test récupération liste projets avec pagination"""
        mock_db = Mock(spec=Session)
        mock_projects = [
            Project(id=1, name="Project 1"),
            Project(id=2, name="Project 2")
        ]
        mock_db.query.return_value.offset.return_value.limit.return_value.all.return_value = mock_projects
        
        result = project_service.get_projects(mock_db, skip=0, limit=10)
        
        assert result == mock_projects
        mock_db.query.assert_called_once_with(Project)
        mock_db.query.return_value.offset.assert_called_once_with(0)
        mock_db.query.return_value.offset.return_value.limit.assert_called_once_with(10)

    def test_update_project_success(self, sample_project: Project):
        """Test mise à jour projet existant"""
        mock_db = Mock(spec=Session)
        mock_db.query.return_value.filter.return_value.first.return_value = sample_project
        
        update_data = ProjectUpdate(name="Updated Project", description="Updated Description")
        result = project_service.update_project(mock_db, sample_project.id, update_data)
        
        assert result == sample_project
        assert sample_project.name == "Updated Project"
        assert sample_project.description == "Updated Description"
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(sample_project)

    def test_update_project_not_found(self):
        """Test mise à jour projet inexistant"""
        mock_db = Mock(spec=Session)
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        update_data = ProjectUpdate(name="Updated Project")
        result = project_service.update_project(mock_db, 99999, update_data)
        
        assert result is None
        mock_db.commit.assert_not_called()

    def test_update_project_partial(self, sample_project: Project):
        """Test mise à jour partielle (seul le nom)"""
        mock_db = Mock(spec=Session)
        mock_db.query.return_value.filter.return_value.first.return_value = sample_project
        original_description = sample_project.description
        
        update_data = ProjectUpdate(name="New Name Only")
        result = project_service.update_project(mock_db, sample_project.id, update_data)
        
        assert result == sample_project
        assert sample_project.name == "New Name Only"
        # Description doit rester inchangée
        assert sample_project.description == original_description

    def test_delete_project_success(self, sample_project: Project):
        """Test suppression projet existant"""
        mock_db = Mock(spec=Session)
        mock_db.query.return_value.filter.return_value.first.return_value = sample_project
        
        result = project_service.delete_project(mock_db, sample_project.id)
        
        assert result == sample_project
        mock_db.delete.assert_called_once_with(sample_project)
        mock_db.commit.assert_called_once()

    def test_delete_project_not_found(self):
        """Test suppression projet inexistant"""
        mock_db = Mock(spec=Session)
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        result = project_service.delete_project(mock_db, 99999)
        
        assert result is None
        mock_db.delete.assert_not_called()
        mock_db.commit.assert_not_called()


@pytest.mark.unit
class TestProjectServiceValidation:
    """Tests de validation du service Project"""

    def test_create_project_minimal_data(self):
        """Test création projet avec données minimales"""
        mock_db = Mock(spec=Session)
        mock_project = Project(id=1, name="Minimal Project")
        
        with patch('app.services.project_service.Project', return_value=mock_project):
            project_data = ProjectCreate(name="Minimal Project")
            result = project_service.create_project(mock_db, project_data)
        
        assert result == mock_project
        assert result.name == "Minimal Project"

    def test_update_project_exclude_unset(self, sample_project: Project):
        """Test que les champs non définis ne sont pas mis à jour"""
        mock_db = Mock(spec=Session)
        mock_db.query.return_value.filter.return_value.first.return_value = sample_project
        original_name = sample_project.name
        
        # Mise à jour avec seulement la description
        update_data = ProjectUpdate(description="New Description Only")
        result = project_service.update_project(mock_db, sample_project.id, update_data)
        
        assert result == sample_project
        # Le nom doit rester inchangé
        assert sample_project.name == original_name
        assert sample_project.description == "New Description Only"


@pytest.mark.unit 
class TestProjectServiceErrorHandling:
    """Tests de gestion d'erreur du service Project"""

    def test_create_project_db_error(self):
        """Test gestion erreur base de données lors de la création"""
        mock_db = Mock(spec=Session)
        mock_db.commit.side_effect = Exception("Database error")
        
        with patch('app.services.project_service.Project'):
            project_data = ProjectCreate(name="Error Project")
            with pytest.raises(Exception, match="Database error"):
                project_service.create_project(mock_db, project_data)

    def test_update_project_db_error(self, sample_project: Project):
        """Test gestion erreur base de données lors de la mise à jour"""
        mock_db = Mock(spec=Session)
        mock_db.query.return_value.filter.return_value.first.return_value = sample_project
        mock_db.commit.side_effect = Exception("Update error")
        
        update_data = ProjectUpdate(name="Error Update")
        with pytest.raises(Exception, match="Update error"):
            project_service.update_project(mock_db, sample_project.id, update_data)

    def test_delete_project_db_error(self, sample_project: Project):
        """Test gestion erreur base de données lors de la suppression"""
        mock_db = Mock(spec=Session)
        mock_db.query.return_value.filter.return_value.first.return_value = sample_project
        mock_db.commit.side_effect = Exception("Delete error")
        
        with pytest.raises(Exception, match="Delete error"):
            project_service.delete_project(mock_db, sample_project.id)