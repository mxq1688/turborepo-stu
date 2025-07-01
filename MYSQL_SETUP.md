# 🗄️ MySQL 本地服务设置完成

已为你的Turborepo项目成功添加MySQL本地服务！

## 📁 新增文件

- `docker-compose.yml` - Docker Compose配置
- `database/init/01-init.sql` - 数据库初始化脚本
- `database/README.md` - 数据库文档
- `apps/api-node/prisma/schema.prisma` - Prisma数据模型
- `apps/api-node/.env.example` - 环境变量示例

## 🚀 快速启动

### 1. 启动MySQL服务
```bash
npm run db:up
```

### 2. 启动phpMyAdmin (可选)
```bash
npm run phpmyadmin
```
访问: http://localhost:8080

### 3. 配置API环境变量
```bash
cd apps/api
cp .env.example .env
```

### 4. 生成Prisma客户端
```bash
cd apps/api
npm run db:generate
```

## 🔗 服务端口

- MySQL: `localhost:3306`
- phpMyAdmin: `http://localhost:8080`
- Node.js API: `http://localhost:3002`
- Python API: `http://localhost:3003`
- Vue Web: `http://localhost:3004`
- Next.js Web: `http://localhost:3000`


## 🗃️ 数据库连接

```env
DATABASE_URL="mysql://developer:dev123@localhost:3306/turborepo_dev"
```

## 📝 预设数据

数据库已自动创建:
- 3个示例用户
- 3个示例产品
- 用户、产品、订单表结构

## 🛠️ 常用命令

```bash
# 数据库管理
npm run db:up      # 启动数据库
npm run db:down    # 停止数据库
npm run db:reset   # 重置数据库
npm run db:logs    # 查看日志

# Prisma操作 (在 apps/api-node 目录)
npm run db:generate  # 生成客户端
npm run db:push      # 推送模式
npm run db:studio    # 打开Studio
```

现在你可以在后端应用中使用MySQL数据库了！🎉
