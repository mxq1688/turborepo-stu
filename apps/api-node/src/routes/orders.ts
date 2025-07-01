import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { db } from '../services/database.js'
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth.js'

const router = Router()

// 验证schemas
const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.number().positive(),
    quantity: z.number().positive()
  })).min(1),
  shippingAddress: z.string().optional(),
  notes: z.string().optional()
})

const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
})

// 获取订单列表 (需要认证)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10', status, userId } = req.query
    
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const offset = (pageNum - 1) * limitNum

    const where: any = {}
    
    // 如果不是管理员，只能查看自己的订单
    if (req.user && !userId) {
      where.userId = req.user.id
    } else if (userId) {
      where.userId = parseInt(userId as string)
    }
    
    if (status) {
      where.status = status
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        skip: offset,
        take: limitNum,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              name: true
            }
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  imageUrl: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.order.count({ where })
    ])

    const totalPages = Math.ceil(total / limitNum)

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      },
      message: 'Orders retrieved successfully'
    })
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// 根据ID获取订单详情 (需要认证)
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const orderId = parseInt(id)

    if (isNaN(orderId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid order ID'
      })
      return
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                imageUrl: true,
                category: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found'
      })
      return
    }

    // 检查权限：用户只能查看自己的订单
    if (req.user && order.userId !== req.user.id) {
      res.status(403).json({
        success: false,
        error: 'Access denied'
      })
      return
    }

    res.json({
      success: true,
      data: { order },
      message: 'Order retrieved successfully'
    })
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// 创建订单 (需要认证)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
      return
    }

    const { items, shippingAddress, notes } = createOrderSchema.parse(req.body)

    // 使用事务确保数据一致性
    const order = await db.$transaction(async (tx) => {
      // 检查所有产品是否存在且有足够库存
      const products = await tx.product.findMany({
        where: {
          id: { in: items.map(item => item.productId) },
          isActive: true
        }
      })

      if (products.length !== items.length) {
        throw new Error('Some products not found or inactive')
      }

      let totalAmount = 0
      const orderItemsData = []

      for (const item of items) {
        const product = products.find(p => p.id === item.productId)
        if (!product) {
          throw new Error(`Product ${item.productId} not found`)
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`)
        }

        const itemTotal = product.price.toNumber() * item.quantity
        totalAmount += itemTotal

        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price
        })

        // 减少库存
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      }

      // 创建订单
      const newOrder = await tx.order.create({
        data: {
          userId: req.user!.id,
          totalAmount,
          shippingAddress,
          notes,
          orderItems: {
            create: orderItemsData
          }
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  imageUrl: true
                }
              }
            }
          }
        }
      })

      return newOrder
    })

    res.status(201).json({
      success: true,
      data: { order },
      message: 'Order created successfully'
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

    console.error('Create order error:', error)
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order'
    })
  }
})

// 更新订单状态 (需要认证)
router.patch('/:id/status', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const orderId = parseInt(id)

    if (isNaN(orderId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid order ID'
      })
      return
    }

    const { status } = updateOrderStatusSchema.parse(req.body)

    // 检查订单是否存在
    const existingOrder = await db.order.findUnique({
      where: { id: orderId }
    })

    if (!existingOrder) {
      res.status(404).json({
        success: false,
        error: 'Order not found'
      })
      return
    }

    // 检查权限：用户只能取消自己的订单，其他状态更新需要管理员权限
    if (req.user && existingOrder.userId !== req.user.id && status !== 'cancelled') {
      res.status(403).json({
        success: false,
        error: 'Access denied'
      })
      return
    }

    // 如果是取消订单，需要恢复库存
    if (status === 'cancelled' && existingOrder.status !== 'cancelled') {
      await db.$transaction(async (tx) => {
        // 更新订单状态
        await tx.order.update({
          where: { id: orderId },
          data: { status }
        })

        // 恢复库存
        const orderItems = await tx.orderItem.findMany({
          where: { orderId }
        })

        for (const item of orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          })
        }
      })
    } else {
      await db.order.update({
        where: { id: orderId },
        data: { status }
      })
    }

    const updatedOrder = await db.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true
              }
            }
          }
        }
      }
    })

    res.json({
      success: true,
      data: { order: updatedOrder },
      message: 'Order status updated successfully'
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

    console.error('Update order status error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// 获取用户的订单统计 (需要认证)
router.get('/stats/user', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
      return
    }

    const stats = await db.order.groupBy({
      by: ['status'],
      where: { userId: req.user.id },
      _count: { status: true },
      _sum: { totalAmount: true }
    })

    const formattedStats = {
      totalOrders: stats.reduce((sum, stat) => sum + stat._count.status, 0),
      totalAmount: stats.reduce((sum, stat) => sum + (stat._sum.totalAmount?.toNumber() || 0), 0),
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = {
          count: stat._count.status,
          totalAmount: stat._sum.totalAmount?.toNumber() || 0
        }
        return acc
      }, {} as Record<string, { count: number; totalAmount: number }>)
    }

    res.json({
      success: true,
      data: { stats: formattedStats },
      message: 'Order statistics retrieved successfully'
    })
  } catch (error) {
    console.error('Get order stats error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

export default router 