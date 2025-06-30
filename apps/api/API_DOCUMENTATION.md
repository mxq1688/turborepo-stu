# API 文档

这是基于Node.js + Express + TypeScript + Prisma + MySQL构建的RESTful API。

## 基础信息

- **Base URL**: `http://localhost:3002`
- **数据库**: MySQL (通过Prisma ORM)
- **认证**: JWT Token
- **响应格式**: JSON

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功信息"
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误信息",
  "details": { ... } // 验证错误时包含详细信息
}
```

## 认证系统

### 注册用户
**POST** `/api/auth/register`

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "name": "John Doe" // 可选
}
```

### 用户登录
**POST** `/api/auth/login`

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": 3600
  }
}
```

### 刷新令牌
**POST** `/api/auth/refresh`

```json
{
  "refreshToken": "your_refresh_token"
}
```

### 获取当前用户信息
**GET** `/api/auth/me`
> 需要认证

### 登出
**POST** `/api/auth/logout`
> 需要认证

### 登出所有设备
**POST** `/api/auth/logout-all`
> 需要认证

## 用户管理

### 获取用户列表
**GET** `/api/users?page=1&limit=10&search=keyword`
> 需要认证

**查询参数**:
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10)
- `search`: 搜索关键词

### 获取用户详情
**GET** `/api/users/:id`

### 更新用户信息
**PUT** `/api/users/:id`
> 需要认证，只能更新自己的信息

```json
{
  "name": "新名字",
  "avatar": "https://example.com/avatar.jpg"
}
```

### 停用用户
**DELETE** `/api/users/:id`
> 需要认证，管理员功能

### 用户统计
**GET** `/api/users/stats/overview`
> 需要认证

## 产品管理

### 获取产品列表
**GET** `/api/products?page=1&limit=10&category=Electronics&search=laptop&active=true`

**查询参数**:
- `page`: 页码
- `limit`: 每页数量
- `category`: 产品分类
- `search`: 搜索关键词
- `active`: 是否只显示活跃产品

### 获取产品分类
**GET** `/api/products/categories`

### 获取产品详情
**GET** `/api/products/:id`

### 创建产品
**POST** `/api/products`
> 需要认证

```json
{
  "name": "MacBook Pro",
  "description": "高性能笔记本电脑",
  "price": 1999.99,
  "category": "Electronics",
  "stock": 50,
  "imageUrl": "https://example.com/image.jpg"
}
```

### 更新产品
**PUT** `/api/products/:id`
> 需要认证

```json
{
  "name": "MacBook Pro (更新)",
  "price": 1899.99,
  "stock": 45,
  "isActive": true
}
```

### 删除产品
**DELETE** `/api/products/:id`
> 需要认证 (软删除)

### 更新库存
**PATCH** `/api/products/:id/stock`
> 需要认证

```json
{
  "stock": 10,
  "operation": "add" // "add", "subtract", "set"
}
```

## 订单管理

### 获取订单列表
**GET** `/api/orders?page=1&limit=10&status=pending&userId=123`
> 需要认证

**查询参数**:
- `page`: 页码
- `limit`: 每页数量
- `status`: 订单状态 (`pending`, `confirmed`, `shipped`, `delivered`, `cancelled`)
- `userId`: 用户ID (管理员功能)

### 获取订单详情
**GET** `/api/orders/:id`
> 需要认证，只能查看自己的订单

### 创建订单
**POST** `/api/orders`
> 需要认证

```json
{
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
  "shippingAddress": "北京市朝阳区...",
  "notes": "请尽快发货"
}
```

### 更新订单状态
**PATCH** `/api/orders/:id/status`
> 需要认证

```json
{
  "status": "confirmed"
}
```

**订单状态流程**:
- `pending` → `confirmed` → `shipped` → `delivered`
- 任何状态都可以 → `cancelled`

### 用户订单统计
**GET** `/api/orders/stats/user`
> 需要认证

## 健康检查

### 服务状态
**GET** `/health`

返回服务器状态信息。

## 缓存管理

### 缓存操作
**GET** `/api/cache`
> 查看可用的缓存操作

## 认证说明

大部分接口需要在请求头中包含JWT令牌：

```
Authorization: Bearer your_jwt_token
```

## 错误代码

- `400`: 请求参数错误
- `401`: 未认证或令牌无效
- `403`: 权限不足
- `404`: 资源未找到
- `409`: 资源冲突（如邮箱已存在）
- `500`: 服务器内部错误

## 数据模型

### User (用户)
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "name": "John Doe",
  "avatar": "https://example.com/avatar.jpg",
  "emailVerified": false,
  "isActive": true,
  "lastLogin": "2023-12-01T10:00:00Z",
  "createdAt": "2023-11-01T10:00:00Z",
  "updatedAt": "2023-12-01T10:00:00Z"
}
```

### Product (产品)
```json
{
  "id": 1,
  "name": "MacBook Pro",
  "description": "高性能笔记本电脑",
  "price": "1999.99",
  "category": "Electronics",
  "stock": 50,
  "imageUrl": "https://example.com/image.jpg",
  "isActive": true,
  "createdAt": "2023-11-01T10:00:00Z",
  "updatedAt": "2023-12-01T10:00:00Z"
}
```

### Order (订单)
```json
{
  "id": 1,
  "userId": 1,
  "totalAmount": "2099.98",
  "status": "pending",
  "shippingAddress": "北京市朝阳区...",
  "notes": "请尽快发货",
  "createdAt": "2023-12-01T10:00:00Z",
  "updatedAt": "2023-12-01T10:00:00Z",
  "orderItems": [
    {
      "id": 1,
      "productId": 1,
      "quantity": 2,
      "price": "1999.99",
      "product": { ... }
    }
  ]
}
```

## 开发环境设置

1. 启动数据库：
```bash
npm run db:up
```

2. 生成Prisma客户端：
```bash
cd apps/api
npm run db:generate
```

3. 启动API服务器：
```bash
npm run dev
```

4. 访问API：
- API: http://localhost:3002
- 数据库管理: http://localhost:8080 (phpMyAdmin)

## 注意事项

1. **权限控制**: 用户只能查看和操作自己的数据
2. **库存管理**: 创建订单时会自动减少库存，取消订单会恢复库存
3. **软删除**: 产品和用户删除采用软删除方式
4. **分页**: 列表接口都支持分页，默认每页10条记录
5. **搜索**: 支持模糊搜索用户名、邮箱、产品名称等
6. **事务**: 订单创建使用数据库事务确保数据一致性 