# 🚀 Turborepo 项目启动指南

## ✨ 已完成的优化

### 🎨 登录页面全新设计
- **现代化双栏布局**：左侧品牌展示，右侧登录表单
- **渐变背景设计**：紫色主题配色
- **双重登录模式**：密码登录 + 验证码登录
- **完美响应式**：桌面端/移动端自适应
- **交互体验优化**：密码显示切换、记住我、社交登录

### 📧 邮箱验证码功能
- **验证码发送**：6位数字验证码
- **安全防护**：60秒倒计时、3次尝试限制、5分钟过期
- **双后端支持**：Python API + Node.js API

## 🏃‍♂️ 快速启动

### 1. 启动优化后的登录页面
```bash
# 进入Vue应用目录
cd apps/web-vue

# 安装依赖（如果还未安装）
npm install

# 启动开发服务器
npm run dev
```

**访问地址**：http://localhost:3004/login

### 2. 启动验证码服务（可选）

#### Python API 验证码服务
```bash
# 启动Python API（端口3003）
npm run python:up

# 或手动启动
cd apps/api-python
pip install -r requirements.txt
python -m uvicorn src.main:app --reload --port 3003
```

#### Node.js API 标准登录
```bash
# 启动Node.js API（端口3002）
cd apps/api
npm run dev
```

### 3. 启动数据库服务（可选）
```bash
# 启动MySQL和Redis
npm run db:up

# 启动所有后端服务
npm run services:up
```

## 🎯 功能测试

### 🔐 密码登录测试
1. 访问 http://localhost:3004/login
2. 选择"密码登录"标签
3. 输入邮箱和密码
4. 点击登录

### 📱 验证码登录测试
1. 访问 http://localhost:3004/login
2. 选择"验证码登录"标签
3. 输入邮箱地址
4. 点击"获取验证码"按钮
5. 查看控制台获取验证码（开发环境）
6. 输入验证码并登录

**验证码API测试**：
```bash
# 发送验证码
curl -X POST http://localhost:3003/api/auth/send-verification-code \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# 验证码登录
curl -X POST http://localhost:3003/api/auth/login-with-code \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "verificationCode": "123456"}'
```

## 🎨 设计特色

### 📱 响应式设计
- **桌面端（>1024px）**：双栏布局，左侧品牌右侧表单
- **平板端（768-1024px）**：隐藏左侧装饰，全宽表单
- **移动端（<768px）**：垂直布局，优化触摸交互

### 🎭 视觉元素
- **渐变背景**：`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **毛玻璃效果**：`backdrop-filter: blur(10px)`
- **SVG图标**：邮件、密码、验证码图标
- **动画效果**：按钮悬停、加载状态

### 🔧 交互功能
- **标签切换**：密码/验证码登录模式
- **密码显示**：眼睛图标切换密码可见性
- **验证码倒计时**：60秒重发限制
- **表单验证**：实时错误提示
- **加载状态**：登录过程指示

## 🛠️ 开发环境配置

### Node.js 版本要求
```bash
# 检查Node.js版本（建议18+）
node --version

# 如果版本过低，建议升级
# 使用nvm升级：nvm install 18 && nvm use 18
```

### 依赖安装
```bash
# 根目录安装所有依赖
npm install

# 单独安装Vue应用依赖
cd apps/web-vue && npm install

# 单独安装Python API依赖
cd apps/api-python && pip install -r requirements.txt
```

## 📊 服务端口总览

| 服务 | 端口 | 访问地址 | 状态 |
|------|------|----------|------|
| Vue Web | 3004 | http://localhost:3004 | ✅ 优化完成 |
| Python API | 3003 | http://localhost:3003 | ✅ 验证码功能 |
| Node.js API | 3002 | http://localhost:3002 | ✅ 标准登录 |
| PHP Web | 3005 | http://localhost:3005 | ✅ 已连接DB |
| MySQL | 3306 | localhost:3306 | 🔧 需要Docker |
| Redis | 6379 | localhost:6379 | 🔧 需要Docker |

## 🔍 故障排除

### 常见问题

#### 1. Vue应用启动失败
```bash
# 清理node_modules重新安装
cd apps/web-vue
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### 2. TypeScript配置错误
```bash
# 检查tsconfig.json配置
# 确保不依赖@repo/typescript-config包
```

#### 3. 验证码功能测试
```bash
# 检查Python API状态
curl http://localhost:3003/health

# 查看Python API日志
npm run python:logs
```

#### 4. 端口被占用
```bash
# 查看端口占用
lsof -i :3004

# 终止占用进程
kill -9 <PID>
```

### Docker相关

#### 启动Docker服务
```bash
# macOS
open /Applications/Docker.app

# 或命令行启动
sudo systemctl start docker  # Linux
```

#### 数据库连接
```bash
# 启动MySQL和Redis
npm run db:up

# 检查容器状态
docker ps

# 查看数据库日志
npm run db:logs
```

## 🎉 成功标志

当您看到以下输出时，表示启动成功：

### Vue应用启动成功
```
  VITE v5.0.8  ready in 500ms

  ➜  Local:   http://localhost:3004/
  ➜  Network: use --host to expose
```

### Python API启动成功
```
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
🚀 Initializing database connection...
✅ Database connection initialized successfully
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:3003
```

### 验证码测试成功
```
📧 模拟发送验证码邮件:
收件人: test@example.com
验证码: 123456
验证码已保存到数据库，有效期 5 分钟
--------------------------------------------------
```

## 🔮 未来扩展

1. **真实邮件服务**：集成SendGrid、Mailgun等
2. **短信验证码**：添加手机号验证
3. **社交登录**：Google、GitHub、Apple登录
4. **多因素认证**：TOTP、硬件密钥支持
5. **密码重置**：忘记密码功能
6. **登录历史**：设备管理和安全日志

现在您可以享受全新优化的登录体验了！🎨✨ 