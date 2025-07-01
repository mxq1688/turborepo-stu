import redis.asyncio as redis
import os
import json
from typing import Any, Optional
import logging
from ..config.settings import settings

logger = logging.getLogger(__name__)

class RedisService:
    _instance: Optional['RedisService'] = None
    _client: Optional[redis.Redis] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    @classmethod
    async def initialize(cls) -> 'RedisService':
        """初始化Redis连接"""
        instance = cls()
        if cls._client is None:
            try:
                cls._client = redis.Redis(
                    host=settings.REDIS_HOST,
                    port=settings.REDIS_PORT,
                    password=settings.REDIS_PASSWORD,
                    db=settings.REDIS_DB,
                    decode_responses=True,
                    socket_connect_timeout=10,
                    socket_timeout=settings.REDIS_TIMEOUT,
                    retry_on_timeout=True,
                    health_check_interval=30
                )
                # Test connection
                await cls._client.ping()
                logger.info(f"✅ Redis connection established successfully (Environment: {settings.ENVIRONMENT})")
                logger.debug(f"🔍 Redis config: {settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB}")
            except Exception as e:
                logger.error(f"❌ Redis connection failed: {e}")
                raise e
        return instance
    
    @classmethod
    async def close(cls):
        """关闭Redis连接"""
        if cls._client:
            await cls._client.close()
            cls._client = None
            logger.info("✅ Redis connection closed")
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """设置缓存值"""
        try:
            if isinstance(value, (dict, list)):
                value = json.dumps(value)
            
            if ttl:
                await self._client.setex(key, ttl, value)
            else:
                await self._client.set(key, value)
            return True
        except Exception as e:
            logger.error(f"❌ Redis set failed for key {key}: {e}")
            return False
    
    async def get(self, key: str) -> Optional[Any]:
        """获取缓存值"""
        try:
            value = await self._client.get(key)
            if value is None:
                return None
            
            # Try to parse as JSON
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                return value
        except Exception as e:
            logger.error(f"❌ Redis get failed for key {key}: {e}")
            return None
    
    async def delete(self, key: str) -> bool:
        """删除缓存值"""
        try:
            result = await self._client.delete(key)
            return result > 0
        except Exception as e:
            logger.error(f"❌ Redis delete failed for key {key}: {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """检查key是否存在"""
        try:
            result = await self._client.exists(key)
            return result > 0
        except Exception as e:
            logger.error(f"❌ Redis exists check failed for key {key}: {e}")
            return False
    
    async def expire(self, key: str, ttl: int) -> bool:
        """设置key过期时间"""
        try:
            result = await self._client.expire(key, ttl)
            return result
        except Exception as e:
            logger.error(f"❌ Redis expire failed for key {key}: {e}")
            return False
    
    async def health_check(self) -> bool:
        """Redis健康检查"""
        try:
            response = await self._client.ping()
            return response is True
        except Exception as e:
            logger.error(f"❌ Redis health check failed: {e}")
            return False

# 全局Redis服务实例
redis_service: Optional[RedisService] = None

async def get_redis_service() -> RedisService:
    """获取Redis服务实例"""
    global redis_service
    if redis_service is None:
        redis_service = await RedisService.initialize()
    return redis_service 