"""
Tests for SQLite compatibility layer
Sprint 1: Database Migration - Validation des adaptations
"""

import pytest
import tempfile
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.config import Base
from app.db.compat import get_enum_type, CompatEnum
from app.models.workflow_models import (
    WorkflowType, 
    WorkflowStatus, 
    TaskOutputType,
    WorkflowExecution,
    TaskOutput
)
from app.models.models import Project, Task


@pytest.fixture
def sqlite_engine():
    """Create a temporary SQLite database for testing"""
    # Create temporary database file
    db_fd, db_path = tempfile.mkstemp(suffix='.db')
    os.close(db_fd)
    
    # Create engine with SQLite
    engine = create_engine(f"sqlite:///{db_path}", echo=False)
    
    # Create all tables
    Base.metadata.create_all(engine)
    
    yield engine
    
    # Cleanup
    os.unlink(db_path)


@pytest.fixture
def sqlite_session(sqlite_engine):
    """Create a database session for testing"""
    SessionLocal = sessionmaker(bind=sqlite_engine)
    session = SessionLocal()
    yield session
    session.close()


class TestEnumCompatibility:
    """Test enum compatibility between PostgreSQL and SQLite"""
    
    def test_enum_type_creation(self):
        """Test that enum types are created correctly"""
        workflow_type = get_enum_type(WorkflowType)
        assert isinstance(workflow_type, CompatEnum)
        assert workflow_type.enum_class == WorkflowType
        assert "full_article" in workflow_type.valid_values
    
    def test_enum_bind_param(self):
        """Test enum value binding"""
        enum_type = get_enum_type(WorkflowType)
        
        # Test enum value
        result = enum_type.process_bind_param(WorkflowType.FULL_ARTICLE, None)
        assert result == "full_article"
        
        # Test string value
        result = enum_type.process_bind_param("research_only", None)
        assert result == "research_only"
        
        # Test None
        result = enum_type.process_bind_param(None, None)
        assert result is None
        
        # Test invalid value
        with pytest.raises(ValueError):
            enum_type.process_bind_param("invalid_value", None)
    
    def test_enum_result_value(self):
        """Test enum value retrieval"""
        enum_type = get_enum_type(WorkflowType)
        
        # Test string to enum conversion
        result = enum_type.process_result_value("full_article", None)
        assert result == WorkflowType.FULL_ARTICLE
        assert isinstance(result, WorkflowType)
        
        # Test None
        result = enum_type.process_result_value(None, None)
        assert result is None


class TestWorkflowModels:
    """Test workflow models with SQLite"""
    
    def test_create_project_and_workflow(self, sqlite_session):
        """Test creating a project and workflow execution"""
        # Create a project
        project = Project(
            name="Test Project",
            description="Test description"
        )
        sqlite_session.add(project)
        sqlite_session.commit()
        
        # Create a workflow execution
        workflow = WorkflowExecution(
            project_id=project.id,
            workflow_type=WorkflowType.FULL_ARTICLE,
            status=WorkflowStatus.PENDING
        )
        sqlite_session.add(workflow)
        sqlite_session.commit()
        
        # Verify the workflow was created
        retrieved_workflow = sqlite_session.query(WorkflowExecution).first()
        assert retrieved_workflow is not None
        assert retrieved_workflow.workflow_type == WorkflowType.FULL_ARTICLE
        assert retrieved_workflow.status == WorkflowStatus.PENDING
        assert retrieved_workflow.project_id == project.id
    
    def test_create_task_output(self, sqlite_session):
        """Test creating task outputs with enums"""
        # Create project and task
        project = Project(name="Test Project")
        sqlite_session.add(project)
        sqlite_session.commit()
        
        task = Task(
            project_id=project.id,
            title="Test Task",
            description="Test description"
        )
        sqlite_session.add(task)
        sqlite_session.commit()
        
        # Create task output
        output = TaskOutput(
            task_id=task.id,
            output_type=TaskOutputType.RESEARCH,
            content="Test research content"
        )
        sqlite_session.add(output)
        sqlite_session.commit()
        
        # Verify the output was created
        retrieved_output = sqlite_session.query(TaskOutput).first()
        assert retrieved_output is not None
        assert retrieved_output.output_type == TaskOutputType.RESEARCH
        assert retrieved_output.content == "Test research content"
    
    def test_enum_status_updates(self, sqlite_session):
        """Test updating enum status values"""
        # Create workflow
        project = Project(name="Test Project")
        sqlite_session.add(project)
        sqlite_session.commit()
        
        workflow = WorkflowExecution(
            project_id=project.id,
            workflow_type=WorkflowType.FULL_ARTICLE,
            status=WorkflowStatus.PENDING
        )
        sqlite_session.add(workflow)
        sqlite_session.commit()
        
        # Update status
        workflow.status = WorkflowStatus.RUNNING
        sqlite_session.commit()
        
        # Verify update
        retrieved_workflow = sqlite_session.query(WorkflowExecution).first()
        assert retrieved_workflow.status == WorkflowStatus.RUNNING
        
        # Update to completed
        workflow.status = WorkflowStatus.COMPLETED
        sqlite_session.commit()
        
        # Verify final status
        retrieved_workflow = sqlite_session.query(WorkflowExecution).first()
        assert retrieved_workflow.status == WorkflowStatus.COMPLETED


class TestJSONCompatibility:
    """Test JSON field compatibility"""
    
    def test_json_storage_retrieval(self, sqlite_session):
        """Test JSON field storage and retrieval"""
        # Create project with JSON settings
        project = Project(
            name="Test Project",
            settings={
                "theme": "dark",
                "language": "fr",
                "notifications": True,
                "tags": ["tech", "ai"]
            },
            tags="tech,ai,programming"
        )
        sqlite_session.add(project)
        sqlite_session.commit()
        
        # Retrieve and verify
        retrieved_project = sqlite_session.query(Project).first()
        assert retrieved_project.settings["theme"] == "dark"
        assert retrieved_project.settings["notifications"] is True
        assert "ai" in retrieved_project.settings["tags"]
    
    def test_workflow_metadata(self, sqlite_session):
        """Test workflow metadata JSON storage"""
        # Create project and workflow with metadata
        project = Project(name="Test Project")
        sqlite_session.add(project)
        sqlite_session.commit()
        
        workflow = WorkflowExecution(
            project_id=project.id,
            workflow_type=WorkflowType.CUSTOM,
            workflow_metadata={
                "custom_steps": ["research", "analysis", "writing"],
                "options": {
                    "include_images": True,
                    "target_length": 2000
                }
            }
        )
        sqlite_session.add(workflow)
        sqlite_session.commit()
        
        # Verify metadata
        retrieved_workflow = sqlite_session.query(WorkflowExecution).first()
        assert retrieved_workflow.workflow_metadata["custom_steps"][0] == "research"
        assert retrieved_workflow.workflow_metadata["options"]["include_images"] is True