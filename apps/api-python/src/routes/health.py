from fastapi import APIRouter
import time
import os
from datetime import datetime
from ..services.database import get_database_service

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
    
    overall_status = "ok" if database_status == "healthy" else "degraded"
    
    return {
        "status": overall_status,
        "timestamp": datetime.now().isoformat(),
        "uptime": uptime,
        "environment": os.getenv("NODE_ENV", "development"),
        "services": {
            "database": database_status
        }
    }

# 保存启动时间
health_check.start_time = time.time() 