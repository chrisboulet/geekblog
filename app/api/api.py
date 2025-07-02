from fastapi import APIRouter
from app.api.endpoints import projects, tasks, jobs

api_router = APIRouter()

api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
