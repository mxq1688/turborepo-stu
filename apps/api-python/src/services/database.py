import aiomysql
import os
from typing import Optional
import logging
from contextlib import asynccontextmanager
from ..config.settings import settings

logger = logging.getLogger(__name__)

class DatabaseService:
    _instance: Optional['DatabaseService'] = None
    _pool: Optional[aiomysql.Pool] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    @classmethod
    async def initialize(cls) -> 'DatabaseService':
        """初始化数据库连接池"""
        instance = cls()
        if cls._pool is None:
            try:
                cls._pool = await aiomysql.create_pool(
                    host=settings.DB_HOST,
                    port=settings.DB_PORT,
                    user=settings.DB_USERNAME,
                    password=settings.DB_PASSWORD,
                    db=settings.DB_DATABASE,
                    charset=settings.DB_CHARSET,
                    autocommit=True,
                    minsize=1,
                    maxsize=settings.DB_POOL_SIZE,
                )
                logger.info(f"✅ Database connection pool created successfully (Environment: {settings.ENVIRONMENT})")
                logger.debug(f"🔍 Database config: {settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_DATABASE}")
            except Exception as e:
                logger.error(f"❌ Database connection failed: {e}")
                raise e
        return instance
    
    @classmethod
    async def close(cls):
        """关闭数据库连接池"""
        if cls._pool:
            cls._pool.close()
            await cls._pool.wait_closed()
            cls._pool = None
            logger.info("✅ Database connection pool closed")
    
    @asynccontextmanager
    async def get_connection(self):
        """获取数据库连接"""
        if self._pool is None:
            raise RuntimeError("Database pool not initialized")
        
        async with self._pool.acquire() as conn:
            yield conn
    
    async def health_check(self) -> bool:
        """数据库健康检查"""
        try:
            async with self.get_connection() as conn:
                async with conn.cursor() as cursor:
                    await cursor.execute("SELECT 1")
                    result = await cursor.fetchone()
                    return result == (1,)
        except Exception as e:
            logger.error(f"❌ Database health check failed: {e}")
            return False

# 全局数据库服务实例
db_service: Optional[DatabaseService] = None

async def get_database_service() -> DatabaseService:
    """获取数据库服务实例"""
    global db_service
    if db_service is None:
        db_service = await DatabaseService.initialize()
    return db_service 