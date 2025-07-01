# 🐘 PHP Docker 环境设置完成

已成功为你的Turborepo项目添加基于Docker的PHP 8.2 + Apache环境！

## 📁 新增文件结构

```
apps/api-php/                    # PHP应用目录
├── public/
│   └── index.php               # 应用入口点和路由
├── src/
│   ├── Controllers/            # 控制器层
│   │   ├── ApiController.php   # API控制器
│   │   └── UserController.php  # 用户控制器
│   ├── Services/               # 服务层
│   │   └── DatabaseService.php # 数据库服务
│   └── Models/                 # 模型层
│       └── User.php            # 用户模型
├── config/
│   └── database.php           # 数据库配置
├── composer.json              # PHP依赖管理
├── package.json               # NPM脚本集成
├── Dockerfile                 # Docker构建文件
├── apache-config.conf         # Apache配置
├── .env.example               # 环境变量示例
└── README.md                  # PHP应用文档

docker-compose.yml             # 更新了PHP服务配置
package.json                   # 更新了PHP相关脚本
```

## 🚀 快速启动

### 1. 启动所有服务
```bash
# 启动MySQL + PHP + phpMyAdmin
npm run services:up
```

### 2. 单独启动PHP服务
```bash
npm run php:up
```

### 3. 安装PHP依赖
```bash
npm run php:composer install
```

## 🌐 服务端口分配

| 服务 | 端口 | 访问地址 |
|------|------|----------|
| MySQL | 3306 | localhost:3306 |
| phpMyAdmin | 8080 | http://localhost:8080 |
| Node.js API | 3002 | http://localhost:3002 |
| Python API | 3003 | http://localhost:3003 |
| Vue Web | 3004 | http://localhost:3004 |
| **PHP Web** | **3005** | **http://localhost:3005** |
| Next.js Web | 3000 | http://localhost:3000 |


## 🔧 PHP API 端点

### 健康检查
- `GET http://localhost:3005/health`

### 用户管理API
- `GET http://localhost:3005/api/users` - 获取所有用户
- `GET http://localhost:3005/api/users/{id}` - 获取指定用户
- `POST http://localhost:3005/api/users` - 创建用户
- `PUT http://localhost:3005/api/users/{id}` - 更新用户
- `DELETE http://localhost:3005/api/users/{id}` - 删除用户

## 📋 功能特性

### ✅ **现代PHP环境**
- PHP 8.2 + Apache
- PSR-4 自动加载
- Composer依赖管理
- 完整的MVC架构

### ✅ **Docker化部署**
- 无需本地安装PHP
- 开发/生产环境一致
- 容器化管理

### ✅ **数据库集成**
- 共享MySQL数据库
- PDO数据库连接
- 单例模式连接池

### ✅ **RESTful API**
- JSON响应格式
- CORS跨域支持
- 错误处理机制

## 🛠️ 常用命令

### 容器管理
```bash
npm run php:up      # 启动PHP服务
npm run php:down    # 停止PHP服务
npm run php:logs    # 查看日志
npm run php:shell   # 进入容器
```

### PHP包管理
```bash
npm run php:composer install    # 安装依赖
npm run php:composer require package/name  # 添加包
npm run php:composer test       # 运行测试
```

### 开发调试
```bash
# 查看实时日志
npm run php:logs

# 进入容器调试
npm run php:shell

# 重启服务
npm run php:down && npm run php:up
```

## 🧪 测试API

### 健康检查
```bash
curl http://localhost:3005/health
```

### 获取用户列表
```bash
curl http://localhost:3005/api/users
```

### 创建新用户
```bash
curl -X POST http://localhost:3005/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"php@example.com","name":"PHP User"}'
```

## 🎯 现在你有了

1. **4个后端API服务**:
   - Node.js (Express) - 端口3002
   - Python (FastAPI) - 端口3003
   - **PHP (Apache)** - 端口3005
   - (预留Node.js API-python - 端口3003)

2. **3个前端应用**:
   - Next.js Web - 端口3000
   
   - Vue.js Web - 端口3004

3. **数据库服务**:
   - MySQL - 端口3306
   - phpMyAdmin - 端口8080

## 🎉 完全无需本地安装PHP！

所有PHP开发都在Docker容器中进行，环境隔离且一致。你现在拥有了一个完整的多语言、多技术栈的Turborepo项目！

访问 http://localhost:3005 开始使用PHP API！🐘
