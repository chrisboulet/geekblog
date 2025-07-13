"""
Type mappings for converting SQLAlchemy types to TypeScript and Zod schemas.
Used by generate_types.py for automated type generation.
"""

from sqlalchemy.sql.sqltypes import (
    Integer,
    BigInteger,
    String,
    Text,
    Boolean,
    DateTime,
    JSON,
    Enum,
)
from sqlalchemy.dialects.postgresql import UUID

# Type mapping from SQLAlchemy to TypeScript/Zod
TYPE_MAPPINGS = {
    Integer: {"ts": "number", "zod": "z.number().int()"},
    BigInteger: {"ts": "number", "zod": "z.number().int()"},
    String: {"ts": "string", "zod": "z.string()"},
    Text: {"ts": "string", "zod": "z.string()"},
    Boolean: {"ts": "boolean", "zod": "z.boolean()"},
    DateTime: {"ts": "string", "zod": "z.string().datetime()"},
    JSON: {"ts": "Record<string, unknown>", "zod": "z.record(z.string(), z.unknown())"},
    UUID: {"ts": "string", "zod": "z.string().uuid()"},
}


def get_typescript_type(column_type, nullable=False):
    """Get TypeScript type for a SQLAlchemy column type."""
    type_info = TYPE_MAPPINGS.get(type(column_type))

    if not type_info:
        # Default fallback for unknown types
        ts_type = "unknown"
    else:
        ts_type = type_info["ts"]

        # Handle string length constraints
        if isinstance(column_type, String) and column_type.length:
            # Keep as string but add comment about max length
            pass

    # Add null union if nullable
    if nullable:
        ts_type = f"{ts_type} | null"

    return ts_type


def get_zod_schema(column_type, nullable=False, length=None):
    """Get Zod schema for a SQLAlchemy column type."""
    type_info = TYPE_MAPPINGS.get(type(column_type))

    if not type_info:
        # Default fallback for unknown types
        zod_schema = "z.unknown()"
    else:
        zod_schema = type_info["zod"]

        # Handle string length constraints
        if isinstance(column_type, String) and column_type.length:
            if zod_schema.startswith("z.string()"):
                zod_schema = f"z.string().max({column_type.length})"

        # Handle Enum types
        if isinstance(column_type, Enum):
            enum_values = ", ".join([f"'{v}'" for v in column_type.enums])
            zod_schema = f"z.enum([{enum_values}])"

    # Add nullable modifier if needed
    if nullable:
        zod_schema = f"{zod_schema}.nullable()"

    return zod_schema


def should_include_column(column):
    """Determine if a column should be included in generated types."""
    # Skip foreign key columns that are covered by relationships
    if column.foreign_keys:
        return False

    # Include all other columns
    return True


def get_relationship_type(relationship, model_name):
    """Get TypeScript type for a relationship."""
    related_model = relationship.mapper.class_.__name__

    if relationship.uselist:
        # One-to-many or many-to-many relationship
        return f"{related_model}[]"
    else:
        # One-to-one or many-to-one relationship
        return f"{related_model} | null"


# Export commonly used defaults
DEFAULT_TS_TYPE = "unknown"
DEFAULT_ZOD_SCHEMA = "z.unknown()"

# Header template for generated files
FILE_HEADER = """// AUTO-GENERATED - DO NOT EDIT
// Generated from SQLAlchemy models by scripts/generate_types.py
// Last generated: {timestamp}

"""

# Comment templates
INTERFACE_COMMENT = """/**
 * {model_name} interface generated from SQLAlchemy model
 * Table: {table_name}
 */"""

SCHEMA_COMMENT = """/**
 * {model_name} Zod schema for runtime validation
 * Generated from SQLAlchemy model: {table_name}
 */"""
