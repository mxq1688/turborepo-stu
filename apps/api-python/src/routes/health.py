from fastapi import APIRouter
import time
import os
from datetime import datetime
from ..services.database import get_database_service
from ..services.redis import get_redis_service
from ..config.settings import settings

router = APIRouter()

@router.get("")
async def health_check():
    """健康检查端点"""
    uptime = time.time() - getattr(health_check, 'start_time', time.time())
    
    # 检查数据库连接状态
    database_status = "unknown"
    try:
        db_service = await get_database_service()
        database_healthy = await db_service.health_check()
        database_status = "healthy" if database_healthy else "unhealthy"
    except Exception as e:
        database_status = f"error: {str(e)}"
    
    # 检查Redis连接状态
    redis_status = "unknown"
    try:
        redis_service = await get_redis_service()
        redis_healthy = await redis_service.health_check()
        redis_status = "healthy" if redis_healthy else "unhealthy"
    except Exception as e:
        redis_status = f"error: {str(e)}"
    
    # 总体状态：只有当数据库和Redis都健康时才是ok
    all_healthy = database_status == "healthy" and redis_status == "healthy"
    overall_status = "ok" if all_healthy else "degraded"
    
    return {
        "status": overall_status,
        "timestamp": datetime.now().isoformat(),
        "uptime": uptime,
        "environment": settings.ENVIRONMENT,
        "version": settings.VERSION,
        "debug": settings.DEBUG,
        "services": {
            "database": database_status,
            "redis": redis_status
        },
        "config": {
            "db_host": settings.DB_HOST,
            "redis_host": settings.REDIS_HOST,
            "log_level": settings.LOG_LEVEL
        } if settings.DEBUG else None
    }

# 保存启动时间
health_check.start_time = time.time() 