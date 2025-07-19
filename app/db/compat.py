"""
Couche de compatibilité base de données pour SQLite/PostgreSQL
Sprint 1 - Database Migration
"""

from sqlalchemy import (
    String,
    DateTime,
    func,
    TypeDecorator,
    JSON as SQLAlchemyJSON,
    Text,
    Enum as SQLAlchemyEnum,
    CheckConstraint,
)
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON
from sqlalchemy.dialects.postgresql import JSON as PostgreSQLJSON
import json
import enum
from typing import Type, Any
from app.db.config import get_database_type


class CompatJSON(TypeDecorator):
    """
    Type JSON compatible SQLite/PostgreSQL
    """
    impl = Text
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'sqlite':
            return dialect.type_descriptor(Text())
        elif dialect.name == 'postgresql':
            return dialect.type_descriptor(PostgreSQLJSON())
        else:
            return dialect.type_descriptor(Text())

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if dialect.name == 'sqlite':
            return json.dumps(value, ensure_ascii=False)
        return value

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if dialect.name == 'sqlite':
            try:
                return json.loads(value)
            except (ValueError, TypeError):
                return value
        return value


def get_datetime_func():
    """
    Retourne la fonction datetime appropriée selon le type de DB
    """
    db_type = get_database_type()
    if db_type == "sqlite":
        return func.current_timestamp()
    else:
        return func.now()


def get_json_type():
    """
    Retourne le type JSON approprié selon le type de DB
    """
    db_type = get_database_type()
    if db_type == "sqlite":
        return CompatJSON()
    else:
        return SQLAlchemyJSON()


def get_datetime_column_type():
    """
    Retourne le type DateTime approprié selon le type de DB
    """
    db_type = get_database_type()
    if db_type == "sqlite":
        # SQLite ne supporte pas timezone=True nativement
        return DateTime()
    else:
        return DateTime(timezone=True)


class CompatEnum(TypeDecorator):
    """
    Type Enum compatible SQLite/PostgreSQL
    SQLite stocke les enums comme des strings avec contraintes CHECK
    PostgreSQL utilise des enums natifs
    """
    impl = String
    cache_ok = True
    
    def __init__(self, enum_class: Type[enum.Enum], **kwargs):
        self.enum_class = enum_class
        self.valid_values = [e.value for e in enum_class]
        super().__init__(**kwargs)
    
    def load_dialect_impl(self, dialect):
        if dialect.name == 'sqlite':
            return dialect.type_descriptor(String())
        elif dialect.name == 'postgresql':
            return dialect.type_descriptor(SQLAlchemyEnum(self.enum_class))
        else:
            return dialect.type_descriptor(String())
    
    def process_bind_param(self, value: Any, dialect) -> str:
        """Convert enum to appropriate format for storage"""
        if value is None:
            return None
        if isinstance(value, self.enum_class):
            return value.value
        if isinstance(value, str) and value in self.valid_values:
            return value
        raise ValueError(f"Invalid value {value} for enum {self.enum_class.__name__}")
    
    def process_result_value(self, value: str, dialect) -> enum.Enum:
        """Convert stored value back to enum"""
        if value is None:
            return None
        return self.enum_class(value)


def get_enum_type(enum_class: Type[enum.Enum]):
    """
    Retourne le type Enum approprié selon le type de DB
    """
    db_type = get_database_type()
    if db_type == "sqlite":
        return CompatEnum(enum_class)
    else:
        return SQLAlchemyEnum(enum_class)


def get_enum_check_constraint(column_name: str, enum_class: Type[enum.Enum]) -> CheckConstraint:
    """
    Génère une contrainte CHECK pour la validation des enums SQLite
    """
    db_type = get_database_type()
    if db_type == "sqlite":
        valid_values = [e.value for e in enum_class]
        constraint_expr = f"{column_name} IN ({', '.join(repr(v) for v in valid_values)})"
        return CheckConstraint(constraint_expr, name=f"ck_{column_name}_valid")
    return None  # PostgreSQL n'a pas besoin de contraintes CHECK pour les enums


# Types standardisés pour l'ensemble de l'application
JSON = get_json_type()
DateTimeFunc = get_datetime_func()
DateTimeType = get_datetime_column_type()