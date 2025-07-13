"""
FastAPI dependencies for authentication and authorization.
"""

import os
from fastapi import HTTPException, status, Depends
from fastapi.security import APIKeyHeader
from typing import Annotated


class User:
    """Placeholder user model for authentication."""

    def __init__(self, id: int, username: str, is_admin: bool = False):
        self.id = id
        self.username = username
        self.is_admin = is_admin


# API Key header configuration
api_key_header = APIKeyHeader(name="X-API-KEY", auto_error=False)


async def get_api_key(api_key: str = Depends(api_key_header)) -> str:
    """
    Validate API key from request header.

    Args:
        api_key: API key from X-API-KEY header

    Returns:
        str: Validated API key

    Raises:
        HTTPException: 403 if API key is invalid or missing
    """
    valid_api_key = os.getenv("API_KEY")

    if not valid_api_key:
        # If no API key is configured, allow access in development mode
        if os.getenv("ENVIRONMENT", "development") == "development":
            return "development"
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="API key not configured",
        )

    if not api_key or api_key != valid_api_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Invalid or missing API key"
        )

    return api_key


async def get_current_user(api_key: str = Depends(get_api_key)) -> User:
    """
    Get current user based on validated API key.

    This is an interim security measure before implementing full OAuth2/JWT authentication.
    All requests with valid API key are treated as admin users.

    Args:
        api_key: Validated API key from get_api_key dependency

    Returns:
        User: Authenticated user (admin for API key holders)
    """
    # For API key authentication, all authenticated requests have admin privileges
    # This will be replaced with proper user management in Phase 9
    return User(id=1, username="api_user", is_admin=True)


async def get_current_admin_user(
    current_user: Annotated[User, Depends(get_current_user)],
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
            detail="Admin privileges required for this operation",
        )
    return current_user
