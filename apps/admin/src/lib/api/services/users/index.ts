import { CreateUserReq, UserRes } from "@/types/auth";
import { alovaClient } from "@/lib/api/client";
import { ApiResponse, PaginatedResponse } from "@/lib/api/types";
import { UpdateUserReq, GetUsersReq } from "./type";

export const userApi = {
  /**
   * 获取用户列表（支持分页和查询）
   */
  getUsers: (params?: GetUsersReq) =>
    alovaClient.Get<PaginatedResponse<UserRes>>("/users", { params }),

  /**
   * 获取所有用户（不分页）
   */
  getAllUsers: () => 
    alovaClient.Get<ApiResponse<UserRes[]>>("/users"),

  /**
   * 根据 ID 获取用户详情
   */
  getUser: (id: string) =>
    alovaClient.Get<ApiResponse<UserRes>>(`/users/${id}`),

  /**
   * 创建新用户
   */
  createUser: (userData: CreateUserReq) =>
    alovaClient.Post<ApiResponse<UserRes>>("/users", userData),

  /**
   * 更新用户信息
   */
  updateUser: (id: string, userData: UpdateUserReq) =>
    alovaClient.Put<ApiResponse<UserRes>>(`/users/${id}`, userData),

  /**
   * 删除用户
   */
  deleteUser: (id: string) =>
    alovaClient.Delete<ApiResponse<null>>(`/users/${id}`),

  /**
   * 启用/禁用用户
   */
  toggleUserStatus: (id: string, isActive: boolean) =>
    alovaClient.Put<ApiResponse<UserRes>>(`/users/${id}/status`, { isActive }),

  /**
   * 重置用户密码
   */
  resetPassword: (id: string, newPassword: string) =>
    alovaClient.Put<ApiResponse<null>>(`/users/${id}/password`, {
      password: newPassword,
    }),

  /**
   * 更新用户角色
   */
  updateUserRoles: (id: string, roleIds: string[]) =>
    alovaClient.Put<ApiResponse<UserRes>>(`/users/${id}/roles`, { roleIds }),

  /**
   * 获取用户的有效权限
   */
  getUserPermissions: (id: string) =>
    alovaClient.Get<ApiResponse<string[]>>(`/users/${id}/permissions`),
};
