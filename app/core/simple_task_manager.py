"""
TaskManager simplifié pour tests sans dépendances DB
Version autonome pour valider l'architecture BackgroundTasks
"""

import asyncio
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Callable, Coroutine
from enum import Enum


class TaskStatus(str, Enum):
    """Statuts des tâches de background"""
    PENDING = "PENDING"
    PROGRESS = "PROGRESS" 
    SUCCESS = "SUCCESS"
    FAILURE = "FAILURE"
    REVOKED = "REVOKED"


class SimpleTaskManager:
    """
    Gestionnaire de tâches simplifié sans DB pour tests
    """

    def __init__(self):
        self._tasks: Dict[str, Dict[str, Any]] = {}
        self._running_tasks: Dict[str, asyncio.Task] = {}

    def generate_task_id(self) -> str:
        """Génère un ID unique pour la tâche"""
        return str(uuid.uuid4())

    async def submit_task(
        self,
        task_func: Callable,
        task_name: str,
        *args,
        task_id: Optional[str] = None,
        **kwargs
    ) -> str:
        """
        Soumet une tâche pour exécution en arrière-plan
        """
        if task_id is None:
            task_id = self.generate_task_id()

        # Initialiser le statut de la tâche
        task_info = {
            "id": task_id,
            "name": task_name,
            "status": TaskStatus.PENDING,
            "progress": 0,
            "step": "Initialisation",
            "result": None,
            "error": None,
            "started_at": datetime.now(timezone.utc),
            "completed_at": None,
            "metadata": {}
        }
        self._tasks[task_id] = task_info

        # Lancer la tâche
        if asyncio.iscoroutinefunction(task_func):
            coro = task_func(*args, **kwargs)
        else:
            # Wrapper pour fonction synchrone
            coro = self._sync_wrapper(task_func, *args, **kwargs)

        task = asyncio.create_task(self._execute_task(task_id, coro))
        self._running_tasks[task_id] = task

        return task_id

    async def _sync_wrapper(self, func: Callable, *args, **kwargs) -> Any:
        """Wrapper pour exécuter une fonction synchrone dans un thread"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, func, *args, **kwargs)

    async def _execute_task(self, task_id: str, coro: Coroutine) -> Any:
        """
        Exécute une tâche avec gestion d'erreurs et mise à jour de statut
        """
        try:
            # Marquer comme en cours
            await self.update_task_status(
                task_id, 
                TaskStatus.PROGRESS, 
                progress=10,
                step="Exécution en cours"
            )

            # Exécuter la tâche
            result = await coro

            # Marquer comme terminée
            await self.update_task_status(
                task_id,
                TaskStatus.SUCCESS,
                progress=100,
                step="Terminée",
                result=result
            )

            return result

        except Exception as e:
            # Marquer comme échouée
            await self.update_task_status(
                task_id,
                TaskStatus.FAILURE,
                step="Erreur",
                error=str(e)
            )
            raise

        finally:
            # Nettoyer la tâche des tâches en cours
            if task_id in self._running_tasks:
                del self._running_tasks[task_id]

    async def update_task_status(
        self,
        task_id: str,
        status: TaskStatus,
        progress: Optional[int] = None,
        step: Optional[str] = None,
        result: Optional[Any] = None,
        error: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Met à jour le statut d'une tâche"""
        if task_id not in self._tasks:
            return

        task_info = self._tasks[task_id]
        
        # Mettre à jour les champs modifiés
        task_info["status"] = status
        if progress is not None:
            task_info["progress"] = progress
        if step is not None:
            task_info["step"] = step
        if result is not None:
            task_info["result"] = result
        if error is not None:
            task_info["error"] = error
        if metadata is not None:
            task_info["metadata"].update(metadata)

        if status in [TaskStatus.SUCCESS, TaskStatus.FAILURE, TaskStatus.REVOKED]:
            task_info["completed_at"] = datetime.now(timezone.utc)

    async def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Récupère le statut d'une tâche"""
        return self._tasks.get(task_id)

    async def get_task_result(self, task_id: str) -> Any:
        """Récupère le résultat d'une tâche terminée"""
        task_info = self._tasks.get(task_id)
        if not task_info:
            raise ValueError(f"Tâche {task_id} non trouvée")
        
        if task_info["status"] == TaskStatus.FAILURE:
            raise RuntimeError(f"La tâche a échoué: {task_info['error']}")
        
        if task_info["status"] != TaskStatus.SUCCESS:
            raise ValueError(f"La tâche n'est pas terminée (statut: {task_info['status']})")
        
        return task_info["result"]

    async def cancel_task(self, task_id: str) -> bool:
        """Annule une tâche en cours"""
        if task_id in self._running_tasks:
            task = self._running_tasks[task_id]
            task.cancel()
            
            await self.update_task_status(
                task_id,
                TaskStatus.REVOKED,
                step="Annulée",
                error="Tâche annulée par l'utilisateur"
            )
            return True
        return False


# Instance globale pour les tests
simple_task_manager = SimpleTaskManager()


# Test rapide si exécuté directement
if __name__ == "__main__":
    async def test_simple():
        print("🧪 Test TaskManager simple...")
        
        # Test tâche synchrone
        def sync_task(x):
            return x * 2
        
        task_id = await simple_task_manager.submit_task(sync_task, "test_sync", 5)
        print(f"✅ Tâche soumise: {task_id}")
        
        await asyncio.sleep(0.1)
        
        status = await simple_task_manager.get_task_status(task_id)
        print(f"✅ Statut: {status['status']}")
        print(f"✅ Résultat: {status['result']}")
        
        # Test tâche asynchrone
        async def async_task(message):
            await asyncio.sleep(0.05)
            return f"Processed: {message}"
        
        task_id2 = await simple_task_manager.submit_task(async_task, "test_async", "Hello")
        await asyncio.sleep(0.1)
        
        status2 = await simple_task_manager.get_task_status(task_id2)
        print(f"✅ Async Status: {status2['status']}")
        print(f"✅ Async Résultat: {status2['result']}")
        
        print("🎉 Tests réussis!")

    asyncio.run(test_simple())