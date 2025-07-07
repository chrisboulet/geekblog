"""Add project management extensions

Revision ID: 2025_07_06_0005
Revises: fbf99f4b2720
Create Date: 2025-07-06 15:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2025_07_06_0005'
down_revision = 'fbf99f4b2720'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Ajoute les extensions pour la gestion avancée des projets :
    - archived : Boolean pour archivage
    - archived_at : DateTime pour timestamp d'archivage
    - settings : JSON pour paramètres configurables
    - tags : String pour tags CSV
    """
    # Ajout des nouvelles colonnes au modèle Project
    op.add_column('projects', sa.Column('archived', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('projects', sa.Column('archived_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('projects', sa.Column('settings', sa.JSON(), nullable=True))
    op.add_column('projects', sa.Column('tags', sa.String(), nullable=True))
    
    # Ajout d'index pour les performances
    op.create_index('idx_projects_archived', 'projects', ['archived'])
    op.create_index('idx_projects_tags', 'projects', ['tags'])


def downgrade() -> None:
    """
    Supprime les extensions de gestion des projets
    """
    # Suppression des index
    op.drop_index('idx_projects_tags', table_name='projects')
    op.drop_index('idx_projects_archived', table_name='projects')
    
    # Suppression des colonnes
    op.drop_column('projects', 'tags')
    op.drop_column('projects', 'settings')
    op.drop_column('projects', 'archived_at')
    op.drop_column('projects', 'archived')