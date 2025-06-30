<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 左侧装饰区域 -->
      <div class="login-decoration">
        <div class="decoration-content">
          <div class="brand-section">
            <div class="brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1 class="brand-title">Turborepo</h1>
            <p class="brand-subtitle">现代化的全栈开发平台</p>
          </div>
          <div class="features-list">
            <div class="feature-item">
              <div class="feature-icon">🚀</div>
              <span>高性能架构</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🔒</div>
              <span>安全认证</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">⚡</div>
              <span>快速开发</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="login-form-section">
        <div class="form-container">
          <div class="form-header">
            <h2 class="form-title">欢迎回来</h2>
            <p class="form-subtitle">登录您的账户继续使用</p>
          </div>

          <!-- 登录方式选择 -->
          <div class="login-tabs">
            <button 
              :class="['tab-btn', { active: loginMode === 'password' }]"
              @click="loginMode = 'password'"
            >
              密码登录
            </button>
            <button 
              :class="['tab-btn', { active: loginMode === 'code' }]"
              @click="loginMode = 'code'"
            >
              验证码登录
            </button>
          </div>
          
          <form @submit.prevent="handleLogin" class="login-form">
            <!-- 邮箱输入 -->
            <div class="form-group">
              <div class="input-wrapper">
                <div class="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  class="form-input"
                  placeholder="请输入邮箱地址"
                  required
                >
              </div>
            </div>
            
            <!-- 密码登录 -->
            <div v-if="loginMode === 'password'" class="form-group">
              <div class="input-wrapper">
                <div class="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <circle cx="12" cy="16" r="1"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="请输入密码"
                  :required="loginMode === 'password'"
                >
                <button 
                  type="button" 
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                >
                  <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- 验证码登录 -->
            <div v-if="loginMode === 'code'" class="form-group">
              <div class="code-input-group">
                <div class="input-wrapper">
                  <div class="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 12l2 2 4-4"/>
                      <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                      <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                      <path d="M13 12h3"/>
                      <path d="M8 12h3"/>
                    </svg>
                  </div>
                  <input
                    v-model="form.verificationCode"
                    type="text"
                    class="form-input"
                    placeholder="请输入验证码"
                    maxlength="6"
                    :required="loginMode === 'code'"
                  >
                </div>
                <button 
                  type="button" 
                  class="send-code-btn"
                  @click="sendVerificationCode"
                  :disabled="!form.email || codeSending || countdown > 0"
                >
                  {{ getCodeButtonText }}
                </button>
              </div>
            </div>

            <!-- 记住我和忘记密码 -->
            <div class="form-options">
              <label class="checkbox-wrapper">
                <input type="checkbox" v-model="form.rememberMe">
                <span class="checkmark"></span>
                记住我
              </label>
              <router-link to="/forgot-password" class="forgot-link">忘记密码？</router-link>
            </div>
            
            <div v-if="error" class="error-message">
              <div class="error-icon">⚠️</div>
              {{ error }}
            </div>

            <div v-if="successMessage" class="success-message">
              <div class="success-icon">✅</div>
              {{ successMessage }}
            </div>
            
            <button 
              type="submit" 
              class="login-btn"
              :disabled="isLoading || isLoginDisabled"
            >
              <span v-if="isLoading" class="loading-spinner"></span>
              {{ getLoginButtonText }}
            </button>
          </form>
          
          <div class="form-footer">
            <div class="divider">
              <span>或</span>
            </div>
            
            <div class="social-login">
              <button class="social-btn google-btn">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                使用 Google 登录
              </button>
            </div>
            
            <p class="register-link">
              还没有账户？ 
              <router-link to="/register">立即注册</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginMode = ref<'password' | 'code'>('password')
const showPassword = ref(false)
const codeSending = ref(false)
const countdown = ref(0)
const error = ref('')
const successMessage = ref('')
const isLoading = ref(false)

const form = ref({
  email: '',
  password: '',
  verificationCode: '',
  rememberMe: false
})

// 倒计时定时器
let countdownTimer: NodeJS.Timeout | null = null

const getCodeButtonText = computed(() => {
  if (codeSending.value) return '发送中...'
  if (countdown.value > 0) return `${countdown.value}s 后重发`
  return '获取验证码'
})

const getLoginButtonText = computed(() => {
  if (isLoading.value) return '登录中...'
  return loginMode.value === 'password' ? '密码登录' : '验证码登录'
})

const isLoginDisabled = computed(() => {
  if (!form.value.email) return true
  if (loginMode.value === 'password') {
    return !form.value.password
  } else {
    return !form.value.verificationCode || form.value.verificationCode.length !== 6
  }
})

const sendVerificationCode = async () => {
  if (!form.value.email) {
    error.value = '请先输入邮箱地址'
    return
  }

  codeSending.value = true
  error.value = ''
  
  try {
    const response = await fetch('http://localhost:3003/api/auth/send-verification-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: form.value.email }),
    })

    const data = await response.json()
    
    if (response.ok && data.success) {
      successMessage.value = '验证码已发送，请查收邮件'
      startCountdown()
    } else {
      error.value = data.error || '发送验证码失败'
    }
  } catch (err) {
    error.value = '网络错误，请稍后重试'
  } finally {
    codeSending.value = false
  }
}

const startCountdown = () => {
  countdown.value = 60
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer!)
      countdownTimer = null
    }
  }, 1000)
}

const handleLogin = async () => {
  isLoading.value = true
  error.value = ''
  successMessage.value = ''
  
  try {
    let success = false
    
    if (loginMode.value === 'password') {
      success = await userStore.login({
        email: form.value.email,
        password: form.value.password
      })
    } else {
      // 验证码登录
      const response = await fetch('http://localhost:3003/api/auth/login-with-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.value.email,
          verificationCode: form.value.verificationCode
        }),
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        // 模拟登录成功
        success = await userStore.login({
          email: form.value.email,
          password: 'temp_password' // 临时密码，实际应该由后端处理
        })
      } else {
        error.value = data.error || '验证码验证失败'
      }
    }
    
    if (success) {
      router.push('/dashboard')
    } else {
      error.value = userStore.error || '登录失败'
    }
  } catch (err) {
    error.value = '网络错误，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 切换登录模式时清空错误信息
watch(loginMode, () => {
  error.value = ''
  successMessage.value = ''
})

onMounted(() => {
  userStore.clearError()
})

// 清理定时器
onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

/* 左侧装饰区域 */
.login-decoration {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.login-decoration::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.1;
}

.decoration-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
}

.brand-section {
  margin-bottom: 3rem;
}

.brand-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.brand-icon svg {
  width: 40px;
  height: 40px;
  color: white;
}

.brand-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 2rem;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.feature-icon {
  font-size: 1.5rem;
}

/* 右侧登录表单 */
.login-form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: white;
}

.form-container {
  width: 100%;
  max-width: 420px;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  color: #718096;
  font-size: 1rem;
}

.login-tabs {
  display: flex;
  background: #f7fafc;
  border-radius: 12px;
  margin-bottom: 2rem;
  padding: 4px;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-weight: 500;
  color: #718096;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.login-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  z-index: 2;
  color: #a0aec0;
  width: 20px;
  height: 20px;
}

.form-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.password-toggle {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.code-input-group {
  display: flex;
  gap: 0.75rem;
}

.code-input-group .input-wrapper {
  flex: 1;
}

.send-code-btn {
  padding: 1rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.send-code-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.send-code-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #4a5568;
}

.checkbox-wrapper input {
  margin-right: 0.5rem;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e53e3e;
  background: #fed7d7;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #38a169;
  background: #c6f6d5;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.login-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.form-footer {
  text-align: center;
}

.divider {
  position: relative;
  margin: 2rem 0;
  text-align: center;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e2e8f0;
}

.divider span {
  background: white;
  padding: 0 1rem;
  color: #a0aec0;
  font-size: 0.9rem;
}

.social-login {
  margin-bottom: 2rem;
}

.social-btn {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-weight: 500;
  color: #4a5568;
}

.social-btn:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.register-link {
  color: #718096;
  font-size: 0.9rem;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .login-decoration {
    display: none;
  }
  
  .login-form-section {
    flex: none;
    width: 100%;
  }
}

@media (max-width: 640px) {
  .login-form-section {
    padding: 1rem;
  }
  
  .form-title {
    font-size: 2rem;
  }
  
  .code-input-group {
    flex-direction: column;
  }
  
  .send-code-btn {
    width: 100%;
  }
}
</style>