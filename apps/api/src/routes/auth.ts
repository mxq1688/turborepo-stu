import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { AuthService } from '../services/auth.js'
import { db } from '../services/database.js'
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth.js'
import { redisService } from '../services/redis.js'
import crypto from 'crypto'

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

const sendCodeSchema = z.object({
  email: z.string().email()
})

const verifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6)
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

// 验证码相关常量
const VERIFICATION_CODE_PREFIX = 'verification_code:'
const CODE_EXPIRY = 300 // 5分钟

// 生成6位数字验证码
function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString()
}

// 模拟发送邮件（实际应用中需要配置SMTP）
async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  try {
    // 在开发环境中模拟发送邮件
    console.log('📧 模拟发送验证码邮件:')
    console.log(`收件人: ${email}`)
    console.log(`验证码: ${code}`)
    console.log('验证码已保存到 Redis，有效期 5 分钟')
    console.log('-'.repeat(50))
    
    // 生产环境中应该使用真实的邮件服务
    // const nodemailer = require('nodemailer')
    // const transporter = nodemailer.createTransporter({...})
    // await transporter.sendMail({...})
    
    return true
  } catch (error) {
    console.error('发送邮件失败:', error)
    return false
  }
}

// 发送验证码
router.post('/send-verification-code', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = sendCodeSchema.parse(req.body)
    
    // 生成验证码
    const code = generateVerificationCode()
    
    // 存储到 Redis
    const key = `${VERIFICATION_CODE_PREFIX}${email}`
    
    await redisService.set(key, JSON.stringify({
      code,
      email,
      createdAt: new Date().toISOString(),
      attempts: 0
    }), CODE_EXPIRY)
    
    // 发送邮件
    const emailSent = await sendVerificationEmail(email, code)
    
    if (emailSent) {
      res.json({
        success: true,
        message: `验证码已发送到 ${email}，请查收邮件`,
        data: {
          email,
          expiresIn: CODE_EXPIRY
        }
      })
    } else {
      res.status(500).json({
        success: false,
        error: '邮件发送失败，请稍后重试'
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid email format',
        details: error.errors
      })
      return
    }

    console.error('Send verification code error:', error)
    res.status(500).json({
      success: false,
      error: '发送验证码失败'
    })
  }
})

// 验证码登录
router.post('/login-with-code', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = verifyCodeSchema.parse(req.body)
    
    const key = `${VERIFICATION_CODE_PREFIX}${email}`
    
    // 从 Redis 获取验证码数据
    const storedData = await redisService.get(key)
    
    if (!storedData) {
      res.status(400).json({
        success: false,
        error: '验证码不存在或已过期'
      })
      return
    }
    
    const codeData = JSON.parse(storedData)
    
    // 检查尝试次数
    if (codeData.attempts >= 3) {
      await redisService.delete(key)
      res.status(400).json({
        success: false,
        error: '验证码尝试次数过多，请重新获取'
      })
      return
    }
    
    // 验证验证码
    if (code !== codeData.code) {
      // 增加尝试次数
      codeData.attempts += 1
      await redisService.set(key, JSON.stringify(codeData), CODE_EXPIRY)
      
      res.status(400).json({
        success: false,
        error: `验证码错误，还可尝试 ${3 - codeData.attempts} 次`
      })
      return
    }
    
    // 验证成功，删除验证码
    await redisService.delete(key)
    
    // 查找用户
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatar: true,
        isActive: true,
        createdAt: true
      }
    })

    if (!user || !user.isActive) {
      res.status(404).json({
        success: false,
        error: '用户不存在或已被禁用'
      })
      return
    }

    // 生成认证令牌
    const tokens = await AuthService.generateAuthTokens(user)

    // 更新最后登录时间
    await AuthService.updateLastLogin(user.id)

    res.json({
      success: true,
      data: {
        user,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn
      },
      message: '验证码登录成功'
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

    console.error('Login with code error:', error)
    res.status(500).json({
      success: false,
      error: '验证码登录失败'
    })
  }
})

export default router