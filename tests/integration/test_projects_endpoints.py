"""
Tests d'intégration pour les endpoints Projects
Tests les routes complètes avec base de données et validation des réponses
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.models import Project, Task


@pytest.mark.integration
@pytest.mark.requires_db
class TestProjectsCRUD:
    """Tests des opérations CRUD sur les projets"""

    def test_create_project_success(self, client: TestClient):
        """Test création d'un projet valide"""
        project_data = {
            "name": "Mon Nouveau Projet",
            "description": "Description détaillée du projet"
        }
        
        response = client.post("/api/v1/projects/", json=project_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == project_data["name"]
        assert data["description"] == project_data["description"]
        assert "id" in data
        assert "created_at" in data
        assert data["tasks"] == []

    def test_create_project_missing_name(self, client: TestClient):
        """Test création projet sans nom (doit échouer)"""
        project_data = {"description": "Description sans nom"}
        
        response = client.post("/api/v1/projects/", json=project_data)
        
        assert response.status_code == 422

    def test_get_projects_empty(self, client: TestClient):
        """Test récupération liste vide de projets"""
        response = client.get("/api/v1/projects/")
        
        assert response.status_code == 200
        assert response.json() == []

    def test_get_projects_with_data(self, client: TestClient, sample_project: Project):
        """Test récupération liste avec projets existants"""
        response = client.get("/api/v1/projects/")
        
        assert response.status_code == 200
        projects = response.json()
        assert len(projects) == 1
        assert projects[0]["id"] == sample_project.id
        assert projects[0]["name"] == sample_project.name

    def test_get_project_by_id_success(self, client: TestClient, sample_project: Project):
        """Test récupération projet par ID valide"""
        response = client.get(f"/api/v1/projects/{sample_project.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_project.id
        assert data["name"] == sample_project.name
        assert data["description"] == sample_project.description

    def test_get_project_by_id_not_found(self, client: TestClient):
        """Test récupération projet inexistant"""
        response = client.get("/api/v1/projects/99999")
        
        assert response.status_code == 404
        assert response.json()["detail"] == "Project not found"

    def test_update_project_success(self, client: TestClient, sample_project: Project):
        """Test mise à jour projet valide"""
        update_data = {
            "name": "Projet Modifié",
            "description": "Nouvelle description"
        }
        
        response = client.put(f"/api/v1/projects/{sample_project.id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["description"] == update_data["description"]
        assert data["id"] == sample_project.id

    def test_update_project_not_found(self, client: TestClient):
        """Test mise à jour projet inexistant"""
        update_data = {"name": "Test"}
        
        response = client.put("/api/v1/projects/99999", json=update_data)
        
        assert response.status_code == 404

    def test_delete_project_success(self, client: TestClient, sample_project: Project):
        """Test suppression projet valide"""
        response = client.delete(f"/api/v1/projects/{sample_project.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_project.id
        
        # Vérifier que le projet n'existe plus
        get_response = client.get(f"/api/v1/projects/{sample_project.id}")
        assert get_response.status_code == 404

    def test_delete_project_not_found(self, client: TestClient):
        """Test suppression projet inexistant"""
        response = client.delete("/api/v1/projects/99999")
        
        assert response.status_code == 404

    def test_project_with_tasks_included(self, client: TestClient, sample_project: Project, sample_task: Task):
        """Test que les tâches sont incluses dans la réponse projet"""
        response = client.get(f"/api/v1/projects/{sample_project.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["tasks"]) == 1
        assert data["tasks"][0]["id"] == sample_task.id
        assert data["tasks"][0]["title"] == sample_task.title


@pytest.mark.integration
@pytest.mark.requires_db
class TestProjectsPagination:
    """Tests de pagination des projets"""

    def test_get_projects_with_skip_limit(self, client: TestClient, db_session: Session):
        """Test pagination avec skip et limit"""
        # Créer plusieurs projets
        projects = []
        for i in range(5):
            project = Project(name=f"Project {i}", description=f"Description {i}")
            db_session.add(project)
            projects.append(project)
        db_session.commit()
        
        # Test avec limit
        response = client.get("/api/v1/projects/?limit=3")
        assert response.status_code == 200
        assert len(response.json()) == 3
        
        # Test avec skip
        response = client.get("/api/v1/projects/?skip=2&limit=2")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["name"] == "Project 2"


@pytest.mark.integration
@pytest.mark.requires_ai
class TestProjectsAIEndpoints:
    """Tests des endpoints IA (avec mocking)"""

    def test_plan_project_missing_goal_and_description(self, client: TestClient):
        """Test planification sans objectif ni description"""
        # Créer un projet sans description
        project_data = {"name": "Projet sans description"}
        create_response = client.post("/api/v1/projects/", json=project_data)
        project_id = create_response.json()["id"]
        
        response = client.post(f"/api/v1/projects/{project_id}/plan")
        
        assert response.status_code == 400
        assert "Project goal or description is required" in response.json()["detail"]

    def test_plan_project_not_found(self, client: TestClient):
        """Test planification sur projet inexistant"""
        response = client.post("/api/v1/projects/99999/plan")
        
        assert response.status_code == 404

    def test_assemble_project_missing_content(self, client: TestClient, sample_project: Project):
        """Test assemblage sans contenu"""
        response = client.post(
            f"/api/v1/projects/{sample_project.id}/assemble",
            json={"raw_content": ""}
        )
        
        assert response.status_code == 400
        assert "Raw content for assembly cannot be empty" in response.json()["detail"]

    def test_assemble_project_not_found(self, client: TestClient):
        """Test assemblage sur projet inexistant"""
        response = client.post(
            "/api/v1/projects/99999/assemble",
            json={"raw_content": "Test content"}
        )
        
        assert response.status_code == 404


@pytest.mark.integration
@pytest.mark.requires_db
class TestProjectsEdgeCases:
    """Tests des cas limites et validation"""

    def test_create_project_very_long_name(self, client: TestClient):
        """Test création avec nom très long"""
        long_name = "x" * 1000
        project_data = {"name": long_name}
        
        response = client.post("/api/v1/projects/", json=project_data)
        
        # Devrait passer ou échouer selon les contraintes DB
        # Ici on teste que l'API gère correctement
        assert response.status_code in [201, 422]

    def test_create_project_empty_name(self, client: TestClient):
        """Test création avec nom vide"""
        project_data = {"name": ""}
        
        response = client.post("/api/v1/projects/", json=project_data)
        
        assert response.status_code == 422

    def test_update_project_partial(self, client: TestClient, sample_project: Project):
        """Test mise à jour partielle (seul le nom)"""
        update_data = {"name": "Nouveau nom seulement"}
        
        response = client.put(f"/api/v1/projects/{sample_project.id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_data["name"]
        # Description doit rester inchangée
        assert data["description"] == sample_project.description