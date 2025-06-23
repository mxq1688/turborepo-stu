import express from 'express';

const router = express.Router();

// 健康检查端点
router.get('/', (req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export { router as healthRoutes }; 