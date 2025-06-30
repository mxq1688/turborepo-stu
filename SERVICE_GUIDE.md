# 🚀 Turborepo 服务启动指南

这份指南包含了项目中所有服务的详细信息和启动方法。

## 📋 服务总览

### 🎨 前端应用 (3个)
| 服务 | 端口 | 技术栈 | 描述 |
|------|------|--------|------|
| **Next.js Web** | 3000 | Next.js 15 + Turbopack | 主要Web应用 |
| **Next.js Docs** | 3001 | Next.js 15 + Turbopack | 文档站点 |
| **Vue Web** | 3004 | Vue 3 + Vite | Vue前端应用 |

### 🔧 后端API (3个)
| 服务 | 端口 | 技术栈 | 数据库连接 | 描述 |
|------|------|--------|------------|------|
| **Node.js API** | 3002 | Express + Prisma | ✅ MySQL | 主要API服务 |
| **Python API** | 3003 | FastAPI + Uvicorn | ✅ MySQL + Redis | Python API (支持Docker) |
| **PHP 应用** | 3005 | PHP 8.2 + Apache | ✅ MySQL + Redis | PHP Web应用 |

### 🗄️ 数据库与工具 (5个)
| 服务 | 端口 | 技术栈 | 描述 |
|------|------|--------|------|
| **MySQL** | 3306 | MySQL 8.0 | 主数据库 |
| **Redis** | 6379 | Redis 7 | 缓存数据库 |
| **phpMyAdmin** | 8080 | Web界面 | MySQL管理工具 |
| **Redis Commander** | 8081 | Web界面 | Redis管理工具 |

## 🚀 启动方式

### 方式1: 一键启动所有服务 (推荐)

```bash
# 启动所有Docker服务 (数据库、工具)
npm run services:up

# 启动所有应用 (前端、后端)
npm run dev
```

### 方式2: 分步启动

#### 1️⃣ 启动基础服务 (数据库 + 工具)

```bash
# 只启动MySQL
npm run db:up

# 启动MySQL + phpMyAdmin
npm run phpmyadmin

# 启动Redis
npm run redis:up

# 启动Redis管理工具
npm run redis:commander

# 启动所有Docker服务
npm run services:up
```

#### 2️⃣ 启动前端应用

```bash
# 启动所有前端应用
npm run dev

# 或单独启动
cd apps/web && npm run dev         # Next.js Web (3000)
cd apps/docs && npm run dev        # Next.js Docs (3001)
cd apps/web-vue && npm run dev     # Vue Web (3004)
```

#### 3️⃣ 启动后端API

```bash
# Node.js API (需要先启动MySQL)
cd apps/api
npm run db:generate  # 生成Prisma客户端
npm run dev         # 启动API (3002)

# Python API (Docker运行，默认)
cd apps/api-python && npm run dev  # 启动Docker容器 (3003)

# Python API (本地运行)
cd apps/api-python && npm run dev:local  # 本地Python运行 (3003)

# PHP应用 (通过Docker)
npm run php:up      # 启动PHP应用 (3005)
```

## 🔧 开发工具命令

### 数据库管理

```bash
# MySQL操作
npm run db:up        # 启动MySQL
npm run db:down      # 停止MySQL
npm run db:reset     # 重置MySQL (删除所有数据)
npm run db:logs      # 查看MySQL日志

# Prisma操作 (在 apps/api 目录下)
cd apps/api
npm run db:generate  # 生成Prisma客户端
npm run db:push      # 推送数据库模式
npm run db:studio    # 打开Prisma Studio
npm run db:migrate   # 创建数据库迁移
```

### Redis管理

```bash
npm run redis:up         # 启动Redis
npm run redis:down       # 停止Redis
npm run redis:logs       # 查看Redis日志
npm run redis:cli        # 连接Redis命令行
npm run redis:flush      # 清空Redis数据
npm run redis:commander  # 启动Redis管理界面
```

### Python应用管理

```bash
npm run python:up         # 启动Python API容器
npm run python:down       # 停止Python API容器
npm run python:logs       # 查看Python API日志
npm run python:shell      # 进入Python容器
npm run python:build      # 构建Python Docker镜像
```

### PHP应用管理

```bash
npm run php:up         # 启动PHP应用
npm run php:down       # 停止PHP应用
npm run php:logs       # 查看PHP日志
npm run php:shell      # 进入PHP容器
npm run php:composer   # 运行Composer命令
```

## 🌐 访问地址

### 前端应用
- **Next.js Web**: http://localhost:3000
- **Next.js Docs**: http://localhost:3001
- **Vue Web**: http://localhost:3004

### 后端API
- **Node.js API**: http://localhost:3002
  - 健康检查: http://localhost:3002/health
  - API文档: 参考 `apps/api/API_DOCUMENTATION.md`
- **Python API**: http://localhost:3003
  - API文档: http://localhost:3003/docs
- **PHP 应用**: http://localhost:3005
  - 健康检查: http://localhost:3005/health

### 管理工具
- **phpMyAdmin**: http://localhost:8080
  - 用户名: `developer`
  - 密码: `dev123`
- **Redis Commander**: http://localhost:8081
  - 用户名: `admin`
  - 密码: `admin123`

## 🔑 数据库连接信息

### MySQL
```
Host: localhost
Port: 3306
Database: turborepo_dev
Username: developer
Password: dev123
Root Password: root123

连接字符串: mysql://developer:dev123@localhost:3306/turborepo_dev
```

### Redis
```
Host: localhost
Port: 6379
Password: redis123
```

## 🛑 停止所有服务

```bash
# 停止所有Docker服务
npm run services:down

# 或分别停止
npm run db:down       # 停止MySQL
npm run redis:down    # 停止Redis
npm run php:down      # 停止PHP应用

# 停止所有Node.js进程
pkill -f "tsx watch"
pkill -f "next dev"
pkill -f "vite"
pkill -f "uvicorn"
```

## 📊 服务依赖关系

```
MySQL (3306) ←── Node.js API (3002)
     ↑        ←── Python API (3003) ←── Redis (6379)
     └─── PHP App (3005) ←── Redis (6379)
     ↑
phpMyAdmin (8080)

Redis (6379) ←── Redis Commander (8081)

独立运行:
- Next.js Web (3000)
- Next.js Docs (3001)  
- Vue Web (3004)
```

## 🔍 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查看端口占用
   lsof -i :3002
   
   # 终止占用进程
   kill -9 <PID>
   ```

2. **Prisma客户端错误**
   ```bash
   cd apps/api
   npm run db:generate
   ```

3. **Docker容器启动失败**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

4. **MySQL连接失败**
   ```bash
   # 检查MySQL状态
   docker ps | grep mysql
   
   # 重启MySQL
   npm run db:down && npm run db:up
   ```

## 🎯 开发建议

### 开发时推荐启动顺序

1. **启动基础服务**: `npm run services:up`
2. **等待MySQL就绪**: 约10-15秒
3. **生成Prisma客户端**: `cd apps/api && npm run db:generate`
4. **启动开发服务**: `npm run dev`

### 性能优化

- 使用 `npm run dev` 一次性启动所有应用
- 数据库和Redis保持常驻，避免频繁重启
- 使用Turbopack提高Next.js构建速度

现在你可以根据需要选择合适的启动方式了！🚀 