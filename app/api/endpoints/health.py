"""
Health check endpoints for monitoring and container orchestration.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from typing import Dict, Any
import redis
import os
import psutil

from app.db.config import get_db

router = APIRouter()


def check_database_connection(db: Session) -> Dict[str, Any]:
    """Check database connectivity and basic health."""
    try:
        # Execute a simple query
        result = db.execute(text("SELECT 1"))
        result.fetchone()
        
        # Get database statistics
        stats = db.execute(text("""
            SELECT 
                count(*) as connection_count,
                max(state_change) as last_activity
            FROM pg_stat_activity 
            WHERE datname = current_database()
        """)).fetchone()
        
        return {
            "status": "healthy",
            "response_time_ms": 0,  # Would need timing logic
            "connections": stats.connection_count if stats else 0,
            "last_activity": stats.last_activity.isoformat() if stats and stats.last_activity else None
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


def check_redis_connection() -> Dict[str, Any]:
    """Check Redis connectivity and basic health."""
    try:
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        r = redis.from_url(redis_url)
        
        # Ping Redis
        r.ping()
        
        # Get Redis info
        info = r.info()
        
        return {
            "status": "healthy",
            "version": info.get("redis_version", "unknown"),
            "connected_clients": info.get("connected_clients", 0),
            "used_memory_human": info.get("used_memory_human", "unknown")
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


def get_system_metrics() -> Dict[str, Any]:
    """Get system resource usage metrics."""
    try:
        # CPU usage
        cpu_percent = psutil.cpu_percent(interval=0.1)
        
        # Memory usage
        memory = psutil.virtual_memory()
        
        # Disk usage
        disk = psutil.disk_usage('/')
        
        return {
            "cpu_percent": cpu_percent,
            "memory": {
                "percent": memory.percent,
                "available_mb": memory.available / 1024 / 1024,
                "total_mb": memory.total / 1024 / 1024
            },
            "disk": {
                "percent": disk.percent,
                "free_gb": disk.free / 1024 / 1024 / 1024,
                "total_gb": disk.total / 1024 / 1024 / 1024
            }
        }
    except Exception as e:
        return {"error": str(e)}


@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """
    Basic health check endpoint.
    
    Returns 200 if the service is healthy, 503 if any critical component is down.
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": os.getenv("APP_VERSION", "1.0.0"),
        "environment": os.getenv("ENVIRONMENT", "production")
    }
    
    # Check database
    db_status = check_database_connection(db)
    if db_status["status"] == "unhealthy":
        health_status["status"] = "unhealthy"
    
    return health_status


@router.get("/health/detailed")
async def detailed_health_check(db: Session = Depends(get_db)):
    """
    Detailed health check with component status and metrics.
    
    Useful for monitoring dashboards and debugging.
    """
    # Check all components
    db_status = check_database_connection(db)
    redis_status = check_redis_connection()
    system_metrics = get_system_metrics()
    
    # Determine overall health
    overall_status = "healthy"
    if db_status["status"] == "unhealthy" or redis_status["status"] == "unhealthy":
        overall_status = "unhealthy"
    elif system_metrics.get("cpu_percent", 0) > 90 or system_metrics.get("memory", {}).get("percent", 0) > 90:
        overall_status = "degraded"
    
    health_report = {
        "status": overall_status,
        "timestamp": datetime.utcnow().isoformat(),
        "version": os.getenv("APP_VERSION", "1.0.0"),
        "environment": os.getenv("ENVIRONMENT", "production"),
        "components": {
            "database": db_status,
            "redis": redis_status
        },
        "metrics": system_metrics,
        "features": {
            "templates_enabled": os.getenv("ENABLE_TEMPLATE_CREATION", "true") == "true",
            "registration_enabled": os.getenv("ENABLE_USER_REGISTRATION", "true") == "true",
            "oauth_enabled": os.getenv("ENABLE_OAUTH", "false") == "true"
        }
    }
    
    # Return appropriate status code
    if overall_status == "unhealthy":
        raise HTTPException(status_code=503, detail=health_report)
    
    return health_report


@router.get("/health/live")
async def liveness_probe():
    """
    Kubernetes liveness probe endpoint.
    
    Simple check to verify the service is running.
    """
    return {"status": "alive", "timestamp": datetime.utcnow().isoformat()}


@router.get("/health/ready")
async def readiness_probe(db: Session = Depends(get_db)):
    """
    Kubernetes readiness probe endpoint.
    
    Checks if the service is ready to accept traffic.
    """
    # Quick database check
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ready", "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        raise HTTPException(
            status_code=503, 
            detail={"status": "not_ready", "error": str(e)}
        )