"""
Tests d'intégration pour les endpoints Tasks
Tests les routes complètes avec base de données et validation des réponses
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.models import Project, Task


@pytest.mark.integration
@pytest.mark.requires_db
class TestTasksCRUD:
    """Tests des opérations CRUD sur les tâches"""

    def test_create_task_success(self, client: TestClient, sample_project: Project):
        """Test création d'une tâche valide"""
        task_data = {
            "project_id": sample_project.id,
            "title": "Nouvelle tâche",
            "description": "Description de la tâche",
            "status": "À faire",
            "order": 1
        }
        
        response = client.post("/api/v1/tasks/", json=task_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == task_data["title"]
        assert data["description"] == task_data["description"]
        assert data["status"] == task_data["status"]
        assert data["project_id"] == sample_project.id
        assert "id" in data
        assert "created_at" in data

    def test_create_task_missing_title(self, client: TestClient, sample_project: Project):
        """Test création tâche sans titre (doit échouer)"""
        task_data = {
            "project_id": sample_project.id,
            "description": "Description sans titre"
        }
        
        response = client.post("/api/v1/tasks/", json=task_data)
        
        assert response.status_code == 422

    def test_create_task_invalid_project(self, client: TestClient):
        """Test création tâche avec projet inexistant"""
        task_data = {
            "project_id": 99999,
            "title": "Tâche orpheline"
        }
        
        response = client.post("/api/v1/tasks/", json=task_data)
        
        # Le comportement dépend de l'implémentation du service
        # Peut être 404, 422 ou 500 selon comment c'est géré
        assert response.status_code in [404, 422, 500]

    def test_get_task_by_id_success(self, client: TestClient, sample_task: Task):
        """Test récupération tâche par ID valide"""
        response = client.get(f"/api/v1/tasks/{sample_task.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_task.id
        assert data["title"] == sample_task.title
        assert data["description"] == sample_task.description
        assert data["status"] == sample_task.status

    def test_get_task_by_id_not_found(self, client: TestClient):
        """Test récupération tâche inexistante"""
        response = client.get("/api/v1/tasks/99999")
        
        assert response.status_code == 404
        assert response.json()["detail"] == "Task not found"

    def test_update_task_success(self, client: TestClient, sample_task: Task):
        """Test mise à jour tâche valide"""
        update_data = {
            "title": "Tâche modifiée",
            "description": "Nouvelle description",
            "status": "En cours"
        }
        
        response = client.put(f"/api/v1/tasks/{sample_task.id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == update_data["title"]
        assert data["description"] == update_data["description"]
        assert data["status"] == update_data["status"]
        assert data["id"] == sample_task.id

    def test_update_task_partial(self, client: TestClient, sample_task: Task):
        """Test mise à jour partielle (seul le statut)"""
        update_data = {"status": "Terminé"}
        
        response = client.put(f"/api/v1/tasks/{sample_task.id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == update_data["status"]
        # Les autres champs doivent rester inchangés
        assert data["title"] == sample_task.title
        assert data["description"] == sample_task.description

    def test_update_task_not_found(self, client: TestClient):
        """Test mise à jour tâche inexistante"""
        update_data = {"title": "Test"}
        
        response = client.put("/api/v1/tasks/99999", json=update_data)
        
        assert response.status_code == 404

    def test_delete_task_success(self, client: TestClient, sample_task: Task):
        """Test suppression tâche valide"""
        response = client.delete(f"/api/v1/tasks/{sample_task.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_task.id
        
        # Vérifier que la tâche n'existe plus
        get_response = client.get(f"/api/v1/tasks/{sample_task.id}")
        assert get_response.status_code == 404

    def test_delete_task_not_found(self, client: TestClient):
        """Test suppression tâche inexistante"""
        response = client.delete("/api/v1/tasks/99999")
        
        assert response.status_code == 404


@pytest.mark.integration
@pytest.mark.requires_db
class TestTasksByProject:
    """Tests de récupération des tâches par projet"""

    def test_get_tasks_for_project_success(self, client: TestClient, sample_project: Project, multiple_tasks: list[Task]):
        """Test récupération tâches d'un projet existant"""
        response = client.get(f"/api/v1/tasks/project/{sample_project.id}")
        
        assert response.status_code == 200
        tasks = response.json()
        assert len(tasks) == len(multiple_tasks)
        
        # Vérifier que toutes les tâches appartiennent au bon projet
        for task in tasks:
            assert task["project_id"] == sample_project.id

    def test_get_tasks_for_empty_project(self, client: TestClient, sample_project: Project):
        """Test récupération tâches d'un projet sans tâches"""
        response = client.get(f"/api/v1/tasks/project/{sample_project.id}")
        
        assert response.status_code == 200
        assert response.json() == []

    def test_get_tasks_for_nonexistent_project(self, client: TestClient):
        """Test récupération tâches d'un projet inexistant"""
        response = client.get("/api/v1/tasks/project/99999")
        
        # Devrait retourner une liste vide plutôt qu'une erreur
        assert response.status_code == 200
        assert response.json() == []

    def test_get_tasks_with_pagination(self, client: TestClient, sample_project: Project, multiple_tasks: list[Task]):
        """Test pagination des tâches d'un projet"""
        # Test avec limit
        response = client.get(f"/api/v1/tasks/project/{sample_project.id}?limit=2")
        assert response.status_code == 200
        assert len(response.json()) == 2
        
        # Test avec skip
        response = client.get(f"/api/v1/tasks/project/{sample_project.id}?skip=1&limit=2")
        assert response.status_code == 200
        tasks = response.json()
        assert len(tasks) == 2


@pytest.mark.integration
@pytest.mark.requires_ai
class TestTasksAIEndpoints:
    """Tests des endpoints IA pour les tâches (avec mocking)"""

    def test_run_agent_missing_agent_type(self, client: TestClient, sample_task: Task):
        """Test exécution agent sans spécifier le type"""
        response = client.post(f"/api/v1/tasks/{sample_task.id}/run-agent", json={})
        
        assert response.status_code == 422

    def test_run_agent_invalid_agent_type(self, client: TestClient, sample_task: Task):
        """Test exécution agent avec type invalide"""
        response = client.post(
            f"/api/v1/tasks/{sample_task.id}/run-agent",
            json={"agent_type": "invalid_type"}
        )
        
        assert response.status_code == 422

    def test_run_agent_valid_types(self, client: TestClient, sample_task: Task):
        """Test que les types d'agents valides sont acceptés"""
        # Test avec researcher
        response = client.post(
            f"/api/v1/tasks/{sample_task.id}/run-agent",
            json={"agent_type": "researcher"}
        )
        # Devrait retourner 503 (service unavailable) car l'IA n'est pas configurée en test
        assert response.status_code == 503
        
        # Test avec writer
        response = client.post(
            f"/api/v1/tasks/{sample_task.id}/run-agent",
            json={"agent_type": "writer"}
        )
        assert response.status_code == 503

    def test_run_agent_with_context(self, client: TestClient, sample_task: Task):
        """Test exécution agent avec contexte"""
        response = client.post(
            f"/api/v1/tasks/{sample_task.id}/run-agent",
            json={
                "agent_type": "writer",
                "context": "Contexte spécifique pour la rédaction"
            }
        )
        
        # Devrait échouer avec 503 car l'IA n'est pas configurée
        assert response.status_code == 503

    def test_run_agent_task_not_found(self, client: TestClient):
        """Test exécution agent sur tâche inexistante"""
        response = client.post(
            "/api/v1/tasks/99999/run-agent",
            json={"agent_type": "researcher"}
        )
        
        assert response.status_code == 404


@pytest.mark.integration
@pytest.mark.requires_db
class TestTasksValidation:
    """Tests de validation des données des tâches"""

    def test_task_status_validation(self, client: TestClient, sample_project: Project):
        """Test validation des statuts de tâches"""
        valid_statuses = ["À faire", "En cours", "Révision", "Terminé"]
        
        for status in valid_statuses:
            task_data = {
                "project_id": sample_project.id,
                "title": f"Tâche {status}",
                "status": status
            }
            
            response = client.post("/api/v1/tasks/", json=task_data)
            assert response.status_code == 201
            assert response.json()["status"] == status

    def test_task_order_validation(self, client: TestClient, sample_project: Project):
        """Test validation de l'ordre des tâches"""
        # Test avec ordre négatif
        task_data = {
            "project_id": sample_project.id,
            "title": "Tâche ordre négatif",
            "order": -1
        }
        
        response = client.post("/api/v1/tasks/", json=task_data)
        # Devrait passer car l'ordre négatif peut être valide
        assert response.status_code == 201

    def test_task_empty_title(self, client: TestClient, sample_project: Project):
        """Test création tâche avec titre vide"""
        task_data = {
            "project_id": sample_project.id,
            "title": ""
        }
        
        response = client.post("/api/v1/tasks/", json=task_data)
        
        assert response.status_code == 422

    def test_task_very_long_title(self, client: TestClient, sample_project: Project):
        """Test création tâche avec titre très long"""
        long_title = "x" * 1000
        task_data = {
            "project_id": sample_project.id,
            "title": long_title
        }
        
        response = client.post("/api/v1/tasks/", json=task_data)
        
        # Devrait passer ou échouer selon les contraintes
        assert response.status_code in [201, 422]