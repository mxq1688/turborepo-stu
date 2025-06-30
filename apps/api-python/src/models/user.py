from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import aiomysql
from ..services.database import get_database_service

class User(BaseModel):
    id: Optional[int] = None
    username: str
    email: EmailStr
    name: Optional[str] = None
    avatar: Optional[str] = None
    email_verified: bool = False
    is_active: bool = True
    last_login: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class CreateUserRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    name: Optional[str] = None
    avatar: Optional[str] = None

class UpdateUserRequest(BaseModel):
    username: Optional[str] = None
    name: Optional[str] = None
    avatar: Optional[str] = None

class UserRepository:
    @staticmethod
    async def get_all_users() -> List[User]:
        """获取所有用户"""
        db_service = await get_database_service()
        
        async with db_service.get_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute("""
                    SELECT id, username, email, name, avatar, 
                           email_verified, is_active, last_login, 
                           created_at, updated_at 
                    FROM users 
                    ORDER BY created_at DESC
                """)
                rows = await cursor.fetchall()
                return [User(**row) for row in rows]
    
    @staticmethod
    async def get_user_by_id(user_id: int) -> Optional[User]:
        """根据ID获取用户"""
        db_service = await get_database_service()
        
        async with db_service.get_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute("""
                    SELECT id, username, email, name, avatar, 
                           email_verified, is_active, last_login, 
                           created_at, updated_at 
                    FROM users 
                    WHERE id = %s
                """, (user_id,))
                row = await cursor.fetchone()
                return User(**row) if row else None
    
    @staticmethod
    async def get_user_by_email(email: str) -> Optional[User]:
        """根据邮箱获取用户"""
        db_service = await get_database_service()
        
        async with db_service.get_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute("""
                    SELECT id, username, email, name, avatar, 
                           email_verified, is_active, last_login, 
                           created_at, updated_at 
                    FROM users 
                    WHERE email = %s
                """, (email,))
                row = await cursor.fetchone()
                return User(**row) if row else None
    
    @staticmethod
    async def create_user(user_data: CreateUserRequest) -> User:
        """创建用户"""
        db_service = await get_database_service()
        
        # 这里应该对密码进行哈希处理，为了简化先直接存储
        import hashlib
        password_hash = hashlib.sha256(user_data.password.encode()).hexdigest()
        
        async with db_service.get_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute("""
                    INSERT INTO users (username, email, password_hash, name, avatar, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
                """, (
                    user_data.username,
                    user_data.email,
                    password_hash,
                    user_data.name,
                    user_data.avatar or f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_data.username}"
                ))
                
                user_id = conn.insert_id()
                return await UserRepository.get_user_by_id(user_id)
    
    @staticmethod
    async def update_user(user_id: int, user_data: UpdateUserRequest) -> Optional[User]:
        """更新用户"""
        db_service = await get_database_service()
        
        # 构建动态更新语句
        update_fields = []
        values = []
        
        if user_data.username is not None:
            update_fields.append("username = %s")
            values.append(user_data.username)
        
        if user_data.name is not None:
            update_fields.append("name = %s")
            values.append(user_data.name)
        
        if user_data.avatar is not None:
            update_fields.append("avatar = %s")
            values.append(user_data.avatar)
        
        if not update_fields:
            return await UserRepository.get_user_by_id(user_id)
        
        update_fields.append("updated_at = NOW()")
        values.append(user_id)
        
        async with db_service.get_connection() as conn:
            async with conn.cursor() as cursor:
                query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s"
                await cursor.execute(query, values)
                
                if cursor.rowcount > 0:
                    return await UserRepository.get_user_by_id(user_id)
                return None
    
    @staticmethod
    async def delete_user(user_id: int) -> bool:
        """删除用户"""
        db_service = await get_database_service()
        
        async with db_service.get_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
                return cursor.rowcount > 0 