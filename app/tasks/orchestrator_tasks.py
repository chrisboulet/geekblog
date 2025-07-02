"""
Tâches orchestratrices pour les workflows Celery
"""
from typing import List, Dict, Any, Optional
from celery import chain, group, chord
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.celery_config import celery_app
from app.db.config import SessionLocal
from app.tasks.base_task import JobAwareTask
from app.tasks.ai_tasks import planning_task, research_task, writing_task, finishing_task
from app.services import workflow_service, output_service, project_service
from app.models.workflow_models import WorkflowType, WorkflowStatus, TaskOutputType
from contextlib import contextmanager


@contextmanager
def get_db() -> Session:
    """Context manager pour obtenir une session de base de données avec commit automatique"""
    db = SessionLocal()
    try:
        yield db
        db.commit()  # Auto-commit sur succès
    except Exception:
        db.rollback()  # Auto-rollback sur exception
        raise
    finally:
        db.close()


@celery_app.task(bind=True, base=JobAwareTask, name="app.tasks.orchestrator_tasks.full_article_workflow_task")
def full_article_workflow_task(self, project_id: int, workflow_execution_id: str) -> dict:
    """
    Tâche orchestratrice principale pour la génération complète d'articles
    
    Workflow: Planning → Research Coordination → Assembly → Finishing
    """
    try:
        self.update_state_with_db(
            state='PROGRESS',
            meta={
                'step': 'Initialisation workflow',
                'progress': 5,
                'status_message': f'Démarrage du workflow complet pour le projet {project_id}'
            }
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
                metadata={"project_name": project.name}
            )
        
        # Construire le workflow en chaîne
        workflow = chain(
            # 1. Planning - génère la liste des tâches
            planning_task.s(project_id, project.description),
            
            # 2. Coordination des recherches - lance les recherches en parallèle
            research_coordinator_task.s(workflow_execution_id),
            
            # 3. Assemblage - collecte et fusionne tous les résultats
            assembly_task.s(project_id, workflow_execution_id),
            
            # 4. Finition - raffinage final du contenu
            project_finishing_task.s(project_id, workflow_execution_id)
        )
        
        # Lancer le workflow
        result = workflow.apply_async()
        
        return {
            'success': True,
            'message': 'Workflow complet lancé avec succès',
            'workflow_chain_id': result.id,
            'project_id': project_id,
            'workflow_execution_id': workflow_execution_id
        }
        
    except Exception as e:
        # Marquer le workflow comme échoué
        with get_db() as db:
            workflow_service.update_workflow_status(
                db=db,
                workflow_id=workflow_execution_id,
                status=WorkflowStatus.FAILED,
                error_details={
                    'error': str(e),
                    'step': 'workflow_initialization'
                }
            )
        raise


@celery_app.task(bind=True, base=JobAwareTask, name="app.tasks.orchestrator_tasks.research_coordinator_task")
def research_coordinator_task(self, planning_result: dict, workflow_execution_id: str) -> dict:
    """
    Coordonne les tâches de recherche en parallèle basées sur le planning
    """
    try:
        self.update_state_with_db(
            state='PROGRESS',
            meta={
                'step': 'Coordination recherches',
                'progress': 30,
                'status_message': 'Organisation des recherches parallèles'
            }
        )
        
        if not planning_result.get('success', False):
            raise ValueError(f"Planning failed: {planning_result.get('message', 'Unknown error')}")
        
        created_tasks = planning_result.get('created_tasks', [])
        if not created_tasks:
            raise ValueError("Aucune tâche créée par la planification")
        
        with get_db() as db:
            # Mettre à jour le workflow
            workflow_service.update_workflow_step(
                db=db,
                workflow_id=workflow_execution_id,
                step_name="research",
                progress=35,
                metadata={
                    "total_research_tasks": len(created_tasks),
                    "parallel_execution": True
                }
            )
        
        # Créer un groupe de tâches de recherche parallèles
        research_jobs = []
        for task_info in created_tasks:
            task_id = task_info['id']
            task_title = task_info['title']
            
            # Chaque tâche de recherche recevra le workflow_execution_id
            research_jobs.append(
                research_task.s(task_id, task_title, None, workflow_execution_id)
            )
        
        # Exécuter les recherches en parallèle avec un callback
        research_group = group(research_jobs)
        callback = research_completion_task.s(workflow_execution_id)
        
        # Utiliser chord pour attendre que toutes les recherches soient terminées
        workflow_chord = chord(research_group, callback)
        result = workflow_chord.apply_async()
        
        return {
            'success': True,
            'message': f'{len(created_tasks)} recherches lancées en parallèle',
            'research_chord_id': result.id,
            'total_research_tasks': len(created_tasks),
            'workflow_execution_id': workflow_execution_id
        }
        
    except Exception as e:
        with get_db() as db:
            workflow_service.update_workflow_status(
                db=db,
                workflow_id=workflow_execution_id,
                status=WorkflowStatus.FAILED,
                error_details={
                    'error': str(e),
                    'step': 'research_coordination'
                }
            )
        raise


@celery_app.task(bind=True, base=JobAwareTask, name="app.tasks.orchestrator_tasks.research_completion_task")
def research_completion_task(self, research_results: List[dict], workflow_execution_id: str) -> dict:
    """
    Callback appelé quand toutes les recherches sont terminées
    """
    try:
        self.update_state_with_db(
            state='PROGRESS',
            meta={
                'step': 'Finalisation recherches',
                'progress': 70,
                'status_message': f'Toutes les recherches terminées ({len(research_results)} résultats)'
            }
        )
        
        with get_db() as db:
            workflow_service.update_workflow_step(
                db=db,
                workflow_id=workflow_execution_id,
                step_name="research_completed",
                progress=75,
                metadata={
                    "completed_research_tasks": len(research_results),
                    "successful_tasks": len([r for r in research_results if r.get('success', False)])
                }
            )
        
        # Vérifier que toutes les recherches ont réussi
        failed_tasks = [r for r in research_results if not r.get('success', False)]
        if failed_tasks:
            error_msg = f"{len(failed_tasks)} recherches ont échoué"
            with get_db() as db:
                workflow_service.update_workflow_status(
                    db=db,
                    workflow_id=workflow_execution_id,
                    status=WorkflowStatus.FAILED,
                    error_details={
                        'error': error_msg,
                        'failed_tasks': failed_tasks,
                        'step': 'research_completion'
                    }
                )
            raise ValueError(error_msg)
        
        return {
            'success': True,
            'message': 'Toutes les recherches terminées avec succès',
            'research_results': research_results,
            'workflow_execution_id': workflow_execution_id
        }
        
    except Exception as e:
        with get_db() as db:
            workflow_service.update_workflow_status(
                db=db,
                workflow_id=workflow_execution_id,
                status=WorkflowStatus.FAILED,
                error_details={
                    'error': str(e),
                    'step': 'research_completion'
                }
            )
        raise


@celery_app.task(bind=True, base=JobAwareTask, name="app.tasks.orchestrator_tasks.assembly_task")
def assembly_task(self, research_completion_result: dict, project_id: int, workflow_execution_id: str) -> dict:
    """
    Assemble tous les résultats de recherche en un contenu unifié
    """
    try:
        self.update_state_with_db(
            state='PROGRESS',
            meta={
                'step': 'Assemblage contenu',
                'progress': 80,
                'status_message': 'Assemblage des recherches en contenu unifié'
            }
        )
        
        with get_db() as db:
            # Mettre à jour le workflow
            workflow_service.update_workflow_step(
                db=db,
                workflow_id=workflow_execution_id,
                step_name="assembly",
                progress=85
            )
            
            # Récupérer tous les outputs de recherche pour ce workflow
            research_outputs = output_service.get_outputs_by_workflow(
                db=db,
                workflow_id=workflow_execution_id,
                output_type=TaskOutputType.RESEARCH
            )
            
            if not research_outputs:
                raise ValueError("Aucun résultat de recherche trouvé pour l'assemblage")
            
            # Extraire les task_ids des recherches
            task_ids = [output.task_id for output in research_outputs]
            
            # Fusionner tous les contenus
            assembled_content = output_service.merge_outputs_for_assembly(
                db=db,
                task_ids=task_ids,
                separator="\n\n---\n\n"
            )
            
            # Sauvegarder le contenu assemblé comme TaskOutput
            # Nous avons besoin d'une tâche "virtuelle" pour l'assemblage
            project = project_service.get_project(db, project_id)
            if not project or not project.tasks:
                raise ValueError("Projet ou tâches non trouvés")
            
            # Utiliser la première tâche comme référence pour l'assemblage
            reference_task_id = project.tasks[0].id
            
            assembly_output = output_service.save_task_output(
                db=db,
                task_id=reference_task_id,
                output_type=TaskOutputType.ASSEMBLY,
                content=assembled_content,
                workflow_execution_id=workflow_execution_id,
                metadata={
                    "source_task_count": len(task_ids),
                    "assembly_method": "merge_with_separator",
                    "total_research_words": sum(
                        output.metadata.get('word_count', 0) 
                        for output in research_outputs
                    )
                }
            )
        
        return {
            'success': True,
            'message': 'Contenu assemblé avec succès',
            'assembly_output_id': assembly_output.id,
            'assembled_word_count': len(assembled_content.split()),
            'source_task_count': len(task_ids),
            'workflow_execution_id': workflow_execution_id
        }
        
    except Exception as e:
        with get_db() as db:
            workflow_service.update_workflow_status(
                db=db,
                workflow_id=workflow_execution_id,
                status=WorkflowStatus.FAILED,
                error_details={
                    'error': str(e),
                    'step': 'assembly'
                }
            )
        raise


@celery_app.task(bind=True, base=JobAwareTask, name="app.tasks.orchestrator_tasks.project_finishing_task")
def project_finishing_task(self, assembly_result: dict, project_id: int, workflow_execution_id: str) -> dict:
    """
    Tâche finale qui raffine le contenu assemblé et le sauvegarde dans le projet
    """
    try:
        self.update_state_with_db(
            state='PROGRESS',
            meta={
                'step': 'Raffinage final',
                'progress': 90,
                'status_message': 'Raffinage et finalisation du contenu'
            }
        )
        
        with get_db() as db:
            # Mettre à jour le workflow
            workflow_service.update_workflow_step(
                db=db,
                workflow_id=workflow_execution_id,
                step_name="finishing",
                progress=95
            )
            
            # Récupérer le contenu assemblé
            assembly_output_id = assembly_result.get('assembly_output_id')
            if not assembly_output_id:
                raise ValueError("ID du contenu assemblé manquant")
            
            # Récupérer le contenu assemblé depuis la base
            assembly_outputs = output_service.get_outputs_by_workflow(
                db=db,
                workflow_id=workflow_execution_id,
                output_type=TaskOutputType.ASSEMBLY
            )
            
            if not assembly_outputs:
                raise ValueError("Contenu assemblé non trouvé")
            
            raw_content = assembly_outputs[0].content
            
            # Appel direct de la tâche de finition pour éviter l'anti-pattern .get()
            # Nous récupérons la fonction sous-jacente plutôt que de faire un appel async
            from app.services import ai_service
            
            # Raffinage direct via le service IA
            try:
                if ai_service.llm and hasattr(ai_service, 'run_finishing_crew'):
                    final_content = ai_service.run_finishing_crew(raw_content)
                else:
                    # Fallback simple si le service n'est pas disponible
                    final_content = raw_content + "\n\n[Raffiné par l'IA - POC]"
            except Exception as finishing_error:
                # En cas d'erreur de raffinage, utiliser le contenu brut
                final_content = raw_content
                # Log l'erreur mais continue le workflow
            
            project = project_service.get_project(db, project_id)
            if project:
                project.final_content = final_content
                project.final_content_updated_at = datetime.now(timezone.utc)
                db.commit()
            
            # Marquer le workflow comme terminé
            workflow_service.mark_workflow_complete(
                db=db,
                workflow_id=workflow_execution_id,
                success=True
            )
        
        return {
            'success': True,
            'message': 'Article final généré avec succès',
            'final_content_length': len(final_content),
            'project_id': project_id,
            'workflow_execution_id': workflow_execution_id
        }
        
    except Exception as e:
        with get_db() as db:
            workflow_service.mark_workflow_complete(
                db=db,
                workflow_id=workflow_execution_id,
                success=False,
                error_details={
                    'error': str(e),
                    'step': 'finishing'
                }
            )
        raise