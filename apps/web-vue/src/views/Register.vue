<template>
  <div class="register-page">
    <div class="container">
      <div class="register-form-container">
        <div class="card">
          <h2 class="form-title">注册</h2>
          <p class="form-subtitle">创建您的新账户</p>
          
          <form @submit.prevent="handleRegister">
            <div class="form-group">
              <label for="username" class="form-label">用户名</label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                class="form-input"
                placeholder="请输入用户名"
                required
              >
            </div>
            
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
                placeholder="请输入密码"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="confirmPassword" class="form-label">确认密码</label>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                class="form-input"
                placeholder="请再次输入密码"
                required
              >
            </div>
            
            <div v-if="passwordError" class="error-message">
              {{ passwordError }}
            </div>
            
            <div v-if="userStore.error" class="error-message">
              {{ userStore.error }}
            </div>
            
            <button 
              type="submit" 
              class="btn btn-primary register-btn"
              :disabled="userStore.isLoading || !!passwordError"
            >
              {{ userStore.isLoading ? '注册中...' : '注册' }}
            </button>
          </form>
          
          <div class="form-footer">
            <p>已有账户？ <router-link to="/login">立即登录</router-link></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const passwordError = computed(() => {
  if (form.value.password && form.value.confirmPassword) {
    if (form.value.password !== form.value.confirmPassword) {
      return '两次输入的密码不一致'
    }
  }
  if (form.value.password && form.value.password.length < 6) {
    return '密码长度至少6位'
  }
  return null
})

const handleRegister = async () => {
  if (passwordError.value) return
  
  const success = await userStore.register({
    username: form.value.username,
    email: form.value.email,
    password: form.value.password
  })
  
  if (success) {
    router.push('/dashboard')
  }
}

onMounted(() => {
  userStore.clearError()
})
</script>

<style scoped>
.register-page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  padding: 2rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-form-container {
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

.register-btn {
  width: 100%;
  margin-top: 1rem;
}

.register-btn:disabled {
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
  .register-form-container {
    max-width: 100%;
    padding: 0 1rem;
  }
}
</style>