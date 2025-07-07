from fastapi import APIRouter
from app.api.endpoints import projects, tasks, jobs, project_management, templates, health

api_router = APIRouter()

# Health check endpoints (no prefix for easy access)
api_router.include_router(health.router, tags=["Health"])

# Business endpoints
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(project_management.router, prefix="/projects", tags=["Project Management"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
api_router.include_router(templates.router, prefix="/templates", tags=["Templates"])
