# MySQL Database Service

这是Turborepo项目的MySQL数据库服务配置。

## 🚀 快速启动

### 启动数据库服务
```bash
# 启动MySQL数据库
npm run db:up

# 启动MySQL + phpMyAdmin
npm run phpmyadmin
```

### 停止数据库服务
```bash
# 停止所有数据库服务
npm run db:down

# 重置数据库（删除所有数据）
npm run db:reset
```

## 📊 数据库信息

### 连接信息
- **主机**: localhost
- **端口**: 3306
- **数据库**: turborepo_dev
- **用户名**: developer
- **密码**: dev123
- **Root密码**: root123

### 连接字符串
```
mysql://developer:dev123@localhost:3306/turborepo_dev
```

## 🔧 phpMyAdmin

phpMyAdmin提供了Web界面来管理MySQL数据库：

- **URL**: http://localhost:8080
- **用户名**: developer
- **密码**: dev123

## 📋 预设数据表

### users (用户表)
- id: 主键
- email: 邮箱（唯一）
- name: 用户名
- avatar: 头像URL
- created_at: 创建时间
- updated_at: 更新时间

### products (产品表)
- id: 主键
- name: 产品名称
- description: 产品描述
- price: 价格
- category: 分类
- stock: 库存
- created_at: 创建时间
- updated_at: 更新时间

### orders (订单表)
- id: 主键
- user_id: 用户ID（外键）
- total_amount: 总金额
- status: 订单状态
- created_at: 创建时间
- updated_at: 更新时间

## 🛠️ 使用Prisma

API应用使用Prisma作为ORM：

```bash
# 进入API目录
cd apps/api

# 生成Prisma客户端
npm run db:generate

# 推送数据库模式
npm run db:push

# 打开Prisma Studio
npm run db:studio
```

## 📝 初始数据

数据库将自动创建以下初始数据：

**用户数据**:
- john@example.com (John Doe)
- jane@example.com (Jane Smith)  
- admin@example.com (Admin User)

**产品数据**:
- Laptop Pro ($1299.99)
- Wireless Mouse ($29.99)
- Coffee Mug ($15.99)

## 🔍 常用命令

```bash
# 查看数据库日志
npm run db:logs

# 重启数据库服务
npm run db:down && npm run db:up

# 连接到MySQL命令行
docker exec -it turborepo-mysql mysql -u developer -p turborepo_dev
```

## 🐳 Docker配置

MySQL服务运行在Docker容器中，配置包括：

- 持久化数据存储
- 健康检查
- 自动重启
- 初始化脚本执行

数据将持久化存储在Docker volume中，即使容器重启也不会丢失数据。
