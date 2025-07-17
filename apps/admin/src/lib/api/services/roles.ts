import { RoleRes, CreateRoleReq, UpdateRoleReq } from "@/types/auth";
import { alovaClient } from "@/lib/api/client";
import { ApiResponse, PaginatedResponse } from "@/lib/api/types";

export interface GetRolesReq {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  level?: number;
}

export const roleApi = {
  /**
   * 获取角色列表（支持分页和查询）
   */
  getRoles: (params?: GetRolesReq) =>
    alovaClient.Get<PaginatedResponse<RoleRes>>("/roles", { params }),

  /**
   * 获取所有角色（不分页）
   */
  getAllRoles: () => 
    alovaClient.Get<ApiResponse<RoleRes[]>>("/roles"),

  /**
   * 根据 ID 获取角色详情
   */
  getRole: (id: string) =>
    alovaClient.Get<ApiResponse<RoleRes>>(`/roles/${id}`),

  /**
   * 创建新角色
   */
  createRole: (roleData: CreateRoleReq) =>
    alovaClient.Post<ApiResponse<RoleRes>>("/roles", roleData),

  /**
   * 更新角色信息
   */
  updateRole: (id: string, roleData: UpdateRoleReq) =>
    alovaClient.Put<ApiResponse<RoleRes>>(`/roles/${id}`, roleData),

  /**
   * 删除角色
   */
  deleteRole: (id: string) =>
    alovaClient.Delete<ApiResponse<null>>(`/roles/${id}`),

  /**
   * 启用/禁用角色
   */
  toggleRoleStatus: (id: string, isActive: boolean) =>
    alovaClient.Put<ApiResponse<RoleRes>>(`/roles/${id}/status`, { isActive }),

  /**
   * 获取角色层次结构树
   */
  getRoleHierarchy: () =>
    alovaClient.Get<ApiResponse<RoleRes[]>>("/roles/hierarchy"),

  /**
   * 建立角色继承关系
   */
  addRoleInheritance: (juniorRoleId: string, seniorRoleId: string) =>
    alovaClient.Post<ApiResponse<null>>("/roles/inheritance", {
      juniorRoleId,
      seniorRoleId,
    }),

  /**
   * 移除角色继承关系
   */
  removeRoleInheritance: (juniorRoleId: string) =>
    alovaClient.Delete<ApiResponse<null>>(`/roles/${juniorRoleId}/inheritance`),

  /**
   * 获取角色的有效权限
   */
  getRolePermissions: (id: string) =>
    alovaClient.Get<ApiResponse<string[]>>(`/roles/${id}/permissions`),
}; 