from fastapi import APIRouter, HTTPException, status
from typing import List
from datetime import datetime
import sys
import os

# 添加packages路径到Python路径
sys.path.append(os.path.join(os.path.dirname(__file__), "../../../.."))

try:
    from packages.shared_types.src.models import User, CreateUserRequest, UpdateUserRequest, ApiResponse
except ImportError:
    # 如果导入失败，定义本地模型
    from pydantic import BaseModel, EmailStr
    from typing import Optional, Any
    
    class User(BaseModel):
        id: str
        email: str
        name: str
        avatar: Optional[str] = None
        created_at: datetime
        updated_at: datetime
    
    class CreateUserRequest(BaseModel):
        email: str
        name: str
        avatar: Optional[str] = None
    
    class UpdateUserRequest(BaseModel):
        name: Optional[str] = None
        avatar: Optional[str] = None
    
    class ApiResponse(BaseModel):
        success: bool
        data: Optional[Any] = None
        error: Optional[str] = None
        message: Optional[str] = None

router = APIRouter()

# 模拟用户数据
users_db: List[User] = [
    User(
        id="1",
        email="john@example.com",
        name="John Doe",
        avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=John",
        created_at=datetime.now(),
        updated_at=datetime.now(),
    ),
    User(
        id="2",
        email="jane@example.com",
        name="Jane Smith",
        avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )
]

@router.get("/", response_model=ApiResponse)
async def get_all_users():
    """获取所有用户"""
    return ApiResponse(
        success=True,
        data=[user.dict() for user in users_db],
        message="Users retrieved successfully"
    )

@router.get("/{user_id}", response_model=ApiResponse)
async def get_user_by_id(user_id: str):
    """根据ID获取用户"""
    user = next((u for u in users_db if u.id == user_id), None)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return ApiResponse(
        success=True,
        data=user.dict()
    )

@router.post("/", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user_request: CreateUserRequest):
    """创建新用户"""
    # 检查邮箱是否已存在
    existing_user = next((u for u in users_db if u.email == user_request.email), None)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists"
        )
    
    # 创建新用户
    new_user = User(
        id=str(len(users_db) + 1),  # 简单的ID生成
        email=user_request.email,
        name=user_request.name,
        avatar=user_request.avatar or f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_request.name}",
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )
    
    users_db.append(new_user)
    
    return ApiResponse(
        success=True,
        data=new_user.dict(),
        message="User created successfully"
    )

@router.put("/{user_id}", response_model=ApiResponse)
async def update_user(user_id: str, user_request: UpdateUserRequest):
    """更新用户"""
    user_index = next((i for i, u in enumerate(users_db) if u.id == user_id), None)
    
    if user_index is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user = users_db[user_index]
    
    # 更新用户信息
    update_data = user_request.dict(exclude_unset=True)
    if update_data:
        for field, value in update_data.items():
            setattr(user, field, value)
        user.updated_at = datetime.now()
        
        users_db[user_index] = user
    
    return ApiResponse(
        success=True,
        data=user.dict(),
        message="User updated successfully"
    )

@router.delete("/{user_id}", response_model=ApiResponse)
async def delete_user(user_id: str):
    """删除用户"""
    user_index = next((i for i, u in enumerate(users_db) if u.id == user_id), None)
    
    if user_index is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    users_db.pop(user_index)
    
    return ApiResponse(
        success=True,
        message="User deleted successfully"
    ) 