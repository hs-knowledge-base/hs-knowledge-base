import { CreateUserReq, UserRes } from "@/types/auth";
import { alovaClient } from "@/lib/api/client";
import { ApiResponse, PaginatedResponse } from "@/lib/api/types";
import { UpdateUserReq, GetUsersReq } from "./type";

export const userApi = {
  /**
   * 获取用户列表（支持分页和查询）
   */
  getUsers: (params?: GetUsersReq) =>
    alovaClient.Get<PaginatedResponse<UserRes> | ApiResponse<UserRes[]>>("/users", { params }),

  /**
   * 获取所有用户（不分页）
   */
  getAllUsers: () => 
    alovaClient.Get<ApiResponse<UserRes[]>>("/users"),

  /**
   * 根据 ID 获取用户详情
   */
  getUser: (id: number) =>
    alovaClient.Get<ApiResponse<UserRes>>(`/users/detail?id=${id}`),

  /**
   * 创建新用户
   */
  createUser: (userData: CreateUserReq) =>
    alovaClient.Post<ApiResponse<UserRes>>("/users", userData),

  /**
   * 更新用户信息
   */
  updateUser: (id: number, userData: UpdateUserReq) =>
    alovaClient.Post<ApiResponse<UserRes>>("/users/update", { id, ...userData }),

  /**
   * 删除用户
   */
  deleteUser: (id: number) =>
    alovaClient.Post<ApiResponse<null>>("/users/delete", { id }),

  /**
   * 启用/禁用用户
   */
  toggleUserStatus: (id: number, isActive: boolean) =>
    alovaClient.Post<ApiResponse<UserRes>>("/users/toggle-status", { id, isActive }),

  /**
   * 重置用户密码
   */
  resetPassword: (id: number, newPassword: string) =>
    alovaClient.Post<ApiResponse<null>>("/users/reset-password", {
      id,
      password: newPassword,
    }),

  /**
   * 更新用户角色
   */
  updateUserRoles: (id: number, roleIds: number[]) =>
    alovaClient.Post<ApiResponse<UserRes>>("/users/update-roles", { id, roleIds }),

  /**
   * 获取用户的有效权限
   */
  getUserPermissions: (id: number) =>
    alovaClient.Get<ApiResponse<string[]>>(`/users/permissions?id=${id}`),
};
