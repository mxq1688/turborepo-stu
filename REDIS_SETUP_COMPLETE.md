# 🔗 Redis 服务设置完成

已成功为你的Turborepo项目添加Redis缓存服务！Redis是一个高性能的内存数据库，用于缓存、会话存储、消息队列等。

## 📦 新增内容

### **Redis服务**
- ✅ **Redis 7 Alpine** - 轻量级高性能版本
- ✅ **Redis Commander** - Web管理界面
- ✅ **数据持久化** - 数据不会因容器重启丢失
- ✅ **密码保护** - 安全的Redis访问

### **Node.js API集成** (`apps/api-node/`)
- ✅ **IORedis客户端** - 高性能Redis客户端
- ✅ **Redis服务类** - 单例模式连接管理
- ✅ **缓存API路由** - 完整的Redis操作API
- ✅ **错误处理** - 完善的异常处理机制

### **PHP API集成** (`apps/api-php/`)
- ✅ **Predis客户端** - PHP Redis客户端
- ✅ **Redis服务类** - 单例模式连接管理
- ✅ **缓存API路由** - 完整的Redis操作API
- ✅ **Redis扩展** - 原生PHP Redis支持

## 🌐 服务端口分配

| 服务 | 端口 | 访问地址 | 用途 |
|------|------|----------|------|
| MySQL | 3306 | localhost:3306 | 数据库 |
| phpMyAdmin | 8080 | http://localhost:8080 | 数据库管理 |
| **Redis** | **6379** | **localhost:6379** | **缓存服务** |
| **Redis Commander** | **8081** | **http://localhost:8081** | **Redis管理** |
| Node.js API | 3002 | http://localhost:3002 | 后端API |
| Python API | 3003 | http://localhost:3003 | 后端API |
| Vue Web | 3004 | http://localhost:3004 | 前端应用 |
| PHP Web | 3005 | http://localhost:3005 | 后端API |
| Next.js Web | 3000 | http://localhost:3000 | 前端应用 |


## 🔧 Redis连接信息

### 基本连接
- **主机**: localhost (容器内: redis)
- **端口**: 6379
- **密码**: redis123
- **数据库**: 0 (默认)

### Redis Commander (Web管理)
- **URL**: http://localhost:8081
- **用户名**: admin
- **密码**: admin123

## 🚀 快速启动

### 启动所有服务
```bash
# 启动所有服务 (MySQL + Redis + PHP + phpMyAdmin + Redis Commander)
npm run services:up
```

### 单独管理Redis
```bash
# 启动Redis
npm run redis:up

# 停止Redis
npm run redis:down

# 查看Redis日志
npm run redis:logs

# 进入Redis CLI
npm run redis:cli

# 启动Redis Commander
npm run redis:commander

# 清空所有缓存
npm run redis:flush
```

## 🔧 API端点

### Node.js API (端口3002)
```bash
# Redis健康检查
GET http://localhost:3002/api/cache/ping

# 设置缓存
POST http://localhost:3002/api/cache/set
{
  "key": "test",
  "value": "hello",
  "ttl": 3600
}

# 获取缓存
GET http://localhost:3002/api/cache/get/test

# 删除缓存
DELETE http://localhost:3002/api/cache/delete/test

# 获取所有键
GET http://localhost:3002/api/cache/keys

# 计数器
POST http://localhost:3002/api/cache/increment/counter
{"delta": 5}
```

### PHP API (端口3005)
```bash
# Redis健康检查
GET http://localhost:3005/api/cache/ping

# 设置缓存
POST http://localhost:3005/api/cache/set
{
  "key": "test",
  "value": "hello",
  "ttl": 3600
}

# 获取缓存
GET http://localhost:3005/api/cache/get/test

# 删除缓存
DELETE http://localhost:3005/api/cache/delete/test

# 获取所有键
GET http://localhost:3005/api/cache/keys

# 计数器
POST http://localhost:3005/api/cache/increment/counter
{"delta": 5}
```

## 🧪 测试Redis

### 基本操作测试
```bash
# 测试Redis连接
curl http://localhost:3002/api/cache/ping
curl http://localhost:3005/api/cache/ping

# 设置缓存值
curl -X POST http://localhost:3002/api/cache/set \
  -H "Content-Type: application/json" \
  -d '{"key":"test","value":"Hello Redis!","ttl":300}'

# 获取缓存值
curl http://localhost:3002/api/cache/get/test

# 查看所有键
curl http://localhost:3002/api/cache/keys
```

### 高级功能测试
```bash
# 测试计数器
curl -X POST http://localhost:3002/api/cache/increment/visits \
  -H "Content-Type: application/json" \
  -d '{"delta":1}'

# 检查键是否存在
curl http://localhost:3002/api/cache/exists/test

# 查看键的过期时间
curl http://localhost:3002/api/cache/ttl/test
```

## 🛠️ 常用命令

### Redis CLI操作
```bash
# 进入Redis命令行
npm run redis:cli

# 在Redis CLI中执行:
redis> SET mykey "Hello"
redis> GET mykey
redis> KEYS *
redis> TTL mykey
redis> DEL mykey
redis> FLUSHALL
```

### 开发调试
```bash
# 查看Redis日志
npm run redis:logs

# 清空所有缓存
npm run redis:flush

# 重启Redis服务
npm run redis:down && npm run redis:up
```

## 💡 使用场景

### 1. **API响应缓存**
```javascript
// Node.js示例
const cachedData = await redis.get('api:users:all');
if (!cachedData) {
  const users = await database.getUsers();
  await redis.set('api:users:all', JSON.stringify(users), 300); // 5分钟缓存
  return users;
}
return JSON.parse(cachedData);
```

### 2. **会话存储**
```php
// PHP示例
$sessionId = session_id();
$redis->set("session:{$sessionId}", json_encode($userData), 3600); // 1小时
```

### 3. **计数器和统计**
```bash
# 页面访问计数
curl -X POST http://localhost:3002/api/cache/increment/page:home:views

# 用户在线统计
curl -X POST http://localhost:3002/api/cache/increment/users:online
```

### 4. **消息队列**
```javascript
// 使用列表作为队列
await redis.listPush('task:queue', JSON.stringify(task));
const task = await redis.listPop('task:queue');
```

## 🎯 现在你拥有了

1. **高性能缓存系统**: Redis 7 内存数据库
2. **Web管理界面**: Redis Commander可视化管理
3. **多语言支持**: Node.js和PHP都可以使用Redis
4. **完整的API**: 涵盖所有常用Redis操作
5. **数据持久化**: 容器重启不丢失数据
6. **安全配置**: 密码保护和访问控制

Redis将大大提升你的应用性能，特别适合缓存、会话管理、实时数据等场景！

访问 http://localhost:8081 开始使用Redis Commander管理界面！🎉
