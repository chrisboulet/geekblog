#!/usr/bin/env python3
"""
Script d'initialisation de la base de données SQLite
Sprint 1 - Database Migration
"""

import os
import sys
import logging
from pathlib import Path

# Ajouter le répertoire parent au PYTHONPATH
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.db.config import engine, get_database_type
from app.models.models import Base
from app.models.job_models import AsyncJob
from app.models.workflow_models import WorkflowExecution, TaskOutput

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def create_sqlite_database():
    """
    Crée la base de données SQLite avec toutes les tables
    """
    try:
        logger.info("🚀 Initialisation de la base de données SQLite...")
        
        # Vérifier le type de base de données
        db_type = get_database_type()
        logger.info(f"📊 Type de base de données détecté: {db_type}")
        
        if db_type != "sqlite":
            logger.warning(f"⚠️  Type de DB non-SQLite détecté: {db_type}")
            return False
        
        # Créer toutes les tables
        logger.info("🏗️  Création des tables...")
        Base.metadata.create_all(bind=engine)
        
        logger.info("✅ Base de données SQLite initialisée avec succès!")
        logger.info(f"📍 Localisation: {engine.url}")
        
        # Vérifier les tables créées
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        logger.info(f"📋 Tables créées ({len(tables)}):")
        for table in sorted(tables):
            logger.info(f"  - {table}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de l'initialisation: {e}")
        return False


def verify_sqlite_setup():
    """
    Vérifie que la configuration SQLite fonctionne
    """
    try:
        logger.info("🔍 Vérification de la configuration SQLite...")
        
        # Test de connexion
        with engine.connect() as conn:
            result = conn.execute("SELECT 1 as test")
            test_value = result.fetchone()[0]
            
            if test_value == 1:
                logger.info("✅ Connexion SQLite fonctionnelle!")
                return True
            else:
                logger.error("❌ Test de connexion échoué")
                return False
                
    except Exception as e:
        logger.error(f"❌ Erreur de vérification: {e}")
        return False


def main():
    """
    Point d'entrée principal
    """
    logger.info("=" * 50)
    logger.info("🎯 SPRINT 1 - DATABASE MIGRATION")
    logger.info("📝 Initialisation SQLite")
    logger.info("=" * 50)
    
    # Créer la base de données
    if not create_sqlite_database():
        logger.error("❌ Échec de l'initialisation")
        sys.exit(1)
    
    # Vérifier la configuration
    if not verify_sqlite_setup():
        logger.error("❌ Échec de la vérification")
        sys.exit(1)
    
    logger.info("🎉 Initialisation SQLite terminée avec succès!")
    logger.info("▶️  L'application peut maintenant être démarrée avec SQLite")


if __name__ == "__main__":
    main()