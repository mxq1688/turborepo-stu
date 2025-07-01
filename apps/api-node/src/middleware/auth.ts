import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.js'
import { db } from '../services/database.js'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number
    email: string
    username: string
  }
}

// JWT 认证中间件
export const authenticateToken = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
      res.status(401).json({ 
        success: false, 
        error: 'Access token required' 
      })
      return
    }

    // 验证令牌
    const payload = AuthService.verifyAccessToken(token)
    
    // 验证用户是否存在且激活
    const user = await db.user.findUnique({
      where: { 
        id: payload.id,
        isActive: true 
      },
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true
      }
    })

    if (!user) {
      res.status(401).json({ 
        success: false, 
        error: 'User not found or inactive' 
      })
      return
    }

    // 将用户信息添加到请求对象
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username
    }

    next()
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    })
  }
}