from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
import random
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from datetime import datetime, timedelta
import hashlib

from ..models.user import UserRepository, CreateUserRequest

router = APIRouter()

# 验证码存储（生产环境应使用Redis）
verification_codes = {}

class SendCodeRequest(BaseModel):
    email: EmailStr

class VerifyCodeRequest(BaseModel):
    email: EmailStr
    verificationCode: str

class ApiResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
    message: Optional[str] = None

def generate_verification_code() -> str:
    """生成6位数字验证码"""
    return ''.join(random.choices(string.digits, k=6))

def send_email(to_email: str, subject: str, body: str) -> bool:
    """发送邮件（简化版本，生产环境需要更完善的邮件服务）"""
    try:
        # 这里使用模拟邮件发送，实际应用中需要配置SMTP服务器
        print(f"📧 模拟发送邮件到 {to_email}")
        print(f"主题: {subject}")
        print(f"内容: {body}")
        print("-" * 50)
        
        # 在生产环境中，这里应该是真实的SMTP配置
        # smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        # smtp_port = int(os.getenv('SMTP_PORT', '587'))
        # smtp_username = os.getenv('SMTP_USERNAME')
        # smtp_password = os.getenv('SMTP_PASSWORD')
        
        # msg = MIMEMultipart()
        # msg['From'] = smtp_username
        # msg['To'] = to_email
        # msg['Subject'] = subject
        # msg.attach(MIMEText(body, 'html'))
        
        # server = smtplib.SMTP(smtp_server, smtp_port)
        # server.starttls()
        # server.login(smtp_username, smtp_password)
        # text = msg.as_string()
        # server.sendmail(smtp_username, to_email, text)
        # server.quit()
        
        return True
    except Exception as e:
        print(f"发送邮件失败: {e}")
        return False

@router.post("/send-verification-code", response_model=ApiResponse)
async def send_verification_code(request: SendCodeRequest):
    """发送邮箱验证码"""
    try:
        email = request.email
        
        # 生成验证码
        code = generate_verification_code()
        
        # 存储验证码（5分钟有效期）
        verification_codes[email] = {
            'code': code,
            'expires_at': datetime.now() + timedelta(minutes=5),
            'attempts': 0
        }
        
        # 邮件内容
        subject = "您的登录验证码"
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Turborepo</h1>
                    <p style="color: white; margin: 5px 0;">现代化的全栈开发平台</p>
                </div>
                
                <div style="padding: 30px; background: #f9f9f9;">
                    <h2 style="color: #333; margin-bottom: 20px;">您的验证码</h2>
                    <p style="color: #666; margin-bottom: 20px;">您正在登录 Turborepo 系统，以下是您的验证码：</p>
                    
                    <div style="background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <h1 style="color: #667eea; font-size: 32px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                            {code}
                        </h1>
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">
                        • 验证码有效期为 5 分钟<br>
                        • 请勿将验证码告诉他人<br>
                        • 如果不是您本人操作，请忽略此邮件
                    </p>
                </div>
                
                <div style="background: #333; padding: 20px; text-align: center;">
                    <p style="color: #999; margin: 0; font-size: 12px;">
                        此邮件由系统自动发送，请勿回复
                    </p>
                </div>
            </body>
        </html>
        """
        
        # 发送邮件
        if send_email(email, subject, body):
            return ApiResponse(
                success=True,
                message=f"验证码已发送到 {email}，请查收邮件"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="邮件发送失败，请稍后重试"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"发送验证码失败: {str(e)}"
        )

@router.post("/login-with-code", response_model=ApiResponse)
async def login_with_verification_code(request: VerifyCodeRequest):
    """验证码登录"""
    try:
        email = request.email
        code = request.verificationCode
        
        # 检查验证码是否存在
        if email not in verification_codes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="验证码不存在或已过期，请重新获取"
            )
        
        code_data = verification_codes[email]
        
        # 检查验证码是否过期
        if datetime.now() > code_data['expires_at']:
            del verification_codes[email]
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="验证码已过期，请重新获取"
            )
        
        # 检查尝试次数（防暴力破解）
        if code_data['attempts'] >= 3:
            del verification_codes[email]
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="验证码尝试次数过多，请重新获取"
            )
        
        # 验证验证码
        if code != code_data['code']:
            code_data['attempts'] += 1
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"验证码错误，还可尝试 {3 - code_data['attempts']} 次"
            )
        
        # 验证成功，清除验证码
        del verification_codes[email]
        
        # 检查用户是否存在
        user = await UserRepository.get_user_by_email(email)
        
        if not user:
            # 如果用户不存在，可以选择自动创建用户或返回错误
            # 这里选择返回错误，要求用户先注册
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在，请先注册账户"
            )
        
        # 生成简单的用户会话信息（实际应用中应该生成JWT token）
        session_data = {
            'user_id': user.id,
            'email': user.email,
            'username': user.username,
            'login_time': datetime.now().isoformat(),
            'login_method': 'verification_code'
        }
        
        return ApiResponse(
            success=True,
            data=session_data,
            message="验证码登录成功"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"验证码登录失败: {str(e)}"
        )

@router.post("/register-with-code", response_model=ApiResponse)
async def register_with_verification_code(request: dict):
    """验证码注册（验证邮箱后注册）"""
    try:
        email = request.get('email')
        code = request.get('verificationCode')
        username = request.get('username')
        password = request.get('password', 'temp_password_' + str(random.randint(1000, 9999)))
        
        if not all([email, code, username]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="缺少必要参数"
            )
        
        # 验证验证码（复用验证逻辑）
        if email not in verification_codes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="验证码不存在或已过期"
            )
        
        code_data = verification_codes[email]
        
        if datetime.now() > code_data['expires_at']:
            del verification_codes[email]
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="验证码已过期"
            )
        
        if code != code_data['code']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="验证码错误"
            )
        
        # 清除验证码
        del verification_codes[email]
        
        # 检查用户是否已存在
        existing_user = await UserRepository.get_user_by_email(email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="该邮箱已被注册"
            )
        
        # 创建用户
        user_data = CreateUserRequest(
            username=username,
            email=email,
            password=password,
            name=username
        )
        
        new_user = await UserRepository.create_user(user_data)
        
        return ApiResponse(
            success=True,
            data={
                'user': new_user.dict(),
                'message': '注册成功，邮箱已验证'
            },
            message="注册成功"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"注册失败: {str(e)}"
        ) 