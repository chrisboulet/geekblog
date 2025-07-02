"""
JobAwareTask - Base Task robuste pour la mise à jour automatique des jobs
"""
from celery import Task
from typing import Optional, Dict, Any
from datetime import datetime
import traceback

from app.db.config import SessionLocal
from app.services import job_service


class JobAwareTask(Task):
    """
    Classe base pour les tâches Celery qui met à jour automatiquement
    l'état des jobs en base de données avec gestion d'erreurs robuste.
    """
    
    def _get_db_session(self):
        """Créer une nouvelle session de base de données thread-safe"""
        return SessionLocal()
    
    def _close_db_session(self, db):
        """Fermer proprement la session de base de données"""
        if db:
            try:
                db.close()
            except Exception:
                pass
    
    def update_job_progress(
        self,
        progress: float,
        step: str,
        status: str = "PROGRESS",
        status_message: Optional[str] = None
    ) -> None:
        """
        Mettre à jour la progression du job avec gestion d'erreurs
        """
        db = None
        try:
            db = self._get_db_session()
            job_service.update_job_progress(
                db=db,
                job_id=self.request.id,
                progress=progress,
                step=step,
                status=status,
                status_message=status_message,
                add_to_history=True
            )
        except Exception as e:
            # Log l'erreur mais ne fait pas échouer la tâche
            print(f"Erreur lors de la mise à jour du job {self.request.id}: {e}")
        finally:
            self._close_db_session(db)
    
    def update_state_with_db(
        self,
        state: str = "PROGRESS",
        meta: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Mettre à jour l'état Celery ET la base de données de façon synchronisée
        """
        # Mise à jour Celery (pour compatibilité)
        if meta:
            self.update_state(state=state, meta=meta)
        
        # Mise à jour base de données avec informations enrichies
        if meta:
            progress = meta.get('progress', 0)
            step = meta.get('step', '')
            status_message = meta.get('message', meta.get('status_message'))
            
            self.update_job_progress(
                progress=progress,
                step=step,
                status=state,
                status_message=status_message
            )
    
    def on_success(self, retval, task_id, args, kwargs):
        """
        Appelé quand la tâche réussit - met à jour le job en base
        """
        db = None
        try:
            db = self._get_db_session()
            
            # Extraire le résumé du résultat si disponible
            result_summary = None
            if isinstance(retval, dict):
                result_summary = retval.get('message', 'Tâche terminée avec succès')
            
            job_service.complete_job(
                db=db,
                job_id=task_id,
                success=True,
                result_summary=result_summary
            )
        except Exception as e:
            print(f"Erreur lors de la finalisation du job {task_id}: {e}")
        finally:
            self._close_db_session(db)
    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """
        Appelé quand la tâche échoue - met à jour le job en base
        """
        db = None
        try:
            db = self._get_db_session()
            
            # Extraire les informations d'erreur
            error_message = str(exc)
            if hasattr(exc, '__class__'):
                error_message = f"{exc.__class__.__name__}: {str(exc)}"
            
            job_service.complete_job(
                db=db,
                job_id=task_id,
                success=False,
                error_message=error_message
            )
        except Exception as e:
            print(f"Erreur lors de la finalisation du job échoué {task_id}: {e}")
        finally:
            self._close_db_session(db)
    
    def on_retry(self, exc, task_id, args, kwargs, einfo):
        """
        Appelé lors d'une nouvelle tentative - met à jour le statut
        """
        db = None
        try:
            db = self._get_db_session()
            job_service.update_job_progress(
                db=db,
                job_id=task_id,
                progress=0,  # Reset progress on retry
                step=f"Nouvelle tentative après erreur: {str(exc)[:100]}",
                status="RETRY",
                status_message=f"Nouvelle tentative en cours (erreur: {str(exc)[:200]})"
            )
        except Exception as e:
            print(f"Erreur lors de la mise à jour du retry {task_id}: {e}")
        finally:
            self._close_db_session(db)


# Helper pour créer des tâches avec la classe de base
def create_job_aware_task(celery_app, name: str, bind: bool = True):
    """
    Décorateur helper pour créer des tâches avec JobAwareTask
    """
    def decorator(func):
        return celery_app.task(
            bind=bind,
            base=JobAwareTask,
            name=name
        )(func)
    return decorator