from fastapi import APIRouter, HTTPException, status
from typing import List
from pydantic import BaseModel
from typing import Optional, Any

from ..models.user import User, CreateUserRequest, UpdateUserRequest, UserRepository

# API响应模型
class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    message: Optional[str] = None

router = APIRouter()

@router.get("/", response_model=ApiResponse)
async def get_all_users():
    """获取所有用户"""
    try:
        users = await UserRepository.get_all_users()
        return ApiResponse(
            success=True,
            data=[user.dict() for user in users],
            message="Users retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve users: {str(e)}"
        )

@router.get("/{user_id}", response_model=ApiResponse)
async def get_user_by_id(user_id: int):
    """根据ID获取用户"""
    try:
        user = await UserRepository.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return ApiResponse(
            success=True,
            data=user.dict()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user: {str(e)}"
        )

@router.post("/", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user_request: CreateUserRequest):
    """创建新用户"""
    try:
        # 检查邮箱是否已存在
        existing_user = await UserRepository.get_user_by_email(user_request.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )
        
        # 创建新用户
        new_user = await UserRepository.create_user(user_request)
        
        return ApiResponse(
            success=True,
            data=new_user.dict(),
            message="User created successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )

@router.put("/{user_id}", response_model=ApiResponse)
async def update_user(user_id: int, user_request: UpdateUserRequest):
    """更新用户"""
    try:
        updated_user = await UserRepository.update_user(user_id, user_request)
        
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return ApiResponse(
            success=True,
            data=updated_user.dict(),
            message="User updated successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}"
        )

@router.delete("/{user_id}", response_model=ApiResponse)
async def delete_user(user_id: int):
    """删除用户"""
    try:
        success = await UserRepository.delete_user(user_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return ApiResponse(
            success=True,
            message="User deleted successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}"
        ) 