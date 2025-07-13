"""Add default project seed data

Revision ID: 9de596f44a2b
Revises: '0004'
Create Date: 2025-07-05 13:12:03.966749

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "9de596f44a2b"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add a default project for development/testing
    projects_table = sa.table(
        "projects",
        sa.column("id", sa.Integer),
        sa.column("name", sa.String),
        sa.column("description", sa.Text),
    )

    # Check if project with id=1 already exists
    conn = op.get_bind()
    result = conn.execute(sa.text("SELECT COUNT(*) FROM projects WHERE id = 1"))
    count = result.scalar()

    if count == 0:
        op.bulk_insert(
            projects_table,
            [
                {
                    "id": 1,
                    "name": "My First GeekBlog Project",
                    "description": "Welcome to GeekBlog! This is your first project. You can create tasks, delegate them to AI agents, and manage your content creation workflow.",
                }
            ],
        )


def downgrade() -> None:
    # Seeding migrations should not be destructive.
    # If this project needs to be removed, it should be done manually.
    pass
