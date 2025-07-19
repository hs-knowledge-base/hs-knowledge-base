import { PermissionRes, CreatePermissionReq, UpdatePermissionReq } from "@/types/auth";
import { alovaClient } from "@/lib/api/client";
import { ApiResponse, PaginatedResponse } from "@/lib/api/types";

export interface GetPermissionsReq {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  parentId?: number;
}

export const permissionApi = {
  /**
   * 获取权限列表（支持分页和查询）
   */
  getPermissions: (params?: GetPermissionsReq) =>
    alovaClient.Get<PaginatedResponse<PermissionRes> | ApiResponse<PermissionRes[]>>("/permissions", { params }),

  /**
   * 获取所有权限（不分页）
   */
  getAllPermissions: () => 
    alovaClient.Get<ApiResponse<PermissionRes[]>>("/permissions"),

  /**
   * 获取权限树结构
   */
  getPermissionTree: () =>
    alovaClient.Get<ApiResponse<PermissionRes[]>>("/permissions/tree"),

  /**
   * 根据 ID 获取权限详情
   */
  getPermission: (id: number) =>
    alovaClient.Get<ApiResponse<PermissionRes>>(`/permissions/detail?id=${id}`),

  /**
   * 创建新权限
   */
  createPermission: (permissionData: CreatePermissionReq) =>
    alovaClient.Post<ApiResponse<PermissionRes>>("/permissions", permissionData),

  /**
   * 更新权限信息
   */
  updatePermission: (id: number, permissionData: UpdatePermissionReq) =>
    alovaClient.Post<ApiResponse<PermissionRes>>("/permissions/update", { id, ...permissionData }),

  /**
   * 删除权限
   */
  deletePermission: (id: number) =>
    alovaClient.Post<ApiResponse<null>>("/permissions/delete", { id }),

  /**
   * 启用/禁用权限
   */
  togglePermissionStatus: (id: number, isActive: boolean) =>
    alovaClient.Post<ApiResponse<PermissionRes>>("/permissions/toggle-status", { id, isActive }),

  /**
   * 根据类型获取权限
   */
  getPermissionsByType: (type: string) =>
    alovaClient.Get<ApiResponse<PermissionRes[]>>(`/permissions/by-type?type=${type}`),
}; 