"""
Tâches Celery pour les opérations IA asynchrones
"""

from typing import Optional
from sqlalchemy.orm import Session

from app.celery_config import celery_app
from app.db.config import SessionLocal
from app.services import ai_service, project_service, task_service, output_service
from app.schemas.schemas import TaskCreate
from app.tasks.base_task import JobAwareTask
from app.models.workflow_models import TaskOutputType


from contextlib import contextmanager


@contextmanager
def get_db() -> Session:
    """Context manager pour obtenir une session de base de données pour les tâches Celery"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@celery_app.task(bind=True, base=JobAwareTask, name="app.tasks.ai_tasks.planning_task")
def planning_task(
    self,
    project_id: int,
    project_goal: str,
    workflow_execution_id: Optional[str] = None,
) -> dict:
    """
    Tâche asynchrone pour la planification IA d'un projet avec stratégie de merge

    Args:
        project_id: ID du projet à planifier
        project_goal: Objectif du projet pour la planification

    Returns:
        dict: Résultat avec success, task_titles, et message
    """
    try:
        # Mettre à jour le statut de la tâche
        self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Initialisation planification IA",
                "progress": 10,
                "status_message": f"Démarrage de la planification pour le projet {project_id}",
            },
        )

        # Récupérer le projet et mettre à jour son statut de planification
        with get_db() as db:
            project = project_service.get_project(db, project_id)
            if not project:
                raise ValueError(f"Projet {project_id} non trouvé")

            # Mettre à jour le statut de planification du projet
            project.planning_status = "IN_PROGRESS"
            project.planning_job_id = self.request.id
            db.add(project)
            db.commit()

        # Vérifier que le LLM est configuré
        if not ai_service.llm:
            raise ValueError("Service IA non configuré (GROQ_API_KEY manquant)")

        # Mettre à jour le statut
        self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Génération du plan avec IA",
                "progress": 30,
                "status_message": f"Génération du plan IA pour: {project_goal[:100]}",
            },
        )

        # Exécuter la planification IA
        task_titles = ai_service.run_planning_crew(project_goal)

        if not task_titles:
            # Mettre à jour le statut en échec
            with get_db() as db:
                project = project_service.get_project(db, project_id)
                if project:
                    project.planning_status = "FAILED"
                    db.add(project)
                    db.commit()

            return {
                "success": False,
                "message": "L'IA n'a généré aucune tâche",
                "task_titles": [],
            }

        # Mettre à jour le statut
        self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Analyse et merge des tâches",
                "progress": 60,
                "status_message": f"Analyse de {len(task_titles)} tâches IA et merge avec l'existant",
            },
        )

        # Implémenter la stratégie de merge avec les tâches existantes
        with get_db() as db:
            from datetime import datetime
            from difflib import SequenceMatcher

            # Récupérer le projet avec ses tâches
            project = project_service.get_project(db, project_id)
            existing_tasks = project.tasks

            def similarity(a, b):
                """Calcule la similarité entre deux titres de tâches"""
                return SequenceMatcher(None, a.lower(), b.lower()).ratio()

            created_tasks = []
            enhanced_tasks = []

            # Pour chaque tâche générée par l'IA
            for ai_task_title in task_titles:
                # Chercher une tâche existante similaire (seuil de 70%)
                best_match = None
                best_similarity = 0.0

                for existing_task in existing_tasks:
                    sim = similarity(ai_task_title, existing_task.title)
                    if sim > best_similarity and sim >= 0.7:  # Seuil de similarité
                        best_similarity = sim
                        best_match = existing_task

                if best_match:
                    # Enrichir la tâche existante
                    if not best_match.description:
                        best_match.description = f"Planification IA: {ai_task_title}"
                    else:
                        best_match.description += f"\n\n[IA - {datetime.utcnow().strftime('%Y-%m-%d')}]: {ai_task_title}"

                    best_match.last_updated_by_ai_at = datetime.utcnow()
                    db.add(best_match)

                    enhanced_tasks.append(
                        {
                            "id": best_match.id,
                            "title": best_match.title,
                            "status": best_match.status,
                            "action": "enhanced",
                        }
                    )
                else:
                    # Créer une nouvelle tâche
                    order_start = max([t.order for t in existing_tasks] + [0]) + 1
                    task_create = TaskCreate(
                        title=ai_task_title,
                        project_id=project_id,
                        status="À faire",
                        order=order_start + len(created_tasks),
                    )
                    new_task = task_service.create_task(db, task_create)

                    # Marquer comme créée par l'IA
                    new_task.created_by_ai = True
                    new_task.last_updated_by_ai_at = datetime.utcnow()
                    db.add(new_task)

                    created_tasks.append(
                        {
                            "id": new_task.id,
                            "title": new_task.title,
                            "status": new_task.status,
                            "action": "created",
                        }
                    )

            # Mettre à jour le statut
            self.update_state_with_db(
                state="PROGRESS",
                meta={
                    "step": "Finalisation de la planification",
                    "progress": 90,
                    "status_message": f"Merge terminé: {len(created_tasks)} créées, {len(enhanced_tasks)} enrichies",
                },
            )

            # Sauvegarder le résultat de planification dans TaskOutput si dans un workflow
            if workflow_execution_id and (created_tasks or enhanced_tasks):
                planning_content = f"Planification générale:\n{project_goal}\n\n"

                if created_tasks:
                    planning_content += f"Tâches créées ({len(created_tasks)}):\n"
                    planning_content += "\n".join(
                        [f"- {task['title']}" for task in created_tasks]
                    )
                    planning_content += "\n\n"

                if enhanced_tasks:
                    planning_content += f"Tâches enrichies ({len(enhanced_tasks)}):\n"
                    planning_content += "\n".join(
                        [f"- {task['title']}" for task in enhanced_tasks]
                    )

                # Utiliser la première tâche comme référence
                reference_task_id = (created_tasks + enhanced_tasks)[0]["id"]
                output_service.save_task_output(
                    db=db,
                    task_id=reference_task_id,
                    output_type=TaskOutputType.PLANNING,
                    content=planning_content,
                    workflow_execution_id=workflow_execution_id,
                    metadata={
                        "planning_goal": project_goal,
                        "tasks_created": len(created_tasks),
                        "tasks_enhanced": len(enhanced_tasks),
                        "ai_task_titles": task_titles,
                        "merge_strategy": "enhance_and_create",
                    },
                )

            # Mettre à jour le statut final du projet
            project.planning_status = "COMPLETED"
            db.add(project)
            db.commit()

            # Mettre à jour le statut final de la tâche
            self.update_state_with_db(
                state="PROGRESS",
                meta={
                    "step": "Finalisation",
                    "progress": 100,
                    "status_message": f"Planification terminée: {len(created_tasks)} créées, {len(enhanced_tasks)} enrichies",
                },
            )

            all_tasks = created_tasks + enhanced_tasks
            return {
                "success": True,
                "message": f"Planification terminée: {len(created_tasks)} tâches créées, {len(enhanced_tasks)} tâches enrichies",
                "task_titles": task_titles,
                "created_tasks": created_tasks,
                "enhanced_tasks": enhanced_tasks,
                "total_tasks_affected": len(all_tasks),
                "workflow_execution_id": workflow_execution_id,
            }

    except Exception:
        # En cas d'erreur, mettre le statut du projet en échec
        try:
            with get_db() as db:
                project = project_service.get_project(db, project_id)
                if project:
                    project.planning_status = "FAILED"
                    project.planning_job_id = None
                    db.add(project)
                    db.commit()
        except:
            pass  # Ne pas faire échouer la tâche à cause d'une erreur de nettoyage

        # JobAwareTask gère automatiquement l'état d'échec
        raise


@celery_app.task(bind=True, base=JobAwareTask, name="app.tasks.ai_tasks.research_task")
def research_task(
    self,
    task_id: int,
    task_title: str,
    context: Optional[str] = None,
    workflow_execution_id: Optional[str] = None,
) -> dict:
    """
    Tâche asynchrone pour la recherche IA

    Args:
        task_id: ID de la tâche à traiter
        task_title: Titre de la tâche pour la recherche
        context: Contexte additionnel pour la recherche

    Returns:
        dict: Résultat avec success, content, et message
    """
    try:
        self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Démarrage recherche IA",
                "progress": 10,
                "status_message": f"Initialisation de la recherche pour: {task_title[:100]}",
            },
        )

        if not ai_service.llm:
            raise ValueError("Service IA non configuré")

        self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Recherche en cours avec IA",
                "progress": 50,
                "status_message": f"Recherche IA en cours pour: {task_title[:80]}",
            },
        )

        # Note: Cette fonction doit être implémentée dans ai_service
        # Pour le POC, on simule un résultat
        research_result = f"Résultat de recherche simulé pour: {task_title}"
        if hasattr(ai_service, "run_research_crew"):
            research_result = ai_service.run_research_crew(task_title, context)

        self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Mise à jour de la tâche",
                "progress": 80,
                "status_message": f"Mise à jour de la tâche {task_id} avec les résultats de recherche",
            },
        )

        # Mettre à jour la tâche en base
        with get_db() as db:
            # Sauvegarder dans TaskOutput si dans un workflow
            if workflow_execution_id:
                output_service.save_task_output(
                    db=db,
                    task_id=task_id,
                    output_type=TaskOutputType.RESEARCH,
                    content=research_result,
                    workflow_execution_id=workflow_execution_id,
                    metadata={
                        "task_title": task_title,
                        "context_provided": context is not None,
                        "research_method": "crewai_simulation"
                        if not hasattr(ai_service, "run_research_crew")
                        else "crewai_actual",
                    },
                )

            # Mettre à jour la tâche traditionnellement pour rétrocompatibilité
            updated_task = task_service.update_task(
                db, task_id, {"description": research_result, "status": "Révision"}
            )

            if not updated_task:
                raise ValueError(f"Tâche {task_id} non trouvée")

            return {
                "success": True,
                "message": "Recherche terminée avec succès",
                "content": research_result,
                "task_id": task_id,
                "workflow_execution_id": workflow_execution_id,
            }

    except Exception:
        # JobAwareTask gère automatiquement l'état d'échec
        raise


@celery_app.task(bind=True, base=JobAwareTask, name="app.tasks.ai_tasks.writing_task")
def writing_task(
    self,
    task_id: int,
    task_title: str,
    context: Optional[str] = None,
    workflow_execution_id: Optional[str] = None,
) -> dict:
    """
    Tâche asynchrone pour la rédaction IA
    """
    try:
        self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Démarrage rédaction IA",
                "progress": 10,
                "status_message": f"Initialisation de la rédaction pour: {task_title[:100]}",
            },
        )

        if not ai_service.llm:
            raise ValueError("Service IA non configuré")

        self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Rédaction en cours avec IA",
                "progress": 50,
                "status_message": f"Rédaction IA en cours pour: {task_title[:80]}",
            },
        )

        # Simulation pour le POC
        writing_result = f"Contenu rédigé simulé pour: {task_title}"
        if hasattr(ai_service, "run_writing_crew"):
            writing_result = ai_service.run_writing_crew(task_title, context)

        self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Mise à jour de la tâche",
                "progress": 80,
                "status_message": f"Mise à jour de la tâche {task_id} avec le contenu rédigé",
            },
        )

        # Mettre à jour la tâche en base
        with get_db() as db:
            # Sauvegarder dans TaskOutput si dans un workflow
            if workflow_execution_id:
                output_service.save_task_output(
                    db=db,
                    task_id=task_id,
                    output_type=TaskOutputType.WRITING,
                    content=writing_result,
                    workflow_execution_id=workflow_execution_id,
                    metadata={
                        "task_title": task_title,
                        "context_provided": context is not None,
                        "writing_method": "crewai_simulation"
                        if not hasattr(ai_service, "run_writing_crew")
                        else "crewai_actual",
                    },
                )

            # Mettre à jour la tâche traditionnellement pour rétrocompatibilité
            updated_task = task_service.update_task(
                db, task_id, {"description": writing_result, "status": "Révision"}
            )

            if not updated_task:
                raise ValueError(f"Tâche {task_id} non trouvée")

            return {
                "success": True,
                "message": "Rédaction terminée avec succès",
                "content": writing_result,
                "task_id": task_id,
                "workflow_execution_id": workflow_execution_id,
            }

    except Exception:
        # JobAwareTask gère automatiquement l'état d'échec
        raise


# SUPPRIMÉ: run_agent_task - Était un anti-pattern Celery avec .get() bloquant
# Remplacé par dispatch direct depuis l'endpoint API vers research_task/writing_task
# Voir: app/api/endpoints/tasks.py:run_agent_on_task_async


@celery_app.task(bind=True, base=JobAwareTask, name="app.tasks.ai_tasks.finishing_task")
def finishing_task(self, project_id: int, raw_content: str) -> dict:
    """
    Tâche asynchrone pour le raffinage final avec le Finishing Crew
    """
    try:
        self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Démarrage du raffinage IA",
                "progress": 10,
                "status_message": f"Initialisation du raffinage pour le projet {project_id}",
            },
        )

        if not ai_service.llm:
            raise ValueError("Service IA non configuré")

        self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Raffinage en cours (Critique)",
                "progress": 25,
                "status_message": "Analyse critique du contenu par l'IA",
            },
        )

        # Simulation progressive pour le POC
        self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Raffinage en cours (Style)",
                "progress": 50,
                "status_message": "Amélioration du style et de la cohérence",
            },
        )

        self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Raffinage en cours (Vérification)",
                "progress": 75,
                "status_message": "Vérification finale et corrections",
            },
        )

        # Appel du service de raffinage
        refined_content = raw_content + "\n\n[Raffiné par l'IA - POC]"
        if hasattr(ai_service, "run_finishing_crew"):
            refined_content = ai_service.run_finishing_crew(raw_content)

        return {
            "success": True,
            "message": "Raffinage terminé avec succès",
            "content": refined_content,
            "project_id": project_id,
        }

    except Exception:
        # JobAwareTask gère automatiquement l'état d'échec
        raise
