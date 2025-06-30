<template>
  <div class="home-page">
    <div class="container">
      <div class="hero-section">
        <h1 class="hero-title">欢迎来到 Vue 登录系统</h1>
        <p class="hero-subtitle">
          这是一个使用 Vue 3、TypeScript 和 Pinia 构建的现代认证系统
        </p>
        
        <div class="hero-actions" v-if="!isLoggedIn">
          <router-link to="/login" class="btn btn-primary">登录</router-link>
          <router-link to="/register" class="btn btn-secondary">注册</router-link>
        </div>
        
        <div class="hero-actions" v-else>
          <router-link to="/dashboard" class="btn btn-primary">进入仪表板</router-link>
          <button @click="logout" class="btn btn-secondary">退出登录</button>
        </div>
      </div>
      
      <div class="features-section">
        <h2>功能特点</h2>
        <div class="features-grid">
          <div class="feature-card">
            <h3>🔐 安全认证</h3>
            <p>使用 JWT 令牌和 bcrypt 密码加密</p>
          </div>
          <div class="feature-card">
            <h3>🎨 现代设计</h3>
            <p>响应式设计，支持移动端和桌面端</p>
          </div>
          <div class="feature-card">
            <h3>⚡ 快速开发</h3>
            <p>使用 Vue 3 Composition API 和 TypeScript</p>
          </div>
          <div class="feature-card">
            <h3>📱 状态管理</h3>
            <p>使用 Pinia 进行状态管理</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)

const logout = () => {
  userStore.logout()
}
</script>

<style scoped>
.home-page {
  min-height: calc(100vh - 80px);
  padding: 2rem 0;
}

.hero-section {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 4rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.features-section h2 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>