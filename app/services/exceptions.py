"""
Exceptions métier pour découpler les services des exceptions HTTP
"""


class ProjectNotFoundException(Exception):
    """Exception levée quand un projet n'est pas trouvé"""

    def __init__(self, project_id: int):
        self.project_id = project_id
        super().__init__(f"Project with id {project_id} not found")


class TaskNotFoundException(Exception):
    """Exception levée quand une tâche n'est pas trouvée"""

    def __init__(self, task_id: int):
        self.task_id = task_id
        super().__init__(f"Task with id {task_id} not found")


class InvalidTaskDataException(Exception):
    """Exception levée pour des données de tâche invalides"""

    def __init__(self, message: str):
        super().__init__(message)


class ProjectValidationException(Exception):
    """Exception levée pour des erreurs de validation de projet"""

    def __init__(self, message: str):
        super().__init__(message)
