"""Add workflow orchestration tables

Revision ID: 0003
Revises: 0002
Create Date: 2025-07-02 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '0003'
down_revision: Union[str, None] = '0002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create workflow_executions table
    op.create_table('workflow_executions',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('project_id', sa.Integer(), nullable=False),
    sa.Column('workflow_type', sa.Enum('FULL_ARTICLE', 'RESEARCH_ONLY', 'WRITING_ONLY', 'CUSTOM', name='workflowtype'), nullable=False),
    sa.Column('status', sa.Enum('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', name='workflowstatus'), nullable=False, server_default='PENDING'),
    sa.Column('current_step', sa.JSON(), nullable=True),
    sa.Column('total_steps', sa.Integer(), nullable=True, server_default='4'),
    sa.Column('metadata', sa.JSON(), nullable=True),
    sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('error_details', sa.JSON(), nullable=True),
    sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_workflow_project_status', 'workflow_executions', ['project_id', 'status'], unique=False)
    op.create_index('idx_workflow_started', 'workflow_executions', ['started_at'], unique=False)
    
    # Create task_outputs table
    op.create_table('task_outputs',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('task_id', sa.Integer(), nullable=False),
    sa.Column('workflow_execution_id', sa.String(), nullable=True),
    sa.Column('output_type', sa.Enum('RESEARCH', 'WRITING', 'PLANNING', 'ASSEMBLY', 'FINISHING', name='taskoutputtype'), nullable=False),
    sa.Column('content', sa.Text(), nullable=False),
    sa.Column('content_hash', sa.String(length=64), nullable=True),
    sa.Column('metadata', sa.JSON(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ),
    sa.ForeignKeyConstraint(['workflow_execution_id'], ['workflow_executions.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_output_task_type', 'task_outputs', ['task_id', 'output_type'], unique=False)
    op.create_index('idx_output_workflow', 'task_outputs', ['workflow_execution_id'], unique=False)
    op.create_index('idx_output_created', 'task_outputs', ['created_at'], unique=False)
    op.create_index('idx_output_hash', 'task_outputs', ['content_hash'], unique=False)
    
    # Add columns to async_jobs
    op.add_column('async_jobs', sa.Column('workflow_execution_id', sa.String(), nullable=True))
    op.add_column('async_jobs', sa.Column('parent_job_id', sa.String(), nullable=True))
    
    # Add foreign key constraints for async_jobs
    op.create_foreign_key('fk_async_jobs_workflow', 'async_jobs', 'workflow_executions', ['workflow_execution_id'], ['id'])
    op.create_foreign_key('fk_async_jobs_parent', 'async_jobs', 'async_jobs', ['parent_job_id'], ['id'])
    
    # Add indexes for async_jobs
    op.create_index('idx_async_jobs_workflow', 'async_jobs', ['workflow_execution_id'], unique=False)
    op.create_index('idx_async_jobs_parent', 'async_jobs', ['parent_job_id'], unique=False)
    
    # Add final_content column to projects for storing assembled articles
    op.add_column('projects', sa.Column('final_content', sa.Text(), nullable=True))
    op.add_column('projects', sa.Column('final_content_updated_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    # Remove columns from projects
    op.drop_column('projects', 'final_content_updated_at')
    op.drop_column('projects', 'final_content')
    
    # Remove indexes and foreign keys from async_jobs
    op.drop_index('idx_async_jobs_parent', table_name='async_jobs')
    op.drop_index('idx_async_jobs_workflow', table_name='async_jobs')
    op.drop_constraint('fk_async_jobs_parent', 'async_jobs', type_='foreignkey')
    op.drop_constraint('fk_async_jobs_workflow', 'async_jobs', type_='foreignkey')
    
    # Remove columns from async_jobs
    op.drop_column('async_jobs', 'parent_job_id')
    op.drop_column('async_jobs', 'workflow_execution_id')
    
    # Drop task_outputs table
    op.drop_index('idx_output_hash', table_name='task_outputs')
    op.drop_index('idx_output_created', table_name='task_outputs')
    op.drop_index('idx_output_workflow', table_name='task_outputs')
    op.drop_index('idx_output_task_type', table_name='task_outputs')
    op.drop_table('task_outputs')
    
    # Drop workflow_executions table
    op.drop_index('idx_workflow_started', table_name='workflow_executions')
    op.drop_index('idx_workflow_project_status', table_name='workflow_executions')
    op.drop_table('workflow_executions')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS taskoutputtype')
    op.execute('DROP TYPE IF EXISTS workflowstatus')
    op.execute('DROP TYPE IF EXISTS workflowtype')