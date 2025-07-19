"""
Tests pour le système FastAPI BackgroundTasks
Validation de la migration depuis Celery
"""

import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch
from datetime import datetime, timezone

from app.core.task_manager import task_manager, BackgroundTaskManager, TaskStatus
from app.core.task_compat import (
    TaskCompatibilityMixin,
    chain,
    group,
    chord,
    create_compatible_task
)


class TestBackgroundTaskManager:
    """Tests pour le gestionnaire de tâches de base"""

    @pytest.fixture
    def manager(self):
        """Gestionnaire de tâches pour les tests"""
        return BackgroundTaskManager()

    @pytest.mark.asyncio
    async def test_submit_async_task(self, manager):
        """Test soumission d'une tâche asynchrone"""
        
        async def sample_task(value: int) -> int:
            await asyncio.sleep(0.1)
            return value * 2

        # Soumettre la tâche
        task_id = await manager.submit_task(sample_task, "test_async", 5)
        
        # Vérifier que l'ID est généré
        assert task_id is not None
        assert len(task_id) > 0

        # Attendre que la tâche se termine
        await asyncio.sleep(0.2)

        # Vérifier le statut
        status = await manager.get_task_status(task_id)
        assert status is not None
        assert status["status"] == TaskStatus.SUCCESS
        assert status["result"] == 10

    @pytest.mark.asyncio
    async def test_submit_sync_task(self, manager):
        """Test soumission d'une tâche synchrone"""
        
        def sample_sync_task(value: str) -> str:
            return value.upper()

        # Soumettre la tâche
        task_id = await manager.submit_task(sample_sync_task, "test_sync", "hello")
        
        # Attendre que la tâche se termine
        await asyncio.sleep(0.2)

        # Vérifier le résultat
        result = await manager.get_task_result(task_id)
        assert result == "HELLO"

    @pytest.mark.asyncio
    async def test_task_failure(self, manager):
        """Test gestion d'erreur dans une tâche"""
        
        async def failing_task():
            raise ValueError("Test error")

        # Soumettre la tâche qui échoue
        task_id = await manager.submit_task(failing_task, "test_failure")
        
        # Attendre que la tâche échoue
        await asyncio.sleep(0.2)

        # Vérifier le statut d'échec
        status = await manager.get_task_status(task_id)
        assert status["status"] == TaskStatus.FAILURE
        assert "Test error" in status["error"]

    @pytest.mark.asyncio
    async def test_task_cancellation(self, manager):
        """Test annulation d'une tâche"""
        
        async def long_task():
            await asyncio.sleep(10)  # Tâche longue
            return "completed"

        # Soumettre la tâche
        task_id = await manager.submit_task(long_task, "test_cancel")
        
        # Vérifier qu'elle est en cours
        await asyncio.sleep(0.1)
        status = await manager.get_task_status(task_id)
        assert status["status"] == TaskStatus.PROGRESS

        # Annuler la tâche
        cancelled = await manager.cancel_task(task_id)
        assert cancelled is True

        # Vérifier le statut d'annulation
        await asyncio.sleep(0.1)
        status = await manager.get_task_status(task_id)
        assert status["status"] == TaskStatus.REVOKED


class TestTaskCompatibility:
    """Tests pour la couche de compatibilité Celery"""

    @pytest.mark.asyncio
    async def test_compatibility_mixin(self):
        """Test du mixin de compatibilité"""
        
        task_id = "test-task-123"
        mixin = TaskCompatibilityMixin(task_id)
        
        # Vérifier les attributs
        assert mixin.task_id == task_id
        assert mixin.request.id == task_id

        # Test mise à jour de statut
        await mixin.update_state_with_db(
            state="PROGRESS",
            meta={"step": "Test step", "progress": 50}
        )

        # Vérifier que la tâche est trackée
        status = await task_manager.get_task_status(task_id)
        # Note: Dans un vrai test, il faudrait mocker task_manager

    @pytest.mark.asyncio
    async def test_create_compatible_task(self):
        """Test création de tâche compatible"""
        
        @create_compatible_task(name="test.task")
        async def sample_compatible_task(self, value: int) -> dict:
            await self.update_state_with_db(
                state="PROGRESS",
                meta={"step": "Processing", "progress": 50}
            )
            return {"result": value * 2, "success": True}

        # Vérifier que la tâche a les méthodes delay et apply_async
        assert hasattr(sample_compatible_task, 'delay')
        assert hasattr(sample_compatible_task, 'apply_async')


class TestWorkflowPrimitives:
    """Tests pour les primitives de workflow"""

    @pytest.mark.asyncio
    async def test_workflow_chain(self):
        """Test du workflow en chaîne"""
        
        async def task1(value=None):
            return 10

        async def task2(value):
            return value + 5

        async def task3(value):
            return value * 2

        # Créer la chaîne
        workflow = chain(task1, task2, task3)
        
        # Exécuter
        result = await workflow.apply_async()
        
        # Vérifier le résultat
        # (10 + 5) * 2 = 30
        # Note: Dans une implémentation complète, on vérifierait le résultat final

    @pytest.mark.asyncio 
    async def test_workflow_group(self):
        """Test du workflow en groupe (parallèle)"""
        
        async def task_a():
            await asyncio.sleep(0.1)
            return "A"

        async def task_b():
            await asyncio.sleep(0.1)
            return "B"

        async def task_c():
            await asyncio.sleep(0.1)
            return "C"

        # Créer le groupe
        workflow = group(task_a, task_b, task_c)
        
        # Mesurer le temps d'exécution
        start_time = asyncio.get_event_loop().time()
        result = await workflow.apply_async()
        end_time = asyncio.get_event_loop().time()

        # Vérifier que c'était en parallèle (< 0.2s au lieu de 0.3s)
        assert (end_time - start_time) < 0.2

    @pytest.mark.asyncio
    async def test_workflow_chord(self):
        """Test du workflow chord (groupe + callback)"""
        
        async def task_a():
            return 1

        async def task_b():
            return 2

        async def task_c():
            return 3

        async def callback_task(results):
            return sum(results)  # Somme des résultats

        # Créer le chord
        workflow = chord([task_a, task_b, task_c], callback_task)
        
        # Exécuter
        result = await workflow.apply_async()
        
        # Vérifier que le callback a été appelé avec les résultats du groupe
        # Note: Dans une implémentation complète, on vérifierait que le résultat = 6


class TestIntegration:
    """Tests d'intégration du système complet"""

    @pytest.mark.asyncio
    async def test_ai_task_simulation(self):
        """Test simulation d'une tâche IA complète"""
        
        # Mock des services
        with patch('app.services.ai_service') as mock_ai_service, \
             patch('app.services.project_service') as mock_project_service:
            
            # Configuration des mocks
            mock_project = Mock()
            mock_project.id = 1
            mock_project.description = "Test project"
            mock_project_service.get_project.return_value = mock_project
            
            mock_ai_service.llm = True  # LLM configuré
            mock_ai_service.run_planning_crew.return_value = ["Task 1", "Task 2", "Task 3"]

            @create_compatible_task(name="test.planning")
            async def mock_planning_task(self, project_id: int, goal: str) -> dict:
                # Simulation d'une tâche de planification
                await self.update_state_with_db(
                    state="PROGRESS",
                    meta={"step": "Planning", "progress": 50}
                )
                
                return {
                    "success": True,
                    "task_titles": ["Task 1", "Task 2"],
                    "created_count": 2
                }

            # Exécuter la tâche
            result = await mock_planning_task.delay(1, "Create a blog")
            
            # Vérifier le résultat
            # Note: Dans un test complet, on vérifierait le statut et le résultat

    @pytest.mark.asyncio
    async def test_task_manager_global_instance(self):
        """Test de l'instance globale du gestionnaire"""
        
        # Vérifier que l'instance globale existe
        assert task_manager is not None
        assert isinstance(task_manager, BackgroundTaskManager)

        # Test soumission via l'instance globale
        async def simple_task():
            return "global test"

        task_id = await task_manager.submit_task(simple_task, "global_test")
        
        # Attendre et vérifier
        await asyncio.sleep(0.1)
        status = await task_manager.get_task_status(task_id)
        assert status is not None
        assert status["result"] == "global test"


# Fixtures pour les tests d'intégration
@pytest.fixture
async def sample_db_session():
    """Mock d'une session de base de données"""
    with patch('app.db.config.SessionLocal') as mock_session:
        mock_db = Mock()
        mock_session.return_value.__enter__.return_value = mock_db
        mock_session.return_value.__exit__.return_value = None
        yield mock_db


# Tests de performance
class TestPerformance:
    """Tests de performance du système BackgroundTasks"""

    @pytest.mark.asyncio
    async def test_concurrent_tasks(self):
        """Test de multiples tâches concurrentes"""
        
        manager = BackgroundTaskManager()
        
        async def quick_task(task_num: int):
            await asyncio.sleep(0.01)  # Très rapide
            return f"task_{task_num}"

        # Lancer 10 tâches en parallèle
        task_ids = []
        for i in range(10):
            task_id = await manager.submit_task(quick_task, f"concurrent_{i}", i)
            task_ids.append(task_id)

        # Attendre que toutes se terminent
        await asyncio.sleep(0.5)

        # Vérifier que toutes ont réussi
        for i, task_id in enumerate(task_ids):
            status = await manager.get_task_status(task_id)
            assert status["status"] == TaskStatus.SUCCESS
            assert status["result"] == f"task_{i}"

    @pytest.mark.asyncio
    async def test_memory_cleanup(self):
        """Test que les tâches terminées libèrent la mémoire"""
        
        manager = BackgroundTaskManager()
        
        async def memory_task():
            return "done"

        # Lancer une tâche
        task_id = await manager.submit_task(memory_task, "memory_test")
        
        # Attendre qu'elle se termine
        await asyncio.sleep(0.1)
        
        # Vérifier qu'elle n'est plus dans les tâches en cours
        assert task_id not in manager._running_tasks
        
        # Mais qu'elle est toujours trackée pour les statuts
        assert task_id in manager._tasks