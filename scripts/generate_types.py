#!/usr/bin/env python3
"""
Automated TypeScript type generation from SQLAlchemy models.
Generates TypeScript interfaces and Zod validation schemas.

Usage:
    python scripts/generate_types.py

Output:
    - src/types/generated/models.ts (TypeScript interfaces)
    - src/types/generated/schemas.ts (Zod validation schemas)
"""

import sys
from datetime import datetime
from pathlib import Path
from typing import List, Any


def setup_path():
    """Add project root to path for imports."""
    project_root = Path(__file__).parent.parent
    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))


def discover_sqlalchemy_models():
    """
    Discover all SQLAlchemy models in the project.
    Returns list of model classes to generate types for.
    """
    models = []

    try:
        # Import all model modules
        from app.models.models import Project, Task, BlogTemplate
        from app.models.workflow_models import WorkflowExecution, TaskOutput
        from app.models.job_models import AsyncJob

        # Add discovered models
        models.extend(
            [Project, Task, BlogTemplate, WorkflowExecution, TaskOutput, AsyncJob]
        )

        print(f"✅ Discovered {len(models)} SQLAlchemy models")
        return models

    except ImportError as e:
        print(f"❌ Error importing models: {e}")
        print(
            "💡 Make sure you're running from project root and virtual environment is activated"
        )
        sys.exit(1)


def generate_typescript_interface(model_class) -> str:
    """Generate TypeScript interface from SQLAlchemy model."""
    # Import here to avoid module-level import order issues
    from sqlalchemy.inspection import inspect as sqlalchemy_inspect
    from sqlalchemy.orm import class_mapper
    from scripts.type_mappings import (
        INTERFACE_COMMENT,
        get_relationship_type,
        get_typescript_type,
        should_include_column,
    )

    model_name = model_class.__name__
    table_name = model_class.__tablename__

    # Get SQLAlchemy inspector for the model
    mapper = class_mapper(model_class)
    inspector = sqlalchemy_inspect(model_class)

    # Generate interface comment
    interface_comment = INTERFACE_COMMENT.format(
        model_name=model_name, table_name=table_name
    )

    # Start building interface
    interface_lines = [interface_comment]
    interface_lines.append(f"export interface {model_name} {{")

    # Process columns
    for column in mapper.columns:
        if not should_include_column(column):
            continue

        column_name = column.name
        column_type = get_typescript_type(
            column.type, nullable=column.nullable, column_name=column_name
        )

        # Add column comment if it has documentation
        if hasattr(column, "comment") and column.comment:
            interface_lines.append(f"  /** {column.comment} */")

        # Add length constraint comment for strings
        if hasattr(column.type, "length") and column.type.length:
            interface_lines.append(f"  /** Max length: {column.type.length} */")

        interface_lines.append(f"  {column_name}: {column_type};")

    # Process relationships (optional - can be omitted to avoid circular dependencies)
    for relationship_name, relationship in inspector.relationships.items():
        if relationship_name.startswith("_"):  # Skip internal relationships
            continue

        relationship_type = get_relationship_type(relationship, model_name)
        interface_lines.append(f"  {relationship_name}?: {relationship_type};")

    interface_lines.append("}")
    interface_lines.append("")  # Empty line after interface

    return "\n".join(interface_lines)


def generate_zod_schema(model_class) -> str:
    """Generate Zod validation schema from SQLAlchemy model."""
    # Import here to avoid module-level import order issues
    from sqlalchemy.orm import class_mapper
    from scripts.type_mappings import (
        SCHEMA_COMMENT,
        get_zod_schema,
        should_include_column,
    )

    model_name = model_class.__name__
    table_name = model_class.__tablename__

    # Get SQLAlchemy mapper for the model
    mapper = class_mapper(model_class)

    # Generate schema comment
    schema_comment = SCHEMA_COMMENT.format(model_name=model_name, table_name=table_name)

    # Start building schema
    schema_lines = [schema_comment]
    schema_lines.append(f"export const {model_name}Schema = z.object({{")

    # Process columns
    for column in mapper.columns:
        if not should_include_column(column):
            continue

        column_name = column.name
        zod_type = get_zod_schema(
            column.type, nullable=column.nullable, column_name=column_name
        )

        # Add validation comment if needed
        if hasattr(column.type, "length") and column.type.length:
            schema_lines.append(f"  // Max length: {column.type.length}")

        schema_lines.append(f"  {column_name}: {zod_type},")

    schema_lines.append("});")
    schema_lines.append("")

    # Add type inference
    schema_lines.append(
        f"export type {model_name}Input = z.infer<typeof {model_name}Schema>;"
    )
    schema_lines.append("")

    return "\n".join(schema_lines)


def ensure_output_directory():
    """Create the output directory if it doesn't exist."""
    project_root = Path(__file__).parent.parent
    output_dir = project_root / "src" / "types" / "generated"
    output_dir.mkdir(parents=True, exist_ok=True)
    return output_dir


def write_typescript_interfaces(models: List[Any], output_dir: Path):
    """Generate and write TypeScript interface file."""
    # Import here to avoid module-level import order issues
    from scripts.type_mappings import FILE_HEADER

    timestamp = datetime.now().isoformat()

    # Generate file header
    content_lines = [FILE_HEADER.format(timestamp=timestamp)]

    # Add imports
    content_lines.extend(
        [
            "// TypeScript interfaces generated from SQLAlchemy models",
            "",
        ]
    )

    # Generate interfaces for each model
    for model in models:
        interface_code = generate_typescript_interface(model)
        content_lines.append(interface_code)

    # Write to file
    output_file = output_dir / "models.ts"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("\n".join(content_lines))

    print(f"✅ Generated TypeScript interfaces: {output_file}")


def write_zod_schemas(models: List[Any], output_dir: Path):
    """Generate and write Zod schema file."""
    # Import here to avoid module-level import order issues
    from scripts.type_mappings import FILE_HEADER

    timestamp = datetime.now().isoformat()

    # Generate file header
    content_lines = [FILE_HEADER.format(timestamp=timestamp)]

    # Add imports
    content_lines.extend(
        [
            "import { z } from 'zod';",
            "",
            "// Zod validation schemas generated from SQLAlchemy models",
            "",
        ]
    )

    # Generate schemas for each model
    for model in models:
        schema_code = generate_zod_schema(model)
        content_lines.append(schema_code)

    # Add export object for easy importing
    content_lines.append("// Export all schemas for easy importing")
    content_lines.append("export const schemas = {")
    for model in models:
        model_name = model.__name__
        content_lines.append(f"  {model_name}: {model_name}Schema,")
    content_lines.append("};")

    # Write to file
    output_file = output_dir / "schemas.ts"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("\n".join(content_lines))

    print(f"✅ Generated Zod schemas: {output_file}")


def main():
    """Main type generation function."""
    print("🚀 Starting TypeScript type generation...")

    # Setup path and discover SQLAlchemy models
    setup_path()
    models = discover_sqlalchemy_models()

    if not models:
        print("❌ No models found to generate types for")
        sys.exit(1)

    # Ensure output directory exists
    output_dir = ensure_output_directory()
    print(f"📁 Output directory: {output_dir}")

    # Generate TypeScript interfaces
    write_typescript_interfaces(models, output_dir)

    # Generate Zod schemas
    write_zod_schemas(models, output_dir)

    print(f"✅ Type generation complete! Generated types for {len(models)} models")
    print("\n📋 Next steps:")
    print("1. Run `npm run type-check` to validate generated types")
    print("2. Update imports in src/types/api.ts to use generated types")
    print("3. Test the generated types in your components")


if __name__ == "__main__":
    main()
