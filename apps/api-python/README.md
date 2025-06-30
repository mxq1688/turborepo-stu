# 🐍 Python FastAPI Backend

基于FastAPI的Python后端API服务，提供用户管理和健康检查功能。

## ✨ 功能特性

- **FastAPI框架** - 高性能异步API框架
- **MySQL数据库** - 使用aiomysql进行异步数据库操作
- **用户管理** - 完整的CRUD操作
- **API文档** - 自动生成的Swagger文档
- **健康检查** - 包含数据库状态监控
- **错误处理** - 完善的异常处理机制

## 🚀 快速开始

### 安装依赖
```bash
pip install -r requirements.txt
```

### 启动服务
```bash
# 开发模式
python -m uvicorn src.main:app --reload --port 3003

# 或使用start.py
python start.py
```

### Docker启动
```bash
# 使用docker-compose启动
npm run python:up

# 查看日志
npm run python:logs

# 进入容器
npm run python:shell
```

## 📚 API文档

启动服务后访问：
- **Swagger UI**: http://localhost:3003/docs
- **ReDoc**: http://localhost:3003/redoc

## 🗃️ 数据库连接

### 环境变量配置
```env
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=turborepo_dev
DB_USERNAME=developer
DB_PASSWORD=dev123
```

### 数据库功能
- 异步连接池管理
- 自动重连机制
- 健康检查监控
- 事务支持

## 🛠️ API端点

### 健康检查
```http
GET /health
```

### 用户管理
```http
GET    /api/users          # 获取所有用户
GET    /api/users/{id}     # 获取用户详情
POST   /api/users          # 创建用户
PUT    /api/users/{id}     # 更新用户
DELETE /api/users/{id}     # 删除用户
```

### 用户数据模型
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "name": "John Doe",
  "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=john_doe",
  "email_verified": false,
  "is_active": true,
  "last_login": null,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

## 🔧 开发指南

### 项目结构
```
src/
├── main.py              # 应用主文件
├── models/              # 数据模型
│   └── user.py         # 用户模型和仓库
├── routes/              # 路由模块
│   ├── health.py       # 健康检查
│   └── users.py        # 用户管理
└── services/            # 服务层
    └── database.py     # 数据库服务
```

### 添加新的API端点

1. 在`routes/`目录创建新的路由文件
2. 在`main.py`中注册路由
3. 在`models/`目录添加对应的数据模型

### 数据库操作示例

```python
from src.services.database import get_database_service

async def example_query():
    db_service = await get_database_service()
    
    async with db_service.get_connection() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cursor:
            await cursor.execute("SELECT * FROM users")
            results = await cursor.fetchall()
            return results
```

## 🧪 测试

```bash
# 运行测试
pytest

# 运行测试并查看覆盖率
pytest --cov=src tests/
```

## 📊 性能特性

- **异步处理** - 基于asyncio的高并发处理
- **连接池** - 数据库连接池优化
- **自动文档** - 基于类型注解的API文档
- **数据验证** - Pydantic模型验证

## 🔍 故障排除

### 数据库连接问题
```bash
# 检查数据库状态
curl http://localhost:3003/health

# 查看日志
npm run python:logs
```

### 常见错误
1. **ImportError**: 检查是否安装了所有依赖
2. **连接失败**: 确认MySQL服务已启动
3. **端口占用**: 检查3003端口是否被占用

## 🎯 生产部署

1. 设置环境变量
2. 使用Gunicorn或uWSGI作为WSGI服务器
3. 配置反向代理（Nginx）
4. 启用SSL/TLS加密
5. 设置日志记录和监控 