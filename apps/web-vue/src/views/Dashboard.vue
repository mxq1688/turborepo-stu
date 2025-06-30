<template>
  <div class="dashboard-page">
    <div class="container">
      <div class="dashboard-header">
        <h1>仪表板</h1>
        <p>欢迎回来，{{ user?.username }}！</p>
      </div>
      
      <div class="dashboard-content">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <h3>统计数据</h3>
              <p>查看您的使用统计</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">👤</div>
            <div class="stat-info">
              <h3>个人资料</h3>
              <p>管理您的个人信息</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⚙️</div>
            <div class="stat-info">
              <h3>设置</h3>
              <p>配置您的偏好设置</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📱</div>
            <div class="stat-info">
              <h3>应用</h3>
              <p>管理您的应用程序</p>
            </div>
          </div>
        </div>
        
        <div class="user-info-section">
          <div class="card">
            <h2>用户信息</h2>
            <div class="user-details">
              <div class="detail-row">
                <span class="detail-label">用户ID:</span>
                <span class="detail-value">{{ user?.id }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">用户名:</span>
                <span class="detail-value">{{ user?.username }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">邮箱:</span>
                <span class="detail-value">{{ user?.email }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">注册时间:</span>
                <span class="detail-value">{{ formatDate(user?.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="actions-section">
          <div class="card">
            <h2>快速操作</h2>
            <div class="action-buttons">
              <button class="btn btn-primary">编辑资料</button>
              <button class="btn btn-secondary">更改密码</button>
              <button @click="handleLogout" class="btn btn-secondary">退出登录</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const user = computed(() => userStore.user)

const formatDate = (dateString?: string) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}
</script>

<style scoped>
.dashboard-page {
  min-height: calc(100vh - 80px);
  padding: 2rem 0;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  font-size: 1.2rem;
  color: #666;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.stat-info h3 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.25rem;
}

.stat-info p {
  color: #666;
  font-size: 0.9rem;
}

.user-info-section,
.actions-section {
  margin-bottom: 2rem;
}

.user-details {
  margin-top: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #333;
}

.detail-value {
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .dashboard-header h1 {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
  }
  
  .stat-icon {
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>