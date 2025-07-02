"""
Configuration Celery pour les tâches asynchrones
"""
import os
from celery import Celery
from kombu import Queue

# Configuration Redis pour Celery
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Création de l'instance Celery
celery_app = Celery(
    "geekblog_tasks",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.tasks.ai_tasks"]
)

# Configuration Celery
celery_app.conf.update(
    # Sérialisation
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    
    # Queues avec priorités
    task_routes={
        "app.tasks.ai_tasks.planning_task": {"queue": "high"},
        "app.tasks.ai_tasks.research_task": {"queue": "medium"},
        "app.tasks.ai_tasks.writing_task": {"queue": "medium"},
        "app.tasks.ai_tasks.finishing_task": {"queue": "low"},
    },
    
    # Configuration des queues
    task_default_queue="default",
    task_queues=(
        Queue("high", routing_key="high"),
        Queue("medium", routing_key="medium"),
        Queue("low", routing_key="low"),
        Queue("default", routing_key="default"),
    ),
    
    # Retry et timeouts
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_default_retry_delay=60,  # 1 minute
    task_max_retries=3,
    
    # Résultats
    result_expires=3600,  # 1 heure
    result_backend_transport_options={
        'visibility_timeout': 3600,
        'retry_policy': {
            'timeout': 5.0
        }
    }
)

# Configuration pour le développement
if os.getenv("CELERY_EAGER", "false").lower() == "true":
    # Mode synchrone pour les tests
    celery_app.conf.update(
        task_always_eager=True,
        task_eager_propagates=True,
    )