from fastapi import APIRouter
import time
import os
from datetime import datetime

router = APIRouter()

@router.get("/")
async def health_check():
    """健康检查端点"""
    uptime = time.time() - getattr(health_check, 'start_time', time.time())
    
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "uptime": uptime,
        "environment": os.getenv("NODE_ENV", "development")
    }

# 保存启动时间
health_check.start_time = time.time() 