import { createAlova } from 'alova';
import adapterFetch from 'alova/fetch';
import ReactHook from 'alova/react';

// 创建 Alova 实例
export const alovaInstance = createAlova({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6011/api/admin',
  statesHook: ReactHook,
  requestAdapter: adapterFetch(),
  beforeRequest(method) {
    // 添加认证头
    const token = localStorage.getItem('token');
    if (token) {
      method.config.headers.Authorization = `Bearer ${token}`;
    }
  },
  responded: {
    onSuccess: async (response) => {
      if (response.status >= 400) {
        throw new Error(`请求失败: ${response.status}`);
      }
      return response.json();
    },
    onError: (error) => {
      console.error('API 请求错误:', error);
      throw error;
    },
  },
});

// 用户相关 API
export const userApi = {
  // 获取所有用户
  getUsers: () => alovaInstance.Get('/users'),
  
  // 根据 ID 获取用户
  getUser: (id: string) => alovaInstance.Get(`/users/${id}`),
  
  // 创建用户
  createUser: (userData: any) => alovaInstance.Post('/users', userData),
  
  // 更新用户
  updateUser: (id: string, userData: any) => alovaInstance.Patch(`/users/${id}`, userData),
  
  // 删除用户
  deleteUser: (id: string) => alovaInstance.Delete(`/users/${id}`),

  // 更新用户角色
  updateRoles: (id: string, roleIds: string[]) => alovaInstance.Patch(`/users/${id}/roles`, { roleIds }),
};

// 权限相关 API
export const permissionApi = {
  // 获取所有权限
  getPermissions: () => alovaInstance.Get('/permissions'),
  
  // 根据 ID 获取权限
  getPermission: (id: string) => alovaInstance.Get(`/permissions/${id}`),
  
  // 创建权限
  createPermission: (permissionData: any) => alovaInstance.Post('/permissions', permissionData),
  
  // 更新权限
  updatePermission: (id: string, permissionData: any) => alovaInstance.Patch(`/permissions/${id}`, permissionData),
  
  // 删除权限
  deletePermission: (id: string) => alovaInstance.Delete(`/permissions/${id}`),
  
  // 检查权限
  checkPermission: (checkData: any) => alovaInstance.Post('/permissions/check', checkData),
};

// 认证相关 API
export const authApi = {
  // 登录
  login: (loginData: { usernameOrEmail: string; password: string }) =>
    alovaInstance.Post('/auth/login', loginData),

  // 注册
  register: (registerData: any) => alovaInstance.Post('/auth/register', registerData),

  // 刷新令牌
  refreshToken: (refreshToken: string) =>
    alovaInstance.Post('/auth/refresh', { refreshToken }),

  // 登出
  logout: () => alovaInstance.Post('/auth/logout'),

  // 获取当前用户信息
  getProfile: () => alovaInstance.Get('/auth/profile'),

  // 检查令牌有效性
  checkToken: () => alovaInstance.Get('/auth/check'),
};

// 角色相关 API
export const roleApi = {
  // 获取所有角色
  getRoles: () => alovaInstance.Get('/roles'),
  getAll: () => alovaInstance.Get('/roles'),

  // 根据 ID 获取角色
  getRole: (id: string) => alovaInstance.Get(`/roles/${id}`),

  // 创建角色
  createRole: (roleData: any) => alovaInstance.Post('/roles', roleData),

  // 更新角色
  updateRole: (id: string, roleData: any) => alovaInstance.Patch(`/roles/${id}`, roleData),

  // 删除角色
  deleteRole: (id: string) => alovaInstance.Delete(`/roles/${id}`),
};
