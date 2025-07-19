"""Add foreign key constraints to AsyncJob

Revision ID: 0004
Revises: 0003
Create Date: 2025-07-05

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add foreign key constraints to async_jobs table

    # Check if the constraints already exist before adding them
    conn = op.get_bind()
    result = conn.execute(
        sa.text("""
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name='async_jobs'
        AND constraint_type='FOREIGN KEY'
    """)
    )
    existing_constraints = [row[0] for row in result]

    # Add foreign key for project_id if not exists
    if "async_jobs_project_id_fkey" not in existing_constraints:
        op.create_foreign_key(
            "async_jobs_project_id_fkey",
            "async_jobs",
            "projects",
            ["project_id"],
            ["id"],
            ondelete="SET NULL",
        )

    # Add foreign key for task_id if not exists
    if "async_jobs_task_id_fkey" not in existing_constraints:
        op.create_foreign_key(
            "async_jobs_task_id_fkey",
            "async_jobs",
            "tasks",
            ["task_id"],
            ["id"],
            ondelete="SET NULL",
        )

    # Add foreign key for workflow_execution_id if not exists
    if "async_jobs_workflow_execution_id_fkey" not in existing_constraints:
        op.create_foreign_key(
            "async_jobs_workflow_execution_id_fkey",
            "async_jobs",
            "workflow_executions",
            ["workflow_execution_id"],
            ["id"],
            ondelete="SET NULL",
        )

    # Add foreign key for parent_job_id (self-referential) if not exists
    if "async_jobs_parent_job_id_fkey" not in existing_constraints:
        op.create_foreign_key(
            "async_jobs_parent_job_id_fkey",
            "async_jobs",
            "async_jobs",
            ["parent_job_id"],
            ["id"],
            ondelete="SET NULL",
        )


def downgrade() -> None:
    # Remove foreign key constraints
    op.drop_constraint(
        "async_jobs_parent_job_id_fkey", "async_jobs", type_="foreignkey"
    )
    op.drop_constraint(
        "async_jobs_workflow_execution_id_fkey", "async_jobs", type_="foreignkey"
    )
    op.drop_constraint("async_jobs_task_id_fkey", "async_jobs", type_="foreignkey")
    op.drop_constraint("async_jobs_project_id_fkey", "async_jobs", type_="foreignkey")
