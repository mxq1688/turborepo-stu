import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from './database.js'

// JWT 配置
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

export interface JWTPayload {
  id: number
  email: string
  username: string
  iat?: number
  exp?: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export class AuthService {
  // 密码加密
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }

  // 密码验证
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  // 生成访问令牌
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  }

  // 生成刷新令牌  
  static generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN })
  }

  // 验证访问令牌
  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
      throw new Error('Invalid access token')
    }
  }

  // 验证刷新令牌
  static verifyRefreshToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload
    } catch (error) {
      throw new Error('Invalid refresh token')
    }
  }

  // 生成完整的认证令牌对
  static async generateAuthTokens(user: Pick<User, 'id' | 'email' | 'username'>): Promise<AuthTokens> {
    const payload = {
      id: user.id,
      email: user.email,
      username: user.username
    }

    const accessToken = this.generateAccessToken(payload)
    const refreshToken = this.generateRefreshToken(payload)

    // 计算过期时间（毫秒）
    const expiresIn = this.getTokenExpirationTime(JWT_EXPIRES_IN)

    // 保存刷新令牌到数据库
    await this.saveRefreshToken(user.id, refreshToken)

    return {
      accessToken,
      refreshToken,
      expiresIn
    }
  }

  // 保存刷新令牌到数据库
  static async saveRefreshToken(userId: number, token: string): Promise<void> {
    const expiresAt = new Date()
    expiresAt.setTime(expiresAt.getTime() + this.getTokenExpirationTime(JWT_REFRESH_EXPIRES_IN))

    await db.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt
      }
    })
  }

  // 删除刷新令牌
  static async revokeRefreshToken(token: string): Promise<void> {
    await db.refreshToken.updateMany({
      where: { token },
      data: { isRevoked: true }
    })
  }

  // 删除用户的所有刷新令牌
  static async revokeAllUserTokens(userId: number): Promise<void> {
    await db.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true }
    })
  }

  // 验证刷新令牌是否存在且未撤销
  static async validateRefreshToken(token: string): Promise<boolean> {
    const refreshToken = await db.refreshToken.findFirst({
      where: {
        token,
        isRevoked: false,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    return !!refreshToken
  }

  // 刷新访问令牌
  static async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    // 验证刷新令牌
    const payload = this.verifyRefreshToken(refreshToken)
    
    // 检查令牌是否在数据库中且未撤销
    const isValid = await this.validateRefreshToken(refreshToken)
    if (!isValid) {
      throw new Error('Refresh token is invalid or revoked')
    }

    // 获取用户信息
    const user = await db.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, username: true, isActive: true }
    })

    if (!user || !user.isActive) {
      throw new Error('User not found or inactive')
    }

    // 撤销旧的刷新令牌
    await this.revokeRefreshToken(refreshToken)

    // 生成新的令牌对
    return this.generateAuthTokens(user)
  }

  // 更新用户最后登录时间
  static async updateLastLogin(userId: number): Promise<void> {
    await db.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() }
    })
  }

  // 将时间字符串转换为毫秒
  private static getTokenExpirationTime(timeString: string): number {
    const match = timeString.match(/^(\d+)([smhd])$/)
    if (!match) {
      throw new Error('Invalid time format')
    }

    const value = parseInt(match[1])
    const unit = match[2]

    switch (unit) {
      case 's': return value * 1000
      case 'm': return value * 60 * 1000
      case 'h': return value * 60 * 60 * 1000
      case 'd': return value * 24 * 60 * 60 * 1000
      default: throw new Error('Invalid time unit')
    }
  }

  // 清理过期的令牌
  static async cleanExpiredTokens(): Promise<void> {
    await db.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isRevoked: true }
        ]
      }
    })
  }
}