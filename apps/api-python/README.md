# Python FastAPI Backend

这是一个基于 FastAPI 的 Python 后端应用，是 Turborepo monorepo 的一部分。

## 功能特性

- 🚀 **FastAPI**: 现代、快速的 Web 框架
- 📝 **自动API文档**: 访问 `/docs` 查看交互式文档
- 🔍 **类型安全**: 使用 Pydantic 进行数据验证
- 🧪 **异步支持**: 原生异步/等待支持
- 🛡️ **CORS支持**: 跨域资源共享配置

## API 端点

### 健康检查
- `GET /health` - 应用健康状态

### 用户管理
- `GET /api/users` - 获取所有用户
- `GET /api/users/{id}` - 根据ID获取用户
- `POST /api/users` - 创建新用户
- `PUT /api/users/{id}` - 更新用户
- `DELETE /api/users/{id}` - 删除用户

## 开发

### 安装依赖
```bash
cd apps/api-python
pip install -r requirements.txt
```

### 启动开发服务器
```bash
# 在根目录
npm run dev

# 或单独启动Python API
cd apps/api-python
npm run dev
```

服务器将在 http://localhost:3003 启动

### API 文档
- Swagger UI: http://localhost:3003/docs
- ReDoc: http://localhost:3003/redoc

## 技术栈

- **FastAPI**: Web 框架
- **Pydantic**: 数据验证
- **Uvicorn**: ASGI 服务器
- **Python-dotenv**: 环境变量管理

## 端口配置

- 开发环境：3003
- 与 Node.js API (3002) 并行运行 