from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime


# 用户相关模型
class User(BaseModel):
    id: str
    email: EmailStr
    name: str
    avatar: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class CreateUserRequest(BaseModel):
    email: EmailStr
    name: str
    avatar: Optional[str] = None


class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None


# API响应模型
class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    message: Optional[str] = None


class Pagination(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int


class PaginatedResponse(BaseModel):
    success: bool
    data: Optional[List[Any]] = None
    error: Optional[str] = None
    message: Optional[str] = None
    pagination: Optional[Pagination] = None


# 健康检查模型
class HealthCheckResponse(BaseModel):
    status: str
    timestamp: datetime
    uptime: float
    environment: str

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        } 