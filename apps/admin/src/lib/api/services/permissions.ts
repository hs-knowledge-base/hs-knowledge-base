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
    alovaClient.Get<PaginatedResponse<PermissionRes>>("/permissions", { params }),

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
    alovaClient.Get<ApiResponse<PermissionRes>>(`/permissions/${id}`),

  /**
   * 创建新权限
   */
  createPermission: (permissionData: CreatePermissionReq) =>
    alovaClient.Post<ApiResponse<PermissionRes>>("/permissions", permissionData),

  /**
   * 更新权限信息
   */
  updatePermission: (id: number, permissionData: UpdatePermissionReq) =>
    alovaClient.Put<ApiResponse<PermissionRes>>(`/permissions/${id}`, permissionData),

  /**
   * 删除权限
   */
  deletePermission: (id: number) =>
    alovaClient.Delete<ApiResponse<null>>(`/permissions/${id}`),

  /**
   * 启用/禁用权限
   */
  togglePermissionStatus: (id: number, isActive: boolean) =>
    alovaClient.Put<ApiResponse<PermissionRes>>(`/permissions/${id}/status`, { isActive }),

  /**
   * 根据类型获取权限
   */
  getPermissionsByType: (type: string) =>
    alovaClient.Get<ApiResponse<PermissionRes[]>>(`/permissions/type/${type}`),
}; 