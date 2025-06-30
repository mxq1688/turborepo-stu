<template>
  <div class="login-page">
    <div class="container">
      <div class="login-form-container">
        <div class="card">
          <h2 class="form-title">登录</h2>
          <p class="form-subtitle">欢迎回来！请登录您的账户</p>
          
          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="email" class="form-label">邮箱</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="form-input"
                placeholder="请输入您的邮箱"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="password" class="form-label">密码</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                class="form-input"
                placeholder="请输入您的密码"
                required
              >
            </div>
            
            <div v-if="userStore.error" class="error-message">
              {{ userStore.error }}
            </div>
            
            <button 
              type="submit" 
              class="btn btn-primary login-btn"
              :disabled="userStore.isLoading"
            >
              {{ userStore.isLoading ? '登录中...' : '登录' }}
            </button>
          </form>
          
          <div class="form-footer">
            <p>还没有账户？ <router-link to="/register">立即注册</router-link></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  email: '',
  password: ''
})

const handleLogin = async () => {
  const success = await userStore.login(form.value)
  if (success) {
    router.push('/dashboard')
  }
}

onMounted(() => {
  userStore.clearError()
})
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  padding: 2rem 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-form-container {
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
}

.form-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}

.login-btn {
  width: 100%;
  margin-top: 1rem;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.form-footer a {
  color: #007bff;
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .login-form-container {
    max-width: 100%;
    padding: 0 1rem;
  }
}
</style>