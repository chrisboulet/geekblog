"""
Tâches IA avec FastAPI BackgroundTasks - Remplacement de Celery
Migration progressive des tâches ai_tasks.py vers BackgroundTasks
"""

from typing import Optional
from sqlalchemy.orm import Session

from app.core.task_compat import (
    create_compatible_task, 
    get_db,
    TaskCompatibilityMixin,
    add_signature_support
)
from app.services import ai_service, project_service, task_service, output_service
from app.schemas.schemas import TaskCreate
from app.models.workflow_models import TaskOutputType


@create_compatible_task(name="app.tasks.ai_tasks.planning_task")
async def planning_task_bg(
    self: TaskCompatibilityMixin,
    project_id: int,
    project_goal: str,
    workflow_execution_id: Optional[str] = None,
) -> dict:
    """
    Tâche asynchrone pour la planification IA d'un projet avec stratégie de merge
    Version BackgroundTasks de planning_task

    Args:
        project_id: ID du projet à planifier
        project_goal: Objectif du projet pour la planification
        workflow_execution_id: ID d'exécution du workflow (optionnel)

    Returns:
        dict: Résultat avec success, task_titles, et message
    """
    try:
        # Mettre à jour le statut de la tâche
        await self.update_state_with_db(
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
        await self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Génération du plan avec IA",
                "progress": 30,
                "status_message": f"Génération du plan IA pour: {project_goal[:100]}",
            },
        )

        # Exécuter la planification IA (fonction sync dans async wrapper)
        import asyncio
        loop = asyncio.get_event_loop()
        task_titles = await loop.run_in_executor(None, ai_service.run_planning_crew, project_goal)

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
        await self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Création des tâches en base",
                "progress": 70,
                "status_message": f"Création de {len(task_titles)} tâches en base",
            },
        )

        # Traitement des tâches comme dans l'original
        with get_db() as db:
            project = project_service.get_project(db, project_id)
            if not project:
                raise ValueError(f"Projet {project_id} non trouvé")

            # Logique de merge des tâches (comme dans l'original)
            created_count = 0
            merged_count = 0
            
            for title in task_titles:
                title_clean = title.strip()
                if not title_clean:
                    continue

                # Vérifier si la tâche existe déjà
                existing_task = task_service.get_task_by_title_and_project(
                    db, title_clean, project_id
                )

                if existing_task:
                    merged_count += 1
                    continue

                # Créer la nouvelle tâche
                task_data = TaskCreate(
                    title=title_clean,
                    description=f"Tâche générée par IA pour: {project_goal}",
                    project_id=project_id,
                    ai_generated=True,
                )

                task_service.create_task(db, task_data)
                created_count += 1

            # Mettre à jour le statut du projet
            project.planning_status = "COMPLETED"
            project.planning_job_id = None
            db.add(project)
            db.commit()

        # Finalisation
        await self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Planification terminée",
                "progress": 100,
                "status_message": f"Planification terminée: {created_count} créées, {merged_count} mergées",
            },
        )

        return {
            "success": True,
            "message": f"Planification réussie: {created_count} tâches créées, {merged_count} tâches mergées",
            "task_titles": task_titles,
            "created_count": created_count,
            "merged_count": merged_count,
        }

    except Exception as e:
        # Gestion d'erreur
        with get_db() as db:
            project = project_service.get_project(db, project_id)
            if project:
                project.planning_status = "FAILED"
                project.planning_job_id = None
                db.add(project)
                db.commit()

        await self.update_state_with_db(
            state="FAILURE",
            meta={
                "step": "Erreur durant la planification",
                "progress": 0,
                "status_message": f"Erreur: {str(e)}",
                "error": str(e),
            },
        )

        return {
            "success": False,
            "message": f"Erreur durant la planification: {str(e)}",
            "task_titles": [],
            "error": str(e),
        }


@create_compatible_task(name="app.tasks.ai_tasks.research_task")
async def research_task_bg(
    self: TaskCompatibilityMixin,
    task_id: int,
    task_title: str,
    context: str,
) -> dict:
    """
    Tâche asynchrone pour la recherche IA
    Version BackgroundTasks de research_task
    """
    try:
        await self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Initialisation recherche IA",
                "progress": 10,
                "status_message": f"Démarrage recherche pour tâche: {task_title}",
            },
        )

        with get_db() as db:
            task = task_service.get_task(db, task_id)
            if not task:
                raise ValueError(f"Tâche {task_id} non trouvée")

            # Vérifier que le LLM est configuré
            if not ai_service.llm:
                raise ValueError("Service IA non configuré (GROQ_API_KEY manquant)")

            await self.update_state_with_db(
                state="PROGRESS",
                meta={
                    "step": "Recherche IA en cours",
                    "progress": 50,
                    "status_message": f"Recherche IA pour: {task_title[:50]}...",
                },
            )

            # Exécuter la recherche IA
            import asyncio
            loop = asyncio.get_event_loop()
            research_content = await loop.run_in_executor(
                None, ai_service.run_research_crew, task_title, context
            )

            if not research_content:
                return {
                    "success": False,
                    "message": "Aucun contenu de recherche généré",
                    "content": "",
                }

            await self.update_state_with_db(
                state="PROGRESS",
                meta={
                    "step": "Sauvegarde des résultats",
                    "progress": 80,
                    "status_message": "Sauvegarde du contenu de recherche",
                },
            )

            # Sauvegarder le résultat
            output_service.create_output(
                db=db,
                task_id=task_id,
                output_type=TaskOutputType.RESEARCH,
                content=research_content,
                ai_generated=True,
            )

            return {
                "success": True,
                "message": "Recherche terminée avec succès",
                "content": research_content,
                "content_length": len(research_content),
            }

    except Exception as e:
        await self.update_state_with_db(
            state="FAILURE",
            meta={
                "step": "Erreur durant la recherche",
                "error": str(e),
            },
        )
        
        return {
            "success": False,
            "message": f"Erreur durant la recherche: {str(e)}",
            "content": "",
            "error": str(e),
        }


@create_compatible_task(name="app.tasks.ai_tasks.writing_task")  
async def writing_task_bg(
    self: TaskCompatibilityMixin,
    task_id: int,
    task_title: str,
    context: str,
) -> dict:
    """
    Tâche asynchrone pour l'écriture IA
    Version BackgroundTasks de writing_task
    """
    try:
        await self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Initialisation écriture IA",
                "progress": 10,
                "status_message": f"Démarrage écriture pour: {task_title}",
            },
        )

        with get_db() as db:
            task = task_service.get_task(db, task_id)
            if not task:
                raise ValueError(f"Tâche {task_id} non trouvée")

            if not ai_service.llm:
                raise ValueError("Service IA non configuré (GROQ_API_KEY manquant)")

            await self.update_state_with_db(
                state="PROGRESS",
                meta={
                    "step": "Écriture IA en cours",
                    "progress": 50,
                    "status_message": f"Génération du contenu pour: {task_title[:50]}...",
                },
            )

            # Exécuter l'écriture IA
            import asyncio
            loop = asyncio.get_event_loop()
            written_content = await loop.run_in_executor(
                None, ai_service.run_writing_crew, task_title, context
            )

            if not written_content:
                return {
                    "success": False,
                    "message": "Aucun contenu d'écriture généré",
                    "content": "",
                }

            await self.update_state_with_db(
                state="PROGRESS",
                meta={
                    "step": "Sauvegarde du contenu",
                    "progress": 90,
                    "status_message": "Sauvegarde du contenu d'écriture",
                },
            )

            # Sauvegarder le résultat
            output_service.create_output(
                db=db,
                task_id=task_id,
                output_type=TaskOutputType.WRITING,
                content=written_content,
                ai_generated=True,
            )

            return {
                "success": True,
                "message": "Écriture terminée avec succès",
                "content": written_content,
                "content_length": len(written_content),
            }

    except Exception as e:
        await self.update_state_with_db(
            state="FAILURE",
            meta={
                "step": "Erreur durant l'écriture",
                "error": str(e),
            },
        )
        
        return {
            "success": False,
            "message": f"Erreur durant l'écriture: {str(e)}",
            "content": "",
            "error": str(e),
        }


@create_compatible_task(name="app.tasks.ai_tasks.finishing_task")
async def finishing_task_bg(
    self: TaskCompatibilityMixin,
    project_id: int,
    raw_content: str,
) -> dict:
    """
    Tâche asynchrone pour la finalisation IA
    Version BackgroundTasks de finishing_task
    """
    try:
        await self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Initialisation finalisation",
                "progress": 10,
                "status_message": f"Démarrage finalisation projet {project_id}",
            },
        )

        with get_db() as db:
            project = project_service.get_project(db, project_id)
            if not project:
                raise ValueError(f"Projet {project_id} non trouvé")

            if not ai_service.llm:
                raise ValueError("Service IA non configuré (GROQ_API_KEY manquant)")

            await self.update_state_with_db(
                state="PROGRESS",
                meta={
                    "step": "Finalisation IA en cours",
                    "progress": 50,
                    "status_message": "Raffinage final du contenu...",
                },
            )

            # Exécuter la finalisation IA
            import asyncio
            loop = asyncio.get_event_loop()
            finished_content = await loop.run_in_executor(
                None, ai_service.run_finishing_crew, raw_content
            )

            if not finished_content:
                return {
                    "success": False,
                    "message": "Aucun contenu final généré",
                    "content": "",
                }

            await self.update_state_with_db(
                state="PROGRESS",
                meta={
                    "step": "Sauvegarde du contenu final",
                    "progress": 90,
                    "status_message": "Sauvegarde du contenu finalisé",
                },
            )

            # Sauvegarder le résultat final
            output_service.create_project_output(
                db=db,
                project_id=project_id,
                output_type=TaskOutputType.FINISHING,
                content=finished_content,
                ai_generated=True,
            )

            return {
                "success": True,
                "message": "Finalisation terminée avec succès",
                "content": finished_content,
                "content_length": len(finished_content),
            }

    except Exception as e:
        await self.update_state_with_db(
            state="FAILURE",
            meta={
                "step": "Erreur durant la finalisation",
                "error": str(e),
            },
        )
        
        return {
            "success": False,
            "message": f"Erreur durant la finalisation: {str(e)}",
            "content": "",
            "error": str(e),
        }


# Ajouter le support des signatures (.s()) pour toutes les tâches
planning_task_bg = add_signature_support(planning_task_bg)
research_task_bg = add_signature_support(research_task_bg)
writing_task_bg = add_signature_support(writing_task_bg)
finishing_task_bg = add_signature_support(finishing_task_bg)