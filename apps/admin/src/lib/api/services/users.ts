import { alovaClient } from '../client';
import { QueryParams, PaginatedResponse, ApiResponse } from '../types';
import { UserRes, CreateUserReq, UpdateUserReq } from '../../../types/auth';

/**
 * 用户管理 API 服务
 * 处理用户的 CRUD 操作和角色分配
 */



/**
 * 用户查询参数
 */
export interface UserQueryParams extends QueryParams {
  isActive?: boolean;
  department?: string;
  roleId?: string;
}

/**
 * 用户 API 服务
 */
export const userApi = {
  /**
   * 获取用户列表（支持分页和查询）
   */
  getUsers: (params?: UserQueryParams) =>
    alovaClient.Get<PaginatedResponse<UserRes>>('/users', { params }),

  /**
   * 获取所有用户（不分页）
   */
  getAllUsers: () =>
    alovaClient.Get<ApiResponse<UserRes[]>>('/users'),

  /**
   * 根据 ID 获取用户详情
   */
  getUser: (id: string) =>
    alovaClient.Get<ApiResponse<UserRes>>(`/users/${id}`),

  /**
   * 创建新用户
   */
  createUser: (userData: CreateUserReq) =>
    alovaClient.Post<ApiResponse<UserRes>>('/users', userData),

  /**
   * 更新用户信息
   */
  updateUser: (id: string, userData: UpdateUserReq) =>
    alovaClient.Patch<ApiResponse<UserRes>>(`/users/${id}`, userData),

  /**
   * 删除用户
   */
  deleteUser: (id: string) =>
    alovaClient.Delete<ApiResponse<null>>(`/users/${id}`),

  /**
   * 更新用户角色
   */
  updateRoles: (id: string, roleIds: string[]) =>
    alovaClient.Patch<ApiResponse<UserRes>>(`/users/${id}/roles`, { roleIds }),

  /**
   * 启用/禁用用户
   */
  toggleUserStatus: (id: string, isActive: boolean) =>
    alovaClient.Patch<ApiResponse<UserRes>>(`/users/${id}/status`, { isActive }),

  /**
   * 重置用户密码
   */
  resetPassword: (id: string, newPassword: string) =>
    alovaClient.Patch<ApiResponse<null>>(`/users/${id}/password`, { password: newPassword }),
};
