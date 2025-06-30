// 临时定义类型，避免导入问题
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
}

interface AuthResponse {
  success: boolean
  data?: {
    token: string
    user: User
  }
  error?: string
}

const API_BASE_URL = 'http://localhost:3002'

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          data: {
            token: data.token,
            user: data.user,
          },
        }
      } else {
        return {
          success: false,
          error: data.error || '登录失败',
        }
      }
    } catch (error) {
      return {
        success: false,
        error: '网络错误，请稍后重试',
      }
    }
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          data: {
            token: data.token,
            user: data.user,
          },
        }
      } else {
        return {
          success: false,
          error: data.error || '注册失败',
        }
      }
    } catch (error) {
      return {
        success: false,
        error: '网络错误，请稍后重试',
      }
    }
  },

  async logout(): Promise<void> {
    // 可以在这里调用后端的登出接口
    // 目前只是清理本地存储
    localStorage.removeItem('token')
  },
}