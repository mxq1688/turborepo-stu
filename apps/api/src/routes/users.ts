import express from 'express';
import type { User, CreateUserRequest, UpdateUserRequest, ApiResponse } from '@repo/shared-types';

const router = express.Router();

// 模拟用户数据
let users: User[] = [
  {
    id: '1',
    email: 'john@example.com',
    name: 'John Doe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'jane@example.com',
    name: 'Jane Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// 获取所有用户
router.get('/', (req: express.Request, res: express.Response<ApiResponse<User[]>>) => {
  res.json({
    success: true,
    data: users,
    message: 'Users retrieved successfully'
  });
});

// 根据ID获取用户
router.get('/:id', (req: express.Request, res: express.Response<ApiResponse<User>>) => {
  const { id } = req.params;
  const user = users.find(u => u.id === id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
  
  res.json({
    success: true,
    data: user
  });
});

// 创建新用户
router.post('/', (req: express.Request<{}, ApiResponse<User>, CreateUserRequest>, res: express.Response<ApiResponse<User>>) => {
  const { email, name, avatar } = req.body;
  
  if (!email || !name) {
    return res.status(400).json({
      success: false,
      error: 'Email and name are required'
    });
  }
  
  // 检查邮箱是否已存在
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: 'User with this email already exists'
    });
  }
  
  const newUser: User = {
    id: Date.now().toString(),
    email,
    name,
    avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  
  res.status(201).json({
    success: true,
    data: newUser,
    message: 'User created successfully'
  });
});

// 更新用户
router.put('/:id', (req: express.Request<{ id: string }, ApiResponse<User>, UpdateUserRequest>, res: express.Response<ApiResponse<User>>) => {
  const { id } = req.params;
  const { name, avatar } = req.body;
  
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
  
  users[userIndex] = {
    ...users[userIndex],
    ...(name && { name }),
    ...(avatar && { avatar }),
    updatedAt: new Date().toISOString(),
  };
  
  res.json({
    success: true,
    data: users[userIndex],
    message: 'User updated successfully'
  });
});

// 删除用户
router.delete('/:id', (req: express.Request, res: express.Response<ApiResponse>) => {
  const { id } = req.params;
  
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
  
  users.splice(userIndex, 1);
  
  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

export { router as userRoutes }; 