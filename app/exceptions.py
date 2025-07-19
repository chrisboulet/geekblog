"""
Custom exceptions for GeekBlog application.
Provides domain-specific exceptions that decouple business logic from HTTP framework.
"""


class GeekBlogError(Exception):
    """Base exception for all GeekBlog domain errors."""

    pass


class ProjectServiceError(GeekBlogError):
    """Base exception for project service operations."""

    pass


class ProjectNotFound(ProjectServiceError):
    """Raised when a project cannot be found by ID."""

    def __init__(self, project_id: int):
        self.project_id = project_id
        super().__init__(f"Project with ID {project_id} not found")


class ProjectAlreadyArchived(ProjectServiceError):
    """Raised when attempting to archive an already archived project."""

    def __init__(self, project_id: int):
        self.project_id = project_id
        super().__init__(f"Project {project_id} is already archived")


class ProjectNotArchived(ProjectServiceError):
    """Raised when attempting to unarchive a project that is not archived."""

    def __init__(self, project_id: int):
        self.project_id = project_id
        super().__init__(f"Project {project_id} is not archived")


class CannotDeleteArchivedProject(ProjectServiceError):
    """Raised when attempting to delete an archived project."""

    def __init__(self, project_id: int):
        self.project_id = project_id
        super().__init__(
            f"Cannot delete archived project {project_id}. Unarchive first."
        )


class TemplateServiceError(GeekBlogError):
    """Base exception for template service operations."""

    pass


class TemplateNotFound(TemplateServiceError):
    """Raised when a template cannot be found by ID or slug."""

    def __init__(self, identifier: str):
        self.identifier = identifier
        super().__init__(f"Template '{identifier}' not found")


class InvalidTemplateCustomization(TemplateServiceError):
    """Raised when template customization data is invalid."""

    def __init__(self, message: str):
        super().__init__(f"Invalid template customization: {message}")
