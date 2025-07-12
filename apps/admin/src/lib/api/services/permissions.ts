import { alovaClient } from '../client';
import { QueryParams, PaginatedResponse, ApiResponse } from '../types';
import { PermissionRes, CreatePermissionReq, UpdatePermissionReq, PermissionCheckReq, PermissionCheckRes } from '../../../types/auth';

/**
 * 权限管理 API 服务
 * 处理权限的 CRUD 操作和权限检查
 */



/**
 * 权限查询参数
 */
export interface PermissionQueryParams extends QueryParams {
  action?: string;
  subject?: string;
}

/**
 * 权限 API 服务
 */
export const permissionApi = {
  /**
   * 获取权限列表（支持分页和查询）
   */
  getPermissions: (params?: PermissionQueryParams) =>
    alovaClient.Get<PaginatedResponse<PermissionRes>>('/permissions', { params }),

  /**
   * 获取所有权限（不分页）
   */
  getAllPermissions: () =>
    alovaClient.Get<ApiResponse<PermissionRes[]>>('/permissions'),

  /**
   * 根据 ID 获取权限详情
   */
  getPermission: (id: string) =>
    alovaClient.Get<ApiResponse<PermissionRes>>(`/permissions/${id}`),

  /**
   * 创建新权限
   */
  createPermission: (permissionData: CreatePermissionReq) =>
    alovaClient.Post<ApiResponse<PermissionRes>>('/permissions', permissionData),

  /**
   * 更新权限信息
   */
  updatePermission: (id: string, permissionData: UpdatePermissionReq) =>
    alovaClient.Patch<ApiResponse<PermissionRes>>(`/permissions/${id}`, permissionData),

  /**
   * 删除权限
   */
  deletePermission: (id: string) =>
    alovaClient.Delete<ApiResponse<null>>(`/permissions/${id}`),

  /**
   * 检查权限
   */
  checkPermission: (checkData: PermissionCheckReq) =>
    alovaClient.Post<ApiResponse<PermissionCheckRes>>('/permissions/check', checkData),



  /**
   * 获取用户的所有权限
   */
  getUserPermissions: (userId: string) =>
    alovaClient.Get<ApiResponse<PermissionRes[]>>(`/permissions/user/${userId}`),


};
