from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import time
import logging
from contextlib import asynccontextmanager
from dotenv import load_dotenv

from .routes.users import router as users_router
from .routes.health import router as health_router
from .routes.auth import router as auth_router
from .services.database import DatabaseService
from .services.redis import RedisService
from .config.settings import settings

# 加载环境变量
load_dotenv()

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 应用生命周期管理
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时初始化数据库和Redis
    try:
        logger.info("🚀 Initializing database connection...")
        await DatabaseService.initialize()
        logger.info("✅ Database connection initialized successfully")
        
        logger.info("🚀 Initializing Redis connection...")
        await RedisService.initialize()
        logger.info("✅ Redis connection initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize services: {e}")
        raise e
    
    yield
    
    # 关闭时清理数据库和Redis连接
    try:
        logger.info("🔄 Closing database connection...")
        await DatabaseService.close()
        logger.info("✅ Database connection closed successfully")
        
        logger.info("🔄 Closing Redis connection...")
        await RedisService.close()
        logger.info("✅ Redis connection closed successfully")
    except Exception as e:
        logger.error(f"❌ Failed to close services: {e}")

app = FastAPI(
    title=settings.APP_NAME,
    description="A Python FastAPI backend for the Turborepo monorepo",
    version=settings.VERSION,
    docs_url=settings.DOCS_URL if settings.DEBUG else None,
    redoc_url=settings.REDOC_URL if settings.DEBUG else None,
    debug=settings.DEBUG,
    lifespan=lifespan
)

# 启动时间记录
start_time = time.time()
app.state.start_time = start_time

# CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=settings.CORS_METHODS,
    allow_headers=settings.CORS_HEADERS,
)

# 注册路由
app.include_router(health_router, prefix="/health", tags=["health"])
app.include_router(users_router, prefix=f"{settings.API_PREFIX}/users", tags=["users"])
app.include_router(auth_router, prefix=f"{settings.API_PREFIX}/auth", tags=["auth"])

# 全局异常处理
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "message": f"HTTP {exc.status_code} Error"
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal Server Error",
            "message": str(exc) if settings.DEBUG else "Something went wrong!",
            "environment": settings.ENVIRONMENT if settings.DEBUG else None
        }
    )

# 根路径
@app.get("/")
async def root():
    return {
        "message": f"🐍 {settings.APP_NAME}",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": settings.DOCS_URL if settings.DEBUG else None,
        "health": "/health",
        "api_prefix": settings.API_PREFIX
    }

# 404处理
@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def catch_all(path: str):
    raise HTTPException(status_code=404, detail="Route not found")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 3003))
    uvicorn.run(app, host="0.0.0.0", port=port) 