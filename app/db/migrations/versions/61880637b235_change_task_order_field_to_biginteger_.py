"""Change task order field to BigInteger for timestamp support

Revision ID: 61880637b235
Revises: a873b24bd326
Create Date: 2025-07-11 02:11:10.833941

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "61880637b235"
down_revision = "a873b24bd326"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Change order column from INTEGER to BIGINT
    op.alter_column("tasks", "order", type_=sa.BigInteger(), existing_type=sa.Integer())


def downgrade() -> None:
    # Revert order column from BIGINT to INTEGER
    op.alter_column("tasks", "order", type_=sa.Integer(), existing_type=sa.BigInteger())
