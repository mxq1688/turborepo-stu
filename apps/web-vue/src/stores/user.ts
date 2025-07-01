import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/auth'

// 本地类型定义
interface User {
  id: string
  username: string
  email: string
  createdAt: string
  updatedAt: string
}

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  username: string
  email: string
  password: string
  verificationCode: string
}

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isSendingCode = ref(false)
  const codeCountdown = ref(0)
  const devVerificationCode = ref<string | null>(null)

  // Getters
  const isLoggedIn = computed(() => !!token.value && !!user.value)

  // Actions
  const login = async (credentials: LoginRequest) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await authService.login(credentials)
      
      if (response.success && response.data) {
        token.value = response.data.token
        user.value = response.data.user
        localStorage.setItem('token', response.data.token)
        return true
      } else {
        error.value = response.error || '登录失败'
        return false
      }
    } catch (err) {
      error.value = '网络错误，请稍后重试'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: RegisterRequest) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await authService.register(userData)
      
      if (response.success && response.data) {
        // 注册成功后自动登录
        token.value = response.data.token
        user.value = response.data.user
        localStorage.setItem('token', response.data.token)
        return true
      } else {
        error.value = response.error || '注册失败'
        return false
      }
    } catch (err) {
      error.value = '网络错误，请稍后重试'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    error.value = null
  }

  const sendVerificationCode = async (email: string) => {
    try {
      isSendingCode.value = true
      error.value = null
      devVerificationCode.value = null
      
      const response = await authService.sendVerificationCode(email)
      
      if (response.success) {
        // 开始倒计时
        codeCountdown.value = 60
        const timer = setInterval(() => {
          codeCountdown.value--
          if (codeCountdown.value <= 0) {
            clearInterval(timer)
          }
        }, 1000)
        
        // 获取验证码用于开发环境显示
        try {
          const codeResponse = await authService.getVerificationCode(email)
          if (codeResponse.success && codeResponse.data) {
            devVerificationCode.value = codeResponse.data.code
          }
        } catch (err) {
          console.log('获取开发验证码失败:', err)
        }
        
        return { success: true, message: response.message }
      } else {
        error.value = response.error || '发送验证码失败'
        return { success: false, error: response.error }
      }
    } catch (err) {
      error.value = '网络错误，请稍后重试'
      return { success: false, error: '网络错误，请稍后重试' }
    } finally {
      isSendingCode.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const initializeAuth = async () => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      token.value = storedToken
      // 这里可以验证token并获取用户信息
      // 为了简化，先使用假数据
      user.value = {
        id: '1',
        username: 'user',
        email: 'user@example.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,
    isSendingCode,
    codeCountdown,
    devVerificationCode,
    // Getters
    isLoggedIn,
    // Actions
    login,
    register,
    sendVerificationCode,
    logout,
    clearError,
    initializeAuth
  }
})