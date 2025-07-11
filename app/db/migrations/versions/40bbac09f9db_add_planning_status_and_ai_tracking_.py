"""Add planning status and AI tracking fields

Revision ID: 40bbac09f9db
Revises: '61880637b235'
Create Date: 2025-07-11 03:58:44.225637

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '40bbac09f9db'
down_revision = '61880637b235'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add planning status fields to projects table
    op.add_column('projects', sa.Column('planning_status', sa.String(), nullable=False, server_default='NOT_STARTED'))
    op.add_column('projects', sa.Column('planning_job_id', sa.String(), nullable=True))
    
    # Add AI tracking fields to tasks table
    op.add_column('tasks', sa.Column('created_by_ai', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('tasks', sa.Column('last_updated_by_ai_at', sa.DateTime(timezone=True), nullable=True))
    
    # Add index for planning status queries
    op.create_index('idx_planning_status', 'projects', ['planning_status'])


def downgrade() -> None:
    # Remove planning status index and fields
    op.drop_index('idx_planning_status', table_name='projects')
    op.drop_column('projects', 'planning_job_id')
    op.drop_column('projects', 'planning_status')
    
    # Remove AI tracking fields from tasks
    op.drop_column('tasks', 'last_updated_by_ai_at')
    op.drop_column('tasks', 'created_by_ai')
