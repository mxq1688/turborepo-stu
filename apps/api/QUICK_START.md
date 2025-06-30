# 🚀 API 快速启动指南

这个指南将帮助您快速启动并测试完善的MySQL API接口。

## 🛠️ 环境准备

### 1. 启动服务

```bash
# 启动MySQL数据库
npm run db:up

# 生成Prisma客户端
cd apps/api
npm run db:generate

# 启动API服务器
npm run dev
```

### 2. 验证服务状态

访问健康检查接口：
```bash
curl http://localhost:3002/health
```

## 🧪 API 测试流程

### 步骤1: 用户注册

```bash
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**期望响应**:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "your_jwt_token",
    "refreshToken": "your_refresh_token"
  }
}
```

### 步骤2: 用户登录

```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**复制返回的token，用于后续认证请求。**

### 步骤3: 获取产品列表

```bash
curl http://localhost:3002/api/products
```

### 步骤4: 获取产品分类

```bash
curl http://localhost:3002/api/products/categories
```

### 步骤5: 创建新产品

```bash
curl -X POST http://localhost:3002/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "测试商品",
    "description": "这是一个测试商品",
    "price": 99.99,
    "category": "Test",
    "stock": 100,
    "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
  }'
```

### 步骤6: 创建订单

```bash
curl -X POST http://localhost:3002/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "items": [
      {
        "productId": 1,
        "quantity": 2
      },
      {
        "productId": 2,
        "quantity": 1
      }
    ],
    "shippingAddress": "北京市朝阳区测试地址",
    "notes": "请尽快发货"
  }'
```

### 步骤7: 查看我的订单

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3002/api/orders
```

### 步骤8: 获取用户信息

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3002/api/auth/me
```

### 步骤9: 更新订单状态

```bash
curl -X PATCH http://localhost:3002/api/orders/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "status": "confirmed"
  }'
```

### 步骤10: 更新库存

```bash
curl -X PATCH http://localhost:3002/api/products/1/stock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "stock": 5,
    "operation": "add"
  }'
```

## 📊 统计信息测试

### 用户统计

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3002/api/users/stats/overview
```

### 订单统计

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3002/api/orders/stats/user
```

## 🔍 搜索和分页测试

### 搜索产品

```bash
curl "http://localhost:3002/api/products?search=laptop&page=1&limit=5"
```

### 按分类筛选产品

```bash
curl "http://localhost:3002/api/products?category=Electronics&active=true"
```

### 搜索用户

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  "http://localhost:3002/api/users?search=test&page=1&limit=10"
```

### 筛选订单

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  "http://localhost:3002/api/orders?status=pending&page=1&limit=10"
```

## 🛡️ 权限测试

### 测试未认证访问

```bash
# 这应该返回401错误
curl -X POST http://localhost:3002/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "test"}'
```

### 测试访问他人数据

```bash
# 尝试查看其他用户的订单（应该返回403错误）
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  "http://localhost:3002/api/orders?userId=999"
```

## 🧹 数据清理

### 取消订单（恢复库存）

```bash
curl -X PATCH http://localhost:3002/api/orders/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "status": "cancelled"
  }'
```

### 软删除产品

```bash
curl -X DELETE http://localhost:3002/api/products/6 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔧 Postman Collection

如果您使用Postman，可以导入以下环境变量：

```json
{
  "id": "api-environment",
  "name": "API Environment",
  "values": [
    {
      "key": "base_url",
      "value": "http://localhost:3002",
      "enabled": true
    },
    {
      "key": "auth_token",
      "value": "YOUR_JWT_TOKEN",
      "enabled": true
    }
  ]
}
```

## 📋 测试清单

- [ ] ✅ 用户注册和登录
- [ ] ✅ JWT认证工作正常
- [ ] ✅ 产品CRUD操作
- [ ] ✅ 订单创建和管理
- [ ] ✅ 库存自动管理
- [ ] ✅ 权限控制
- [ ] ✅ 搜索和分页
- [ ] ✅ 数据统计
- [ ] ✅ 错误处理

## 🐛 常见问题

### 1. 数据库连接失败
确保MySQL服务正在运行：
```bash
npm run db:up
docker ps
```

### 2. Prisma客户端错误
重新生成客户端：
```bash
cd apps/api
npm run db:generate
```

### 3. JWT令牌过期
重新登录获取新令牌，或使用refresh token刷新。

### 4. 权限被拒绝
确保在请求头中包含正确的Authorization。

## 📱 前端集成建议

### React/Vue示例

```javascript
// API客户端示例
class ApiClient {
  constructor(baseURL = 'http://localhost:3002') {
    this.baseURL = baseURL
    this.token = localStorage.getItem('token')
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` })
      },
      ...options
    }

    const response = await fetch(url, config)
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error)
    }
    
    return data.data
  }

  // 产品相关
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString()
    return this.request(`/api/products?${query}`)
  }

  async createOrder(orderData) {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    })
  }

  // 认证相关
  async login(credentials) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
    this.token = data.token
    localStorage.setItem('token', data.token)
    return data
  }
}
```

现在您的API已经完全功能化，包含了完整的用户管理、产品管理、订单管理和认证系统！🎉 