# API Backend

这是一个基于Express.js的后端API应用，集成在Turborepo中。

## 功能特性

- 🚀 Express.js服务器
- 🔒 安全中间件 (Helmet, CORS)
- 📝 TypeScript支持
- 🔄 共享类型定义 (`@repo/shared-types`)
- 🛣️ RESTful API路由
- 🏥 健康检查端点
- 🔥 热重载开发

## API端点

### 健康检查
- `GET /health` - 服务器健康状态

### 用户管理
- `GET /api/users` - 获取所有用户
- `GET /api/users/:id` - 根据ID获取用户
- `POST /api/users` - 创建新用户
- `PUT /api/users/:id` - 更新用户信息
- `DELETE /api/users/:id` - 删除用户

## 环境变量

创建 `.env` 文件：

```bash
# API配置
PORT=3002
NODE_ENV=development

# 数据库配置 (可选)
# DATABASE_URL=postgresql://username:password@localhost:5432/mydb

# JWT配置 (可选)
# JWT_SECRET=your-super-secret-key

# CORS配置 (可选)
# CORS_ORIGIN=http://localhost:3000
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式 (在根目录运行)
npm run dev

# 或者只启动API服务
turbo run dev --filter=api

# 构建
turbo run build --filter=api

# 生产模式运行
turbo run start --filter=api
```

## 示例请求

### 获取所有用户
```bash
curl http://localhost:3002/api/users
```

### 创建用户
```bash
curl -X POST http://localhost:3002/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

### 健康检查
```bash
curl http://localhost:3002/health
``` 