import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { db } from '../services/database.js'
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth.js'

const router = Router()

// 验证schemas
const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  category: z.string().max(100).optional(),
  stock: z.number().min(0).default(0),
  imageUrl: z.string().url().optional()
})

const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  category: z.string().max(100).optional(),
  stock: z.number().min(0).optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional()
})

// 获取产品列表
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10', category, search, active = 'true' } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const offset = (pageNum - 1) * limitNum

    const where: any = {}
    
    // 过滤条件
    if (active === 'true') {
      where.isActive = true
    }
    
    if (category) {
      where.category = category
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } }
      ]
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip: offset,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      db.product.count({ where })
    ])

    const totalPages = Math.ceil(total / limitNum)

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      },
      message: 'Products retrieved successfully'
    })
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// 获取产品分类
router.get('/categories', async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await db.product.findMany({
      where: { 
        isActive: true,
        category: { not: null }
      },
      select: { category: true },
      distinct: ['category']
    })

    const categoryList = categories
      .map(p => p.category)
      .filter(c => c !== null)
      .sort()

    res.json({
      success: true,
      data: { categories: categoryList },
      message: 'Categories retrieved successfully'
    })
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// 根据ID获取产品
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const productId = parseInt(id)

    if (isNaN(productId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid product ID'
      })
      return
    }

    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Product not found'
      })
      return
    }

    res.json({
      success: true,
      data: { product },
      message: 'Product retrieved successfully'
    })
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// 创建产品 (需要认证)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const productData = createProductSchema.parse(req.body)

    const product = await db.product.create({
      data: productData
    })

    res.status(201).json({
      success: true,
      data: { product },
      message: 'Product created successfully'
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

    console.error('Create product error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// 更新产品 (需要认证)
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const productId = parseInt(id)

    if (isNaN(productId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid product ID'
      })
      return
    }

    const updateData = updateProductSchema.parse(req.body)

    // 检查产品是否存在
    const existingProduct = await db.product.findUnique({
      where: { id: productId }
    })

    if (!existingProduct) {
      res.status(404).json({
        success: false,
        error: 'Product not found'
      })
      return
    }

    const product = await db.product.update({
      where: { id: productId },
      data: updateData
    })

    res.json({
      success: true,
      data: { product },
      message: 'Product updated successfully'
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

    console.error('Update product error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// 删除产品 (软删除 - 需要认证)
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const productId = parseInt(id)

    if (isNaN(productId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid product ID'
      })
      return
    }

    // 检查产品是否存在
    const existingProduct = await db.product.findUnique({
      where: { id: productId }
    })

    if (!existingProduct) {
      res.status(404).json({
        success: false,
        error: 'Product not found'
      })
      return
    }

    // 软删除：设置为不活跃
    await db.product.update({
      where: { id: productId },
      data: { isActive: false }
    })

    res.json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Delete product error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// 更新库存
router.patch('/:id/stock', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const productId = parseInt(id)
    const { stock, operation = 'set' } = req.body

    if (isNaN(productId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid product ID'
      })
      return
    }

    if (typeof stock !== 'number' || stock < 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid stock value'
      })
      return
    }

    // 检查产品是否存在
    const existingProduct = await db.product.findUnique({
      where: { id: productId }
    })

    if (!existingProduct) {
      res.status(404).json({
        success: false,
        error: 'Product not found'
      })
      return
    }

    let newStock: number
    switch (operation) {
      case 'add':
        newStock = existingProduct.stock + stock
        break
      case 'subtract':
        newStock = Math.max(0, existingProduct.stock - stock)
        break
      case 'set':
      default:
        newStock = stock
    }

    const product = await db.product.update({
      where: { id: productId },
      data: { stock: newStock }
    })

    res.json({
      success: true,
      data: { product },
      message: 'Stock updated successfully'
    })
  } catch (error) {
    console.error('Update stock error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

export default router 