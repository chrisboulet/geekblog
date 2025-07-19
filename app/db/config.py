import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

load_dotenv()

# Détection automatique du type de base de données
DATABASE_URL = os.getenv("DATABASE_URL")

# Configuration par défaut pour SQLite (Sprint 1 - Database Migration)
if not DATABASE_URL:
    # Utilise SQLite par défaut
    SQLITE_DB_PATH = os.getenv("SQLITE_DB_PATH", "data/geekblog.db")
    
    # Crée le répertoire data s'il n'existe pas
    os.makedirs(os.path.dirname(SQLITE_DB_PATH), exist_ok=True)
    
    DATABASE_URL = f"sqlite:///{SQLITE_DB_PATH}"

# Configuration du moteur SQLAlchemy avec optimisations SQLite
if DATABASE_URL.startswith("sqlite"):
    # Configuration spécifique SQLite
    engine = create_engine(
        DATABASE_URL,
        echo=False,  # Debug SQL
        connect_args={
            "check_same_thread": False,  # Nécessaire pour FastAPI
            "timeout": 20,  # Timeout de connexion
        }
    )
else:
    # Configuration PostgreSQL (production)
    engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Générateur de session de base de données"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_database_type():
    """Retourne le type de base de données utilisé"""
    return "sqlite" if DATABASE_URL.startswith("sqlite") else "postgresql"
