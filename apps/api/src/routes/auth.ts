import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { AuthService } from '../services/auth.js'
import { db } from '../services/database.js'
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth.js'

const router = Router()

// 验证schemas
const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  name: z.string().optional()
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

const refreshTokenSchema = z.object({
  refreshToken: z.string()
})

// 注册接口
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, name } = registerSchema.parse(req.body)

    // 检查用户是否已存在
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: existingUser.email === email ? 'Email already exists' : 'Username already exists'
      })
      return
    }

    // 加密密码
    const passwordHash = await AuthService.hashPassword(password)

    // 创建用户
    const user = await db.user.create({
      data: {
        username,
        email,
        passwordHash,
        name: name || username
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true
      }
    })

    // 生成认证令牌
    const tokens = await AuthService.generateAuthTokens(user)

    // 更新最后登录时间
    await AuthService.updateLastLogin(user.id)

    res.status(201).json({
      success: true,
      data: {
        user,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn
      },
      message: 'User registered successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
      return
    }

    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// 登录接口
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    // 查找用户
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatar: true,
        passwordHash: true,
        isActive: true,
        createdAt: true
      }
    })

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
      return
    }

    // 验证密码
    const isValidPassword = await AuthService.verifyPassword(password, user.passwordHash)
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
      return
    }

    // 生成认证令牌
    const tokens = await AuthService.generateAuthTokens(user)

    // 更新最后登录时间
    await AuthService.updateLastLogin(user.id)

    // 移除密码哈希
    const { passwordHash, ...userWithoutPassword } = user

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn
      },
      message: 'Login successful'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
      return
    }

    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// 刷新令牌接口
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body)

    const tokens = await AuthService.refreshAccessToken(refreshToken)

    res.json({
      success: true,
      data: tokens,
      message: 'Token refreshed successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
      return
    }

    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refresh token'
    })
  }
})

// 登出接口
router.post('/logout', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body

    if (refreshToken) {
      await AuthService.revokeRefreshToken(refreshToken)
    }

    res.json({
      success: true,
      message: 'Logout successful'
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// 登出所有设备
router.post('/logout-all', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user) {
      await AuthService.revokeAllUserTokens(req.user.id)
    }

    res.json({
      success: true,
      message: 'Logged out from all devices'
    })
  } catch (error) {
    console.error('Logout all error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// 获取当前用户信息
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
      return
    }

    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatar: true,
        emailVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      })
      return
    }

    res.json({
      success: true,
      data: { user },
      message: 'User profile retrieved successfully'
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// 测试路由（用于验证服务是否正常）
router.get('/test', (req: Request, res: Response): void => {
  res.json({ 
    success: true,
    message: 'Auth routes working!',
    timestamp: new Date().toISOString()
  })
})

export default router