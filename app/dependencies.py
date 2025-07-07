"""
FastAPI dependencies for authentication and authorization.
"""

from fastapi import HTTPException, status, Depends
from typing import Annotated


class User:
    """Placeholder user model for authentication."""
    def __init__(self, id: int, username: str, is_admin: bool = False):
        self.id = id
        self.username = username
        self.is_admin = is_admin


async def get_current_user() -> User:
    """
    Development authentication stub.
    
    TODO: Implement proper JWT token validation or session-based auth.
    For development purposes, returns a mock admin user to allow template management.
    
    WARNING: This is NOT secure for production use. Replace with real authentication.
    
    Returns:
        User: Mock admin user for development
    """
    # TODO: Replace with actual authentication logic for production
    # This is a development stub - allows template management for testing
    return User(id=1, username="dev_admin", is_admin=True)


async def get_current_admin_user(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    """
    Verify current user has admin privileges.
    
    Args:
        current_user: User from authentication dependency
    
    Returns:
        User: Verified admin user
        
    Raises:
        HTTPException: 403 if user is not admin
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required for this operation"
        )
    return current_user