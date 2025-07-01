# PHP Web Application

这是一个基于Docker的PHP 8.2 + Apache Web应用，集成在Turborepo中。

## 🚀 功能特性

- **PHP 8.2** + Apache 服务器
- **Docker 容器化** - 无需本地安装PHP环境
- **RESTful API** - 完整的用户CRUD操作
- **MySQL 集成** - 连接共享的MySQL数据库
- **Composer** - PHP依赖管理
- **PSR-4 自动加载** - 现代PHP项目结构
- **错误处理** - 完善的异常处理机制

## 📁 项目结构

```
apps/api-php/
├── public/
│   └── index.php          # 应用入口点
├── src/
│   ├── Controllers/       # 控制器
│   │   ├── ApiController.php
│   │   └── UserController.php
│   └── Services/         # 服务类
│       └── DatabaseService.php
├── config/
│   └── database.php      # 数据库配置
├── composer.json         # PHP依赖配置
├── Dockerfile           # Docker构建文件
├── apache-config.conf   # Apache配置
└── README.md
```

## 🔧 API端点

### 健康检查
- `GET /health` - 服务器健康状态

### 用户管理
- `GET /api/users` - 获取所有用户
- `GET /api/users/{id}` - 根据ID获取用户
- `POST /api/users` - 创建新用户
- `PUT /api/users/{id}` - 更新用户信息
- `DELETE /api/users/{id}` - 删除用户

## 🚀 快速启动

### 方法1: 使用根目录脚本
```bash
# 启动所有服务（MySQL + PHP）
npm run services:up

# 只启动PHP应用
npm run php:up

# 查看PHP应用日志
npm run php:logs

# 进入PHP容器
npm run php:shell

# 停止所有服务
npm run services:down
```

### 方法2: 使用Docker Compose
```bash
# 启动PHP应用
docker-compose up -d php-app

# 查看日志
docker-compose logs -f php-app

# 进入容器
docker-compose exec php-app bash
```

### 方法3: 在应用目录内
```bash
cd apps/api-php

# 启动开发服务器
npm run dev

# 查看日志
npm run logs

# 进入容器
npm run shell
```

## 🌐 访问应用

- **PHP应用**: http://localhost:3005
- **健康检查**: http://localhost:3005/health
- **用户API**: http://localhost:3005/api/users
- **phpMyAdmin**: http://localhost:8080

## 📊 数据库连接

PHP应用自动连接到共享的MySQL数据库：

```php
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=turborepo_dev
DB_USERNAME=developer
DB_PASSWORD=dev123
```

## 🛠️ 开发工具

### Composer操作
```bash
# 安装依赖
npm run composer install

# 添加新包
npm run composer require package/name

# 运行测试
npm run composer test

# 静态分析
npm run composer analyse
```

### 容器管理
```bash
# 重启PHP服务
npm run php:down && npm run php:up

# 重新构建容器
docker-compose build php-app

# 查看容器状态
docker-compose ps
```

## 📝 示例请求

### 获取所有用户
```bash
curl http://localhost:3005/api/users
```

### 创建用户
```bash
curl -X POST http://localhost:3005/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

### 健康检查
```bash
curl http://localhost:3005/health
```

## 🔍 日志查看

```bash
# PHP应用日志
npm run php:logs

# Apache访问日志
docker-compose exec php-app tail -f /var/log/apache2/access.log

# Apache错误日志
docker-compose exec php-app tail -f /var/log/apache2/error.log
```

## 🐛 故障排除

### 常见问题

1. **容器启动失败**
   ```bash
   # 检查容器状态
   docker-compose ps
   
   # 查看错误日志
   npm run php:logs
   ```

2. **数据库连接失败**
   - 确保MySQL服务已启动: `npm run db:up`
   - 检查数据库连接配置

3. **权限问题**
   ```bash
   # 重新设置权限
   docker-compose exec php-app chown -R www-data:www-data /var/www/html
   ```

## 📦 依赖管理

主要PHP依赖包：
- `vlucas/phpdotenv` - 环境变量管理
- `ramsey/uuid` - UUID生成
- `phpunit/phpunit` - 单元测试
- `phpstan/phpstan` - 静态分析

## 🎯 下一步

- 添加身份验证
- 实现缓存机制
- 添加API文档（Swagger）
- 集成日志系统
- 性能监控

现在你可以通过 http://localhost:3005 访问PHP应用了！🎉
