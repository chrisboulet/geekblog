"""
Orchestrateur de workflows avec FastAPI BackgroundTasks
Remplacement des primitives Celery (chain, group, chord)
"""

from typing import List
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.core.task_compat import (
    create_compatible_task,
    get_db,
    TaskCompatibilityMixin,
    chain,
    group, 
    chord,
    add_signature_support
)
from app.tasks.ai_tasks_bg import planning_task_bg, research_task_bg, writing_task_bg, finishing_task_bg
from app.services import workflow_service, output_service, project_service, task_service
from app.models.workflow_models import WorkflowStatus, TaskOutputType


@create_compatible_task(name="app.tasks.orchestrator_tasks.full_article_workflow_task")
async def full_article_workflow_task_bg(
    self: TaskCompatibilityMixin, 
    project_id: int, 
    workflow_execution_id: str
) -> dict:
    """
    Tâche orchestratrice principale pour la génération complète d'articles
    Version BackgroundTasks remplaçant Celery chain/group/chord

    Workflow: Planning → Research Coordination → Assembly → Finishing
    """
    try:
        await self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Initialisation workflow",
                "progress": 5,
                "status_message": f"Démarrage du workflow complet pour le projet {project_id}",
            },
        )

        with get_db() as db:
            # Vérifier que le projet existe
            project = project_service.get_project(db, project_id)
            if not project:
                raise ValueError(f"Projet {project_id} non trouvé")

            # Mettre à jour le workflow status
            workflow_service.update_workflow_step(
                db=db,
                workflow_id=workflow_execution_id,
                step_name="planning",
                progress=10,
                metadata={"project_name": project.name},
            )

        # ÉTAPE 1: Planning
        await self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Phase 1: Planification",
                "progress": 20,
                "status_message": "Exécution de la planification IA",
            },
        )

        planning_result = await planning_task_bg.delay(project_id, project.description)
        planning_status = await planning_result.get_status()
        
        if not planning_status or planning_status.get("status") != "SUCCESS":
            raise Exception("Échec de la planification")

        planning_data = planning_status["result"]
        if not planning_data.get("success"):
            raise Exception(f"Planification échouée: {planning_data.get('message')}")

        # ÉTAPE 2: Coordination des recherches
        await self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Phase 2: Coordination recherches",
                "progress": 40,
                "status_message": "Lancement des recherches en parallèle",
            },
        )

        research_result = await research_coordinator_task_bg.delay(workflow_execution_id)
        research_status = await research_result.get_status()
        
        if not research_status or research_status.get("status") != "SUCCESS":
            raise Exception("Échec de la coordination des recherches")

        # ÉTAPE 3: Assemblage
        await self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Phase 3: Assemblage",
                "progress": 70,
                "status_message": "Assemblage des contenus",
            },
        )

        assembly_result = await assembly_task_bg.delay(project_id, workflow_execution_id)
        assembly_status = await assembly_result.get_status()
        
        if not assembly_status or assembly_status.get("status") != "SUCCESS":
            raise Exception("Échec de l'assemblage")

        assembly_data = assembly_status["result"]

        # ÉTAPE 4: Finition
        await self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Phase 4: Finition",
                "progress": 90,
                "status_message": "Finalisation du contenu",
            },
        )

        finishing_result = await finishing_task_bg.delay(
            project_id, 
            assembly_data.get("assembled_content", "")
        )
        finishing_status = await finishing_result.get_status()
        
        if not finishing_status or finishing_status.get("status") != "SUCCESS":
            raise Exception("Échec de la finition")

        # Finalisation du workflow
        with get_db() as db:
            workflow_service.update_workflow_step(
                db=db,
                workflow_id=workflow_execution_id,
                step_name="completed",
                progress=100,
                metadata={"completed_at": datetime.now(timezone.utc).isoformat()},
            )

        return {
            "success": True,
            "message": "Workflow complet terminé avec succès",
            "workflow_id": workflow_execution_id,
            "project_id": project_id,
            "planning_result": planning_data,
            "finishing_result": finishing_status["result"],
        }

    except Exception as e:
        # Marquer le workflow comme échoué
        with get_db() as db:
            workflow_service.update_workflow_step(
                db=db,
                workflow_id=workflow_execution_id,
                step_name="failed",
                progress=0,
                metadata={"error": str(e), "failed_at": datetime.now(timezone.utc).isoformat()},
            )

        await self.update_state_with_db(
            state="FAILURE",
            meta={
                "step": "Workflow échoué",
                "error": str(e),
            },
        )

        return {
            "success": False,
            "message": f"Workflow échoué: {str(e)}",
            "workflow_id": workflow_execution_id,
            "error": str(e),
        }


@create_compatible_task(name="app.tasks.orchestrator_tasks.research_coordinator_task")
async def research_coordinator_task_bg(
    self: TaskCompatibilityMixin,
    workflow_execution_id: str,
) -> dict:
    """
    Coordonne les recherches en parallèle pour toutes les tâches du projet
    Remplace le système group() de Celery
    """
    try:
        await self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Récupération des tâches",
                "progress": 10,
                "status_message": "Recherche des tâches à traiter",
            },
        )

        with get_db() as db:
            # Récupérer toutes les tâches du workflow
            workflow = workflow_service.get_workflow(db, workflow_execution_id)
            if not workflow:
                raise ValueError(f"Workflow {workflow_execution_id} non trouvé")

            project_id = workflow.project_id
            tasks = task_service.get_tasks_by_project(db, project_id)
            
            if not tasks:
                return {
                    "success": True,
                    "message": "Aucune tâche à traiter",
                    "research_results": [],
                }

        await self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Lancement recherches parallèles",
                "progress": 30,
                "status_message": f"Lancement de {len(tasks)} recherches en parallèle",
            },
        )

        # Créer la liste des tâches de recherche à exécuter en parallèle
        research_tasks = []
        for task in tasks:
            context = f"Projet: {workflow.project.name}\nDescription: {workflow.project.description}"
            research_tasks.append(research_task_bg.s(task.id, task.title, context))

        # Exécuter toutes les recherches en parallèle avec group()
        research_group = group(*research_tasks)
        group_result = await research_group.apply_async()
        
        # Attendre que toutes les recherches se terminent
        group_status = await group_result.get_status()
        research_results = group_status["result"] if group_status else []

        # Vérifier les résultats
        successful_count = 0
        failed_count = 0
        
        for result in research_results:
            if result and result.get("success"):
                successful_count += 1
            else:
                failed_count += 1

        await self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Recherches terminées", 
                "progress": 100,
                "status_message": f"Recherches terminées: {successful_count} succès, {failed_count} échecs",
            },
        )

        return {
            "success": True,
            "message": f"Coordination terminée: {successful_count} recherches réussies, {failed_count} échouées",
            "research_results": research_results,
            "successful_count": successful_count,
            "failed_count": failed_count,
        }

    except Exception as e:
        await self.update_state_with_db(
            state="FAILURE",
            meta={
                "step": "Erreur coordination recherches",
                "error": str(e),
            },
        )
        
        return {
            "success": False,
            "message": f"Erreur coordination: {str(e)}",
            "research_results": [],
            "error": str(e),
        }


@create_compatible_task(name="app.tasks.orchestrator_tasks.assembly_task") 
async def assembly_task_bg(
    self: TaskCompatibilityMixin,
    project_id: int,
    workflow_execution_id: str,
) -> dict:
    """
    Assemble tous les contenus de recherche et d'écriture en un contenu unifié
    """
    try:
        await self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Récupération des contenus",
                "progress": 20,
                "status_message": "Collecte de tous les contenus générés",
            },
        )

        with get_db() as db:
            project = project_service.get_project(db, project_id)
            if not project:
                raise ValueError(f"Projet {project_id} non trouvé")

            # Récupérer tous les outputs de recherche et d'écriture
            research_outputs = output_service.get_outputs_by_project_and_type(
                db, project_id, TaskOutputType.RESEARCH
            )
            writing_outputs = output_service.get_outputs_by_project_and_type(
                db, project_id, TaskOutputType.WRITING
            )

        await self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Assemblage du contenu",
                "progress": 60,
                "status_message": f"Assemblage de {len(research_outputs)} recherches et {len(writing_outputs)} écrits",
            },
        )

        # Assembler le contenu
        assembled_content = f"# {project.name}\n\n"
        assembled_content += f"{project.description}\n\n"

        # Ajouter les recherches
        if research_outputs:
            assembled_content += "## Recherches\n\n"
            for output in research_outputs:
                assembled_content += f"### {output.task.title}\n\n"
                assembled_content += f"{output.content}\n\n"

        # Ajouter les écrits
        if writing_outputs:
            assembled_content += "## Contenus rédigés\n\n"
            for output in writing_outputs:
                assembled_content += f"### {output.task.title}\n\n"
                assembled_content += f"{output.content}\n\n"

        await self.update_state_with_db(
            state="PROGRESS",
            meta={
                "step": "Sauvegarde assemblage",
                "progress": 90,
                "status_message": "Sauvegarde du contenu assemblé",
            },
        )

        # Sauvegarder le contenu assemblé
        with get_db() as db:
            output_service.create_project_output(
                db=db,
                project_id=project_id,
                output_type=TaskOutputType.ASSEMBLY,
                content=assembled_content,
                ai_generated=False,  # Assemblage automatique
            )

        return {
            "success": True,
            "message": f"Assemblage terminé: {len(assembled_content)} caractères",
            "assembled_content": assembled_content,
            "research_count": len(research_outputs),
            "writing_count": len(writing_outputs),
            "content_length": len(assembled_content),
        }

    except Exception as e:
        await self.update_state_with_db(
            state="FAILURE",
            meta={
                "step": "Erreur assemblage",
                "error": str(e),
            },
        )
        
        return {
            "success": False,
            "message": f"Erreur assemblage: {str(e)}",
            "assembled_content": "",
            "error": str(e),
        }


# Ajouter le support des signatures pour les nouvelles tâches
full_article_workflow_task_bg = add_signature_support(full_article_workflow_task_bg)
research_coordinator_task_bg = add_signature_support(research_coordinator_task_bg)
assembly_task_bg = add_signature_support(assembly_task_bg)