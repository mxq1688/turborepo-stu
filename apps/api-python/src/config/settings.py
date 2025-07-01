import os
from typing import Optional
from enum import Enum
from pydantic import BaseSettings, Field

class Environment(str, Enum):
    """环境枚举"""
    DEVELOPMENT = "development"
    PRODUCTION = "production"
    TESTING = "testing"
    STAGING = "staging"

class BaseConfig(BaseSettings):
    """基础配置类"""
    
    # 应用配置
    APP_NAME: str = "Turborepo Python API"
    VERSION: str = "0.1.0"
    DEBUG: bool = False
    ENVIRONMENT: Environment = Environment.DEVELOPMENT
    
    # 服务器配置
    HOST: str = "0.0.0.0"
    PORT: int = 3003
    RELOAD: bool = False
    
    # 数据库配置
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USERNAME: str = "developer"
    DB_PASSWORD: str = "dev123"
    DB_DATABASE: str = "turborepo_dev"
    DB_CHARSET: str = "utf8mb4"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    
    # Redis配置
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = "redis123"
    REDIS_DB: int = 0
    REDIS_TIMEOUT: int = 60
    
    # 日志配置
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_FILE: Optional[str] = None
    
    # CORS配置
    CORS_ORIGINS: list = ["*"]
    CORS_METHODS: list = ["*"]
    CORS_HEADERS: list = ["*"]
    
    # JWT配置 (如果需要)
    JWT_SECRET_KEY: str = "your-secret-key"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440  # 24小时
    
    # 其他配置
    API_PREFIX: str = "/api"
    DOCS_URL: str = "/docs"
    REDOC_URL: str = "/redoc"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

class DevelopmentConfig(BaseConfig):
    """开发环境配置"""
    
    DEBUG: bool = True
    ENVIRONMENT: Environment = Environment.DEVELOPMENT
    RELOAD: bool = True
    
    # 开发环境使用详细日志
    LOG_LEVEL: str = "DEBUG"
    
    # 开发环境数据库配置
    DB_HOST: str = "localhost"
    REDIS_HOST: str = "localhost"
    
    # 开发环境允许所有CORS
    CORS_ORIGINS: list = ["*"]
    
    class Config:
        env_prefix = "DEV_"

class ProductionConfig(BaseConfig):
    """生产环境配置"""
    
    DEBUG: bool = False
    ENVIRONMENT: Environment = Environment.PRODUCTION
    RELOAD: bool = False
    
    # 生产环境日志配置
    LOG_LEVEL: str = "WARNING"
    LOG_FILE: str = "/var/log/turborepo/api-python.log"
    
    # 生产环境数据库配置 (通常通过环境变量覆盖)
    DB_HOST: str = Field(default="mysql", env="PROD_DB_HOST")
    REDIS_HOST: str = Field(default="redis", env="PROD_REDIS_HOST")
    
    # 生产环境CORS配置
    CORS_ORIGINS: list = [
        "https://your-domain.com",
        "https://api.your-domain.com"
    ]
    
    # 生产环境安全配置
    JWT_SECRET_KEY: str = Field(..., env="PROD_JWT_SECRET")
    
    class Config:
        env_prefix = "PROD_"

class TestingConfig(BaseConfig):
    """测试环境配置"""
    
    DEBUG: bool = True
    ENVIRONMENT: Environment = Environment.TESTING
    
    # 测试数据库配置
    DB_DATABASE: str = "turborepo_test"
    REDIS_DB: int = 1  # 使用不同的Redis数据库
    
    # 测试环境日志配置
    LOG_LEVEL: str = "DEBUG"
    
    class Config:
        env_prefix = "TEST_"

class StagingConfig(BaseConfig):
    """预发布环境配置"""
    
    DEBUG: bool = False
    ENVIRONMENT: Environment = Environment.STAGING
    
    # 预发布环境配置
    LOG_LEVEL: str = "INFO"
    
    # 预发布环境数据库配置
    DB_HOST: str = Field(default="staging-mysql", env="STAGING_DB_HOST")
    REDIS_HOST: str = Field(default="staging-redis", env="STAGING_REDIS_HOST")
    
    class Config:
        env_prefix = "STAGING_"

def get_config() -> BaseConfig:
    """获取配置实例"""
    env = os.getenv("ENVIRONMENT", "development").lower()
    
    config_mapping = {
        Environment.DEVELOPMENT: DevelopmentConfig,
        Environment.PRODUCTION: ProductionConfig,
        Environment.TESTING: TestingConfig,
        Environment.STAGING: StagingConfig,
    }
    
    config_class = config_mapping.get(Environment(env), DevelopmentConfig)
    return config_class()

# 全局配置实例
settings = get_config()

# 数据库URL构造
def get_database_url(config: BaseConfig = settings) -> str:
    """构造数据库连接URL"""
    return f"mysql://{config.DB_USERNAME}:{config.DB_PASSWORD}@{config.DB_HOST}:{config.DB_PORT}/{config.DB_DATABASE}"

# Redis URL构造
def get_redis_url(config: BaseConfig = settings) -> str:
    """构造Redis连接URL"""
    if config.REDIS_PASSWORD:
        return f"redis://:{config.REDIS_PASSWORD}@{config.REDIS_HOST}:{config.REDIS_PORT}/{config.REDIS_DB}"
    return f"redis://{config.REDIS_HOST}:{config.REDIS_PORT}/{config.REDIS_DB}" 