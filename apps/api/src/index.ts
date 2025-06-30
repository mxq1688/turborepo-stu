import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { userRoutes } from './routes/users.js';
import { healthRoutes } from './routes/health.js';
import { cacheRoutes } from './routes/cache.js';
import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import ordersRoutes from './routes/orders.js';

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/health', healthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cache', cacheRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);

// 全局错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404处理
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🛍️ Products API: http://localhost:${PORT}/api/products`);
  console.log(`📦 Orders API: http://localhost:${PORT}/api/orders`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
}); 