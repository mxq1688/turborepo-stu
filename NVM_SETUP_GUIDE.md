# 🔧 NVM 设置默认版本完整指南

## ✅ 当前配置状态

你的nvm已经配置成功！当前设置：
- **当前版本**: Node.js v20.5.1 (npm v9.8.0)
- **默认版本**: 20 -> v20.5.1 
- **配置文件**: ~/.zshrc ✅
- **新终端生效**: ✅

## 🚀 NVM 默认版本设置步骤

### 1. 查看已安装的版本
```bash
nvm list
```

### 2. 安装推荐版本
```bash
# 安装最新LTS版本
nvm install --lts

# 安装特定版本
nvm install 20
nvm install 18
```

### 3. 设置默认版本
```bash
# 方法一：使用版本号
nvm alias default 20

# 方法二：使用具体版本
nvm alias default 20.5.1

# 方法三：使用LTS
nvm alias default lts/*
```

### 4. 切换和使用版本
```bash
# 临时切换版本（当前终端会话有效）
nvm use 20

# 永久设置默认版本
nvm alias default 20
```

## 🛠️ 确保新终端自动生效

### 检查Shell配置文件

根据你使用的shell，nvm配置应该在以下文件中：

#### Zsh 用户 (~/.zshrc) - 你当前使用的
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
```

#### Bash 用户 (~/.bashrc 或 ~/.bash_profile)
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

### 验证配置
```bash
# 检查配置是否存在
grep -n "nvm" ~/.zshrc

# 重新加载配置
source ~/.zshrc

# 测试新终端环境
zsh -c "source ~/.zshrc && node --version"
```

## 🎯 常用NVM命令

### 版本管理
```bash
# 查看所有可安装版本
nvm list-remote

# 查看已安装版本
nvm list

# 查看当前使用版本
nvm current

# 查看默认版本
nvm version default
```

### 版本切换
```bash
# 使用特定版本
nvm use 20.5.1

# 使用最新版本
nvm use node

# 使用最新LTS版本
nvm use --lts
```

### 别名管理
```bash
# 查看所有别名
nvm alias

# 创建自定义别名
nvm alias myproject 18.17.0

# 使用自定义别名
nvm use myproject

# 删除别名
nvm unalias myproject
```

## 🔍 故障排除

### 1. 新终端Node.js版本不对
```bash
# 检查nvm是否正确加载
which nvm

# 手动重新加载配置
source ~/.zshrc

# 检查默认版本设置
nvm alias default
```

### 2. nvm命令找不到
```bash
# 重新安装nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 或使用Homebrew安装
brew install nvm
```

### 3. 权限问题
```bash
# 修复nvm目录权限
sudo chown -R $(whoami) ~/.nvm
```

### 4. 配置文件未生效
```bash
# 手动添加nvm配置到shell配置文件
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.zshrc
echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.zshrc
```

## 📊 版本选择建议

### 项目兼容性
- **Node.js 18**: 稳定的LTS版本，广泛支持
- **Node.js 20**: 较新的LTS版本，性能更好
- **Node.js 22**: 最新LTS版本，最新特性

### 对于Turborepo项目
```bash
# 推荐使用Node.js 20（满足>=18要求，性能好）
nvm install 20
nvm use 20
nvm alias default 20
```

## ✨ 快速配置脚本

如果需要快速设置，可以运行：

```bash
# 一键设置Node.js 20为默认版本
nvm install 20 && nvm use 20 && nvm alias default 20

# 验证设置
echo "当前版本: $(node --version)"
echo "默认版本: $(nvm version default)"
```

## 🎉 配置完成检查清单

- [✅] nvm已安装并可用
- [✅] 已安装合适的Node.js版本
- [✅] 已设置默认版本别名
- [✅] shell配置文件包含nvm配置
- [✅] 新终端自动使用默认版本
- [✅] `node --version` 显示正确版本

你的配置已经完成！现在每次打开新终端都会自动使用Node.js v20.5.1 🚀 