import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { db } from '../services/database.js'
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth.js'

const router = Router()

// 验证schemas
const updateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  avatar: z.string().url().optional()
})

// 获取所有用户 (需要认证)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10', search } = req.query
    
    const pageNum = parseInt(typeof page === 'string' ? page : '1')
    const limitNum = parseInt(typeof limit === 'string' ? limit : '10')
    const offset = (pageNum - 1) * limitNum

    const where: any = {}
    
    if (search && typeof search === 'string') {
      where.OR = [
        { username: { contains: search } },
        { email: { contains: search } },
        { name: { contains: search } }
      ]
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip: offset,
        take: limitNum,
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          avatar: true,
          emailVerified: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.user.count({ where })
    ])

    const totalPages = Math.ceil(total / limitNum)

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      },
      message: 'Users retrieved successfully'
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// 根据ID获取用户
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const userId = parseInt(id || '0')

    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      })
      return
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatar: true,
        emailVerified: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true
          }
        }
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
      message: 'User retrieved successfully'
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// 更新用户信息 (需要认证，只能更新自己的信息)
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const userId = parseInt(id || '0')

    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      })
      return
    }

    // 检查权限：用户只能更新自己的信息
    if (req.user && req.user.id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied'
      })
      return
    }

    const updateData = updateUserSchema.parse(req.body)

    // 检查用户是否存在
    const existingUser = await db.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      })
      return
    }

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatar: true,
        emailVerified: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    })

    res.json({
      success: true,
      data: { user },
      message: 'User updated successfully'
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

    console.error('Update user error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// 停用用户 (需要认证，管理员功能)
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const userId = parseInt(id || '0')

    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      })
      return
    }

    // 防止用户删除自己
    if (req.user && req.user.id === userId) {
      res.status(400).json({
        success: false,
        error: 'Cannot deactivate your own account'
      })
      return
    }

    // 检查用户是否存在
    const existingUser = await db.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      })
      return
    }

    // 软删除：设置为不活跃
    await db.user.update({
      where: { id: userId },
      data: { isActive: false }
    })

    res.json({
      success: true,
      message: 'User deactivated successfully'
    })
  } catch (error) {
    console.error('Deactivate user error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// 获取用户统计信息 (需要认证)
router.get('/stats/overview', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      activeUsers,
      recentUsers
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 最近30天
          }
        }
      })
    ])

    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      recentUsers
    }

    res.json({
      success: true,
      data: { stats },
      message: 'User statistics retrieved successfully'
    })
  } catch (error) {
    console.error('Get user stats error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

export { router as userRoutes } 