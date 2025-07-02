"""
Configuration de test globale pour GeekBlog
Fournit les fixtures partagées pour tous les tests
"""
import os
import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.config import get_db, Base
from app.models.models import Project, Task

# Configuration de la base de données de test
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session")
def db_engine():
    """Engine de base de données pour les tests"""
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(db_engine):
    """Session de base de données isolée par test"""
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db_session):
    """Client de test FastAPI avec base de données mockée"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_project(db_session) -> Project:
    """Projet d'exemple pour les tests"""
    project = Project(
        name="Test Project",
        description="A test project for integration testing"
    )
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)
    return project


@pytest.fixture
def sample_task(db_session, sample_project) -> Task:
    """Tâche d'exemple pour les tests"""
    task = Task(
        project_id=sample_project.id,
        title="Test Task",
        description="A test task",
        status="À faire",
        order=1
    )
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)
    return task


@pytest.fixture
def multiple_tasks(db_session, sample_project) -> list[Task]:
    """Plusieurs tâches pour tester les opérations en lot"""
    tasks = []
    statuses = ["À faire", "En cours", "Révision", "Terminé"]
    
    for i, status in enumerate(statuses):
        task = Task(
            project_id=sample_project.id,
            title=f"Task {i+1}",
            description=f"Description for task {i+1}",
            status=status,
            order=i+1
        )
        db_session.add(task)
        tasks.append(task)
    
    db_session.commit()
    for task in tasks:
        db_session.refresh(task)
    
    return tasks