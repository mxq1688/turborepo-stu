<template>
  <div class="register-page">
    <!-- 动态背景装饰 -->
    <div class="background-decoration">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>
    
    <div class="container">
      <div class="register-form-container">
        <div class="glass-card">
          <!-- 头部区域 -->
          <div class="card-header">
            <div class="header-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h1 class="form-title">创建账户</h1>
            <p class="form-subtitle">开始您的数字化旅程</p>
          </div>
          
          <form @submit.prevent="handleRegister" class="register-form">
            <div class="form-group">
              <div class="input-wrapper">
                <div class="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <input
                  id="username"
                  v-model="form.username"
                  type="text"
                  class="form-input"
                  placeholder="用户名"
                  required
                >
                <label for="username" class="form-label">用户名</label>
              </div>
            </div>
            
            <div class="form-group">
              <div class="input-wrapper">
                <div class="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  class="form-input"
                  placeholder="邮箱地址"
                  required
                >
                <label for="email" class="form-label">邮箱地址</label>
              </div>
            </div>

            <!-- 验证码 -->
            <div class="form-group">
              <div class="input-wrapper verification-wrapper">
                <div class="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <input
                  id="verificationCode"
                  v-model="form.verificationCode"
                  type="text"
                  class="form-input verification-input"
                  placeholder="请输入6位验证码"
                  maxlength="6"
                  required
                >
                <label for="verificationCode" class="form-label">验证码</label>
                <button
                  type="button"
                  @click="handleSendCode"
                  :disabled="!form.email || !isValidEmail(form.email) || userStore.isSendingCode || userStore.codeCountdown > 0"
                  class="send-code-btn"
                >
                  <span v-if="userStore.isSendingCode" class="loading-content">
                    <svg class="loading-spinner" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="32" stroke-dashoffset="32">
                        <animate attributeName="stroke-dasharray" dur="2s" values="0 32;16 16;0 32;0 32" repeatCount="indefinite"/>
                        <animate attributeName="stroke-dashoffset" dur="2s" values="0;-16;-32;-32" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                    发送中
                  </span>
                  <span v-else-if="userStore.codeCountdown > 0">
                    {{ userStore.codeCountdown }}s
                  </span>
                  <span v-else>发送验证码</span>
                </button>
              </div>
              
              <!-- 开发环境验证码显示 -->
              <Transition name="code-display">
                <div v-if="userStore.devVerificationCode" class="dev-code-display">
                  <div class="dev-code-header">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    开发模式验证码
                  </div>
                  <div class="dev-code-value">{{ userStore.devVerificationCode }}</div>
                  <div class="dev-code-hint">仅开发环境显示，生产环境会发送到邮箱</div>
                </div>
              </Transition>
            </div>
            
            <div class="form-group">
              <div class="input-wrapper">
                <div class="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="16" r="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <input
                  id="password"
                  v-model="form.password"
                  type="password"
                  class="form-input"
                  placeholder="密码"
                  required
                >
                <label for="password" class="form-label">密码</label>
              </div>
            </div>
            
            <div class="form-group">
              <div class="input-wrapper">
                <div class="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  type="password"
                  class="form-input"
                  placeholder="确认密码"
                  required
                >
                <label for="confirmPassword" class="form-label">确认密码</label>
              </div>
            </div>
            
            <!-- 密码强度指示器 -->
            <div v-if="form.password" class="password-strength">
              <div class="strength-bar">
                <div class="strength-fill" :class="passwordStrength.class" :style="{ width: passwordStrength.width }"></div>
              </div>
              <span class="strength-text" :class="passwordStrength.class">{{ passwordStrength.text }}</span>
            </div>
            
            <Transition name="error">
              <div v-if="passwordError" class="error-message">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {{ passwordError }}
              </div>
            </Transition>
            
            <Transition name="error">
              <div v-if="userStore.error" class="error-message">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {{ userStore.error }}
              </div>
            </Transition>
            
            <button 
              type="submit" 
              class="register-btn"
              :disabled="userStore.isLoading || !!passwordError"
            >
              <span v-if="userStore.isLoading" class="loading-spinner"></span>
              <span class="btn-text">{{ userStore.isLoading ? '创建中...' : '创建账户' }}</span>
              <svg v-if="!userStore.isLoading" class="btn-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="12,5 19,12 12,19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </form>
          
          <div class="form-footer">
            <div class="divider">
              <span>或者</span>
            </div>
            
            <p class="login-hint">
              已有账户？ 
              <router-link to="/login" class="login-link">
                立即登录
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="7" y1="17" x2="17" y2="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="7,7 17,7 17,17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </router-link>
            </p>
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
  confirmPassword: '',
  verificationCode: ''
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

const passwordStrength = computed(() => {
  const password = form.value.password
  if (!password) return { class: '', width: '0%', text: '' }
  
  let score = 0
  let feedback = []
  
  // 长度检查
  if (password.length >= 8) score += 25
  else feedback.push('至少8位')
  
  // 包含数字
  if (/\d/.test(password)) score += 25
  else feedback.push('包含数字')
  
  // 包含小写字母
  if (/[a-z]/.test(password)) score += 25
  else feedback.push('包含小写字母')
  
  // 包含大写字母或特殊字符
  if (/[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 25
  else feedback.push('包含大写字母或特殊字符')
  
  if (score <= 25) {
    return { class: 'weak', width: '25%', text: '弱' }
  } else if (score <= 50) {
    return { class: 'fair', width: '50%', text: '一般' }
  } else if (score <= 75) {
    return { class: 'good', width: '75%', text: '良好' }
  } else {
    return { class: 'strong', width: '100%', text: '强' }
  }
})

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const handleSendCode = async () => {
  if (!form.value.email || !isValidEmail(form.value.email)) {
    userStore.error = '请输入有效的邮箱地址'
    return
  }
  
  const result = await userStore.sendVerificationCode(form.value.email)
  if (result.success && result.message) {
    console.log(result.message)
    
    // 开发环境自动填入验证码
    setTimeout(() => {
      if (userStore.devVerificationCode) {
        form.value.verificationCode = userStore.devVerificationCode
      }
    }, 1000)
  }
}

const handleRegister = async () => {
  if (passwordError.value) return
  
  if (!form.value.verificationCode) {
    userStore.error = '请输入验证码'
    return
  }
  
  const success = await userStore.register({
    username: form.value.username,
    email: form.value.email,
    password: form.value.password,
    verificationCode: form.value.verificationCode
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  position: relative;
  overflow: hidden;
}

/* 动态背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  mix-blend-mode: multiply;
  animation: blob 7s infinite;
}

.blob-1 {
  top: 0;
  left: 0;
  width: 300px;
  height: 300px;
  background: linear-gradient(45deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
  animation-delay: 0s;
}

.blob-2 {
  top: 50%;
  right: 0;
  width: 250px;
  height: 250px;
  background: linear-gradient(45deg, #a8edea 0%, #fed6e3 100%);
  animation-delay: 2s;
}

.blob-3 {
  bottom: 0;
  left: 50%;
  width: 200px;
  height: 200px;
  background: linear-gradient(45deg, #d299c2 0%, #fef9d7 100%);
  animation-delay: 4s;
}

@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.register-form-container {
  max-width: 440px;
  margin: 0 auto;
  width: 100%;
}

/* 玻璃态卡片 */
.glass-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  position: relative;
  overflow: hidden;
  animation: cardEnter 0.6s ease-out;
}

.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
}

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 头部区域 */
.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.header-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.header-icon svg {
  width: 32px;
  height: 32px;
  color: white;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  margin-bottom: 0;
}

/* 表单样式 */
.register-form {
  space-y: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: rgba(255, 255, 255, 0.6);
  z-index: 2;
}

.form-input {
  width: 100%;
  padding: 1.5rem 1rem 0.5rem 3rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input::placeholder {
  color: transparent;
  transition: color 0.3s ease;
}

.form-input:focus::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.form-label {
  position: absolute;
  left: 3rem;
  top: 1.5rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  pointer-events: none;
  transition: all 0.3s ease;
  transform-origin: left top;
  background: transparent;
}

.form-input:focus + .form-label,
.form-input:not(:placeholder-shown) + .form-label {
  transform: translateY(-1rem) scale(0.75);
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

/* 密码强度指示器 */
.password-strength {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.strength-fill.weak {
  background: #ff6b6b;
}

.strength-fill.fair {
  background: #feca57;
}

.strength-fill.good {
  background: #48dbfb;
}

.strength-fill.strong {
  background: #0be881;
}

.strength-text {
  font-size: 0.75rem;
  font-weight: 500;
  min-width: 32px;
}

.strength-text.weak {
  color: #ff6b6b;
}

.strength-text.fair {
  color: #feca57;
}

.strength-text.good {
  color: #48dbfb;
}

.strength-text.strong {
  color: #0be881;
}

/* 验证码样式 */
.verification-wrapper {
  position: relative;
}

.verification-input {
  padding-right: 140px !important;
}

.send-code-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: center;
  z-index: 3;
}

.send-code-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a6fd8, #6a4190);
  transform: translateY(-50%) scale(1.02);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.send-code-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: translateY(-50%);
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.8);
}

/* 开发环境验证码显示 */
.dev-code-display {
  margin-top: 1rem;
  background: rgba(0, 255, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 0, 0.3);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
}

.dev-code-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: rgba(0, 255, 0, 0.9);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.dev-code-header svg {
  width: 16px;
  height: 16px;
}

.dev-code-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.2em;
  margin: 0.5rem 0;
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
}

.dev-code-hint {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

/* 验证码显示动画 */
.code-display-enter-active,
.code-display-leave-active {
  transition: all 0.3s ease;
}

.code-display-enter-from,
.code-display-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.code-display-enter-to,
.code-display-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* 错误消息 */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ff6b6b;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.error-message svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* 错误消息动画 */
.error-enter-active,
.error-leave-active {
  transition: all 0.3s ease;
}

.error-enter-from,
.error-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 注册按钮 */
.register-btn {
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
}

.register-btn:active:not(:disabled) {
  transform: translateY(0);
}

.register-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-text {
  flex: 1;
}

.btn-arrow {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.register-btn:hover:not(:disabled) .btn-arrow {
  transform: translateX(4px);
}

/* 加载动画 */
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 页脚 */
.form-footer {
  margin-top: 2rem;
}

.divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
}

.divider span {
  background: rgba(255, 255, 255, 0.1);
  padding: 0 1rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

.login-hint {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.login-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.3s ease;
}

.login-link:hover {
  color: #667eea;
  transform: translateY(-1px);
}

.login-link svg {
  width: 14px;
  height: 14px;
  transition: transform 0.3s ease;
}

.login-link:hover svg {
  transform: translate(2px, -2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-page {
    padding: 1rem;
  }
  
  .glass-card {
    padding: 2rem 1.5rem;
  }
  
  .form-title {
    font-size: 1.75rem;
  }
  
  .blob {
    filter: blur(20px);
  }
  
  .blob-1,
  .blob-2,
  .blob-3 {
    width: 150px;
    height: 150px;
  }
}

@media (max-width: 480px) {
  .register-page {
    padding: 0.5rem;
  }
  
  .glass-card {
    padding: 1.5rem 1rem;
    border-radius: 16px;
  }
  
  .header-icon {
    width: 56px;
    height: 56px;
  }
  
  .header-icon svg {
    width: 28px;
    height: 28px;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
}
</style>