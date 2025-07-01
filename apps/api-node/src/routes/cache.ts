import express from 'express';
import RedisService from '../services/redis.js';

const router = express.Router();
const redis = RedisService.getInstance();

// Redis健康检查
router.get('/ping', async (req: express.Request, res: express.Response) => {
  try {
    const result = await redis.ping();
    res.json({
      success: true,
      message: 'Redis is connected',
      data: { ping: result }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Redis connection failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取Redis信息
router.get('/info', async (req: express.Request, res: express.Response) => {
  try {
    const info = await redis.info();
    res.json({
      success: true,
      data: { info }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get Redis info',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取缓存值
router.get('/get/:key', async (req: express.Request, res: express.Response) => {
  try {
    const key = req.params.key as string;
    const value = await redis.get(key);
    
    if (value === null) {
      return res.status(404).json({
        success: false,
        error: 'Key not found'
      });
    }
    
    res.json({
      success: true,
      data: { key, value }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get cache value',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 设置缓存值
router.post('/set', async (req: express.Request, res: express.Response) => {
  try {
    const { key, value, ttl } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Key and value are required'
      });
    }
    
    await redis.set(key, value, ttl);
    
    res.json({
      success: true,
      message: 'Cache value set successfully',
      data: { key, value, ttl: ttl || 'no expiration' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to set cache value',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 删除缓存值
router.delete('/delete/:key', async (req: express.Request, res: express.Response) => {
  try {
    const key = req.params.key as string;
    const result = await redis.delete(key);
    
    if (result === 0) {
      return res.status(404).json({
        success: false,
        error: 'Key not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Cache value deleted successfully',
      data: { key, deleted: result }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete cache value',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取所有键
router.get('/keys', async (req: express.Request, res: express.Response) => {
  try {
    const pattern = (req.query.pattern as string) || '*';
    const keys = await redis.keys(pattern);
    
    res.json({
      success: true,
      data: { pattern, keys, count: keys.length }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get keys',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 检查键是否存在
router.get('/exists/:key', async (req: express.Request, res: express.Response) => {
  try {
    const key = req.params.key as string;
    const exists = await redis.exists(key);
    
    res.json({
      success: true,
      data: { key, exists }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check key existence',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 获取键的TTL
router.get('/ttl/:key', async (req: express.Request, res: express.Response) => {
  try {
    const key = req.params.key as string;
    const ttl = await redis.ttl(key);
    
    let message = '';
    if (ttl === -1) message = 'Key exists but has no expiration';
    else if (ttl === -2) message = 'Key does not exist';
    else message = `Key expires in ${ttl} seconds`;
    
    res.json({
      success: true,
      data: { key, ttl, message }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get TTL',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 计数器增加
router.post('/increment/:key', async (req: express.Request, res: express.Response) => {
  try {
    const key = req.params.key as string;
    const { delta = 1 } = req.body;
    
    const result = await redis.increment(key, delta);
    
    res.json({
      success: true,
      message: 'Counter incremented successfully',
      data: { key, delta, newValue: result }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to increment counter',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 清空所有缓存
router.delete('/flush', async (req: express.Request, res: express.Response) => {
  try {
    const result = await redis.flushAll();
    
    res.json({
      success: true,
      message: 'All cache cleared successfully',
      data: { result }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to flush cache',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as cacheRoutes }; 