"""
FastAPI BackgroundTasks Manager - Remplacement de Celery
Architecture simplifiée pour single-user avec persistance en base
"""

import asyncio
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Callable, Coroutine, List
from enum import Enum
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager

from app.db.config import SessionLocal
from app.services import job_service
from app.models.job_models import AsyncJob


class TaskStatus(str, Enum):
    """Statuts des tâches de background"""
    PENDING = "PENDING"
    PROGRESS = "PROGRESS" 
    SUCCESS = "SUCCESS"
    FAILURE = "FAILURE"
    REVOKED = "REVOKED"


class BackgroundTaskManager:
    """
    Gestionnaire de tâches de background pour remplacer Celery
    
    Fonctionnalités:
    - Exécution asynchrone des tâches
    - Suivi des statuts et progression 
    - Persistance en base de données
    - Gestion des erreurs et retry
    - Support workflow séquentiel et parallèle
    """

    def __init__(self):
        self._tasks: Dict[str, Dict[str, Any]] = {}
        self._running_tasks: Dict[str, asyncio.Task] = {}

    @asynccontextmanager
    async def get_db(self) -> Session:
        """Context manager pour session DB thread-safe"""
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

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
        
        Args:
            task_func: Fonction à exécuter (async ou sync)
            task_name: Nom de la tâche pour identification
            args: Arguments positionnels
            task_id: ID optionnel (généré si non fourni)
            kwargs: Arguments nommés
            
        Returns:
            str: ID de la tâche
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

        # Enregistrer en base
        async with self.get_db() as db:
            await self._create_job_record(db, task_id, task_name)

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

        # Synchroniser avec la base de données
        async with self.get_db() as db:
            await self._update_job_record(db, task_id, task_info)

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

    async def _create_job_record(self, db: Session, task_id: str, task_name: str):
        """Crée un enregistrement de job en base"""
        # Utiliser job_service si disponible, sinon créer directement
        try:
            job_service.create_job(
                db=db,
                job_id=task_id,
                job_type=task_name,
                status="PENDING",
                progress=0,
                step="Initialisation"
            )
        except Exception:
            # Fallback: création directe
            job = AsyncJob(
                id=task_id,
                job_type=task_name,
                status="PENDING",
                progress=0,
                step="Initialisation",
                created_at=datetime.now(timezone.utc)
            )
            db.add(job)
            db.commit()

    async def _update_job_record(self, db: Session, task_id: str, task_info: Dict[str, Any]):
        """Met à jour l'enregistrement de job en base"""
        try:
            job_service.update_job_progress(
                db=db,
                job_id=task_id,
                progress=task_info["progress"],
                step=task_info["step"],
                status=task_info["status"],
                status_message=task_info.get("error")
            )
        except Exception:
            # Fallback: mise à jour directe
            job = db.query(AsyncJob).filter(AsyncJob.id == task_id).first()
            if job:
                job.status = task_info["status"]
                job.progress = task_info["progress"]
                job.step = task_info["step"]
                if task_info["error"]:
                    job.error_message = task_info["error"]
                if task_info["completed_at"]:
                    job.completed_at = task_info["completed_at"]
                db.commit()


# Instance globale du gestionnaire de tâches
task_manager = BackgroundTaskManager()


# Decorateur pour créer des tâches compatibles avec l'ancienne API Celery
def background_task(name: str):
    """
    Décorateur pour transformer une fonction en tâche de background
    Compatible avec l'ancienne API Celery
    """
    def decorator(func):
        async def delay(*args, **kwargs):
            """Méthode .delay() compatible Celery"""
            task_id = await task_manager.submit_task(func, name, *args, **kwargs)
            return BackgroundTaskResult(task_id)
        
        func.delay = delay
        func.apply_async = delay  # Alias pour apply_async
        return func
    
    return decorator


class BackgroundTaskResult:
    """
    Classe de résultat compatible avec AsyncResult de Celery
    """
    def __init__(self, task_id: str):
        self.id = task_id
        self.task_id = task_id

    async def get_status(self) -> Dict[str, Any]:
        """Récupère le statut de la tâche"""
        return await task_manager.get_task_status(self.task_id)

    @property
    async def status(self) -> str:
        """Statut de la tâche"""
        task_info = await self.get_status()
        return task_info["status"] if task_info else "PENDING"

    @property 
    async def result(self) -> Any:
        """Résultat de la tâche"""
        task_info = await self.get_status()
        return task_info["result"] if task_info else None

    async def ready(self) -> bool:
        """Vérifie si la tâche est terminée"""
        task_info = await self.get_status()
        if not task_info:
            return False
        return task_info["status"] in [TaskStatus.SUCCESS, TaskStatus.FAILURE, TaskStatus.REVOKED]

    async def failed(self) -> bool:
        """Vérifie si la tâche a échoué"""
        task_info = await self.get_status()
        return task_info["status"] == TaskStatus.FAILURE if task_info else False

    async def revoke(self):
        """Annule la tâche"""
        await task_manager.cancel_task(self.task_id)