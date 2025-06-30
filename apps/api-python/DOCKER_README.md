# Python API Docker 配置

## 🐳 Docker 支持

Python API现在支持Docker运行，提供了更好的环境一致性和部署便利性。

## 🚀 快速启动

### 方式1: 使用根目录命令 (推荐)

```bash
# 构建镜像 (首次运行或代码变更后)
npm run python:build

# 启动Python API容器
npm run python:up

# 查看日志
npm run python:logs

# 停止容器
npm run python:down
```

### 方式2: 应用目录命令

```bash
cd apps/api-python

# Docker运行 (默认)
npm run dev

# 本地运行 (需要本地Python环境)
npm run dev:local
```

## 🔧 Docker配置特性

### 环境变量
Docker容器自动配置以下环境变量：
- `PORT=3003` - API端口
- `NODE_ENV=development` - 开发环境
- `DB_HOST=mysql` - MySQL主机
- `DB_PORT=3306` - MySQL端口
- `DB_DATABASE=turborepo_dev` - 数据库名
- `DB_USERNAME=developer` - 数据库用户
- `DB_PASSWORD=dev123` - 数据库密码
- `REDIS_HOST=redis` - Redis主机
- `REDIS_PORT=6379` - Redis端口
- `REDIS_PASSWORD=redis123` - Redis密码

### 依赖服务
Python API容器依赖以下服务：
- ✅ **MySQL** - 数据存储
- ✅ **Redis** - 缓存和会话

### 健康检查
容器包含自动健康检查：
- 检查间隔: 30秒
- 超时时间: 30秒
- 启动等待: 5秒
- 重试次数: 3次

## 🌐 访问服务

### API端点
- **主页**: http://localhost:3003/
- **健康检查**: http://localhost:3003/health
- **API文档**: http://localhost:3003/docs
- **ReDoc文档**: http://localhost:3003/redoc

### 示例请求
```bash
# 健康检查
curl http://localhost:3003/health

# 获取用户列表
curl http://localhost:3003/api/users
```

## 🛠️ 开发工具

### 进入容器调试
```bash
# 进入容器bash
npm run python:shell

# 在容器内运行Python命令
docker-compose exec python-api python -c "print('Hello from container')"

# 查看容器状态
docker-compose ps python-api
```

### 日志查看
```bash
# 实时查看日志
npm run python:logs

# 查看最近100行日志
docker-compose logs --tail=100 python-api

# 在应用目录内使用
cd apps/api-python
npm run logs    # 查看日志
npm run stop    # 停止容器
```

## 🔄 开发工作流

### Docker模式 (默认推荐)
```bash
# 1. 启动所有服务 (包括Python API)
npm run services:up

# 或者使用根目录统一启动
npm run dev  # 包含Python API Docker运行

# 代码变更需要重新构建: npm run python:build
```

### 本地模式 (需要Python环境)
```bash
# 1. 启动依赖服务 (MySQL + Redis)
npm run db:up && npm run redis:up

# 2. 本地运行Python API (支持热重载)
cd apps/api-python && npm run dev:local
```

## 🐛 故障排除

### 常见问题

1. **容器启动失败**
   ```bash
   # 查看构建日志
   npm run python:build
   
   # 检查容器状态
   docker-compose ps python-api
   ```

2. **端口冲突**
   ```bash
   # 检查端口占用
   lsof -i :3003
   
   # 停止本地Python进程
   pkill -f "uvicorn"
   ```

3. **数据库连接失败**
   ```bash
   # 确保MySQL容器运行
   docker-compose ps mysql
   
   # 重启Python容器
   npm run python:down && npm run python:up
   ```

4. **代码变更不生效**
   ```bash
   # 重新构建镜像
   npm run python:build
   
   # 重启容器
   npm run python:down && npm run python:up
   ```

## 📦 生产部署

Docker配置已针对生产环境优化：
- 使用Python 3.11 slim镜像减少体积
- 多阶段构建优化
- 健康检查确保服务可用性
- 环境变量配置支持

只需修改环境变量即可部署到生产环境。

## 🎯 性能优化

- **镜像体积**: 使用slim基础镜像
- **缓存优化**: 分层构建，依赖独立缓存
- **健康检查**: 自动检测服务状态
- **热重载**: 开发模式支持代码变更检测

现在Python API可以通过Docker获得更好的开发和部署体验！🐍🐳 