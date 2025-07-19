"""Rename metadata columns for clarity

Revision ID: fbf99f4b2720
Revises: '9de596f44a2b'
Create Date: 2025-07-05 13:22:31.235774

"""

from alembic import op
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "fbf99f4b2720"
down_revision = "9de596f44a2b"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Rename metadata columns to avoid SQLAlchemy reserved word conflicts
    op.alter_column(
        "async_jobs",
        "metadata",
        new_column_name="job_metadata",
        existing_type=postgresql.JSON,
    )
    op.alter_column(
        "task_outputs",
        "metadata",
        new_column_name="output_metadata",
        existing_type=postgresql.JSON,
    )
    op.alter_column(
        "workflow_executions",
        "metadata",
        new_column_name="workflow_metadata",
        existing_type=postgresql.JSON,
    )


def downgrade() -> None:
    # Revert column renames
    op.alter_column(
        "workflow_executions",
        "workflow_metadata",
        new_column_name="metadata",
        existing_type=postgresql.JSON,
    )
    op.alter_column(
        "task_outputs",
        "output_metadata",
        new_column_name="metadata",
        existing_type=postgresql.JSON,
    )
    op.alter_column(
        "async_jobs",
        "job_metadata",
        new_column_name="metadata",
        existing_type=postgresql.JSON,
    )
