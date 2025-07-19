"""
Couche de compatibilité pour migrer de Celery vers FastAPI BackgroundTasks
Permet une migration progressive sans casser l'API existante
"""

from typing import Any, Dict, Optional, Callable
from contextlib import contextmanager
from sqlalchemy.orm import Session

from app.db.config import SessionLocal
from app.core.task_manager import task_manager, background_task, BackgroundTaskResult


# ===== COMPATIBILITY LAYER =====

@contextmanager
def get_db() -> Session:
    """Context manager compatible avec l'ancien code Celery"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class TaskCompatibilityMixin:
    """
    Mixin pour les tâches qui fournit les méthodes compatibles avec JobAwareTask de Celery
    """
    
    def __init__(self, task_id: str):
        self.task_id = task_id
        self.request = TaskRequest(task_id)
    
    async def update_state_with_db(
        self, 
        state: str = "PROGRESS", 
        meta: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Compatible avec la méthode update_state_with_db de JobAwareTask
        """
        if meta is None:
            meta = {}
            
        await task_manager.update_task_status(
            self.task_id,
            state,
            progress=meta.get("progress", 0),
            step=meta.get("step", ""),
            metadata=meta
        )

    def update_job_progress(
        self,
        progress: float,
        step: str,
        status: str = "PROGRESS",
        status_message: Optional[str] = None,
    ) -> None:
        """
        Compatible avec la méthode update_job_progress de JobAwareTask
        Version synchrone - utilisée dans l'ancien code
        """
        import asyncio
        
        # Créer une tâche async si nous sommes dans un contexte async
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # Nous sommes déjà dans un contexte async
                loop.create_task(task_manager.update_task_status(
                    self.task_id,
                    status,
                    progress=int(progress),
                    step=step,
                    metadata={"status_message": status_message} if status_message else None
                ))
            else:
                # Contexte synchrone - exécuter directement
                loop.run_until_complete(task_manager.update_task_status(
                    self.task_id,
                    status,
                    progress=int(progress),
                    step=step,
                    metadata={"status_message": status_message} if status_message else None
                ))
        except RuntimeError:
            # Pas de loop disponible - créer un nouveau
            asyncio.run(task_manager.update_task_status(
                self.task_id,
                status,
                progress=int(progress),
                step=step,
                metadata={"status_message": status_message} if status_message else None
            ))


class TaskRequest:
    """Simule self.request de Celery"""
    def __init__(self, task_id: str):
        self.id = task_id


def create_compatible_task(name: str, bind: bool = True):
    """
    Crée une tâche compatible avec l'ancien système Celery
    
    Args:
        name: Nom de la tâche
        bind: Si True, passe self comme premier argument (compatibilité Celery)
    """
    def decorator(func: Callable):
        @background_task(name)
        async def async_wrapper(*args, **kwargs):
            # Récupérer l'ID de la tâche actuelle depuis le task_manager
            # Pour l'instant, on utilise un ID généré - pourrait être amélioré
            import uuid
            task_id = str(uuid.uuid4())
            
            if bind:
                # Créer un objet self compatible avec JobAwareTask
                task_self = TaskCompatibilityMixin(task_id)
                return await func(task_self, *args, **kwargs)
            else:
                return await func(*args, **kwargs)
        
        # Copier les attributs de la fonction originale
        async_wrapper.__name__ = func.__name__
        async_wrapper.__doc__ = func.__doc__
        
        # Ajouter les méthodes compatibles Celery
        async_wrapper.delay = async_wrapper.delay
        async_wrapper.apply_async = async_wrapper.apply_async
        
        return async_wrapper
    
    return decorator


# ===== WORKFLOW PRIMITIVES =====

class WorkflowChain:
    """
    Remplace chain() de Celery pour les workflows séquentiels
    """
    def __init__(self, *tasks):
        self.tasks = tasks
    
    async def apply_async(self) -> BackgroundTaskResult:
        """
        Exécute les tâches en séquence
        """
        result = None
        
        for task in self.tasks:
            if hasattr(task, 'delay'):
                # Tâche de background
                if result is not None:
                    # Passer le résultat de la tâche précédente
                    task_result = await task.delay(result)
                else:
                    task_result = await task.delay()
                result = await task_result.get_status()
                result = result["result"] if result else None
            else:
                # Fonction simple
                result = await task(result) if result is not None else await task()
        
        # Créer un résultat final
        final_task_id = await task_manager.submit_task(
            lambda r: r, 
            "workflow_chain", 
            result
        )
        return BackgroundTaskResult(final_task_id)


class WorkflowGroup:
    """
    Remplace group() de Celery pour les workflows parallèles
    """
    def __init__(self, *tasks):
        self.tasks = tasks
    
    async def apply_async(self) -> BackgroundTaskResult:
        """
        Exécute les tâches en parallèle
        """
        import asyncio
        
        # Lancer toutes les tâches en parallèle
        task_results = []
        for task in self.tasks:
            if hasattr(task, 'delay'):
                task_results.append(await task.delay())
            else:
                # Pour les fonctions simples, les wrapper en tâches
                task_id = await task_manager.submit_task(task, f"group_task_{len(task_results)}")
                task_results.append(BackgroundTaskResult(task_id))
        
        # Attendre que toutes les tâches se terminent
        results = []
        for task_result in task_results:
            while not await task_result.ready():
                await asyncio.sleep(0.1)
            status = await task_result.get_status()
            results.append(status["result"] if status else None)
        
        # Créer un résultat final avec tous les résultats
        final_task_id = await task_manager.submit_task(
            lambda r: r,
            "workflow_group",
            results
        )
        return BackgroundTaskResult(final_task_id)


class WorkflowChord:
    """
    Remplace chord() de Celery (group + callback)
    """
    def __init__(self, group_tasks, callback_task):
        self.group = WorkflowGroup(*group_tasks)
        self.callback = callback_task
    
    async def apply_async(self) -> BackgroundTaskResult:
        """
        Exécute le groupe puis le callback avec les résultats
        """
        # Exécuter le groupe
        group_result = await self.group.apply_async()
        group_status = await group_result.get_status()
        group_results = group_status["result"] if group_status else []
        
        # Exécuter le callback avec les résultats du groupe
        if hasattr(self.callback, 'delay'):
            return await self.callback.delay(group_results)
        else:
            task_id = await task_manager.submit_task(
                self.callback,
                "workflow_chord_callback",
                group_results
            )
            return BackgroundTaskResult(task_id)


# ===== HELPER FUNCTIONS =====

def chain(*tasks):
    """Factory function pour créer un WorkflowChain"""
    return WorkflowChain(*tasks)

def group(*tasks):
    """Factory function pour créer un WorkflowGroup"""
    return WorkflowGroup(*tasks)

def chord(group_tasks, callback_task):
    """Factory function pour créer un WorkflowChord"""
    return WorkflowChord(group_tasks, callback_task)


# ===== SIGNATURE COMPATIBILITY =====

class TaskSignature:
    """
    Simule les signatures de Celery (.s() method)
    """
    def __init__(self, task_func, *args, **kwargs):
        self.task_func = task_func
        self.args = args
        self.kwargs = kwargs
    
    async def delay(self):
        """Exécute la tâche avec les arguments préparés"""
        return await self.task_func.delay(*self.args, **self.kwargs)
    
    async def apply_async(self):
        """Alias pour delay()"""
        return await self.delay()


def add_signature_support(task_func):
    """
    Ajoute le support des signatures (.s()) à une tâche
    """
    def s(*args, **kwargs):
        return TaskSignature(task_func, *args, **kwargs)
    
    task_func.s = s
    return task_func