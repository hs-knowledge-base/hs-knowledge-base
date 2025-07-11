import { alovaClient } from '../client';
import { QueryParams, PaginatedResponse } from '../types';
import { Permission, CreatePermissionDto, PermissionCheckRequest, PermissionCheckResponse } from '../../../types/auth';

/**
 * 权限管理 API 服务
 * 处理权限的 CRUD 操作和权限检查
 */

/**
 * 更新权限请求参数
 */
export interface UpdatePermissionRequest {
  action?: string;
  subject?: string;
  conditions?: Record<string, any>;
  fields?: string;
  inverted?: boolean;
  reason?: string;
}

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
    alovaClient.Get<PaginatedResponse<Permission>>('/permissions', { params }),

  /**
   * 获取所有权限（不分页）
   */
  getAllPermissions: () =>
    alovaClient.Get<Permission[]>('/permissions'),

  /**
   * 根据 ID 获取权限详情
   */
  getPermission: (id: string) =>
    alovaClient.Get<Permission>(`/permissions/${id}`),

  /**
   * 创建新权限
   */
  createPermission: (permissionData: CreatePermissionDto) =>
    alovaClient.Post<Permission>('/permissions', permissionData),

  /**
   * 更新权限信息
   */
  updatePermission: (id: string, permissionData: UpdatePermissionRequest) =>
    alovaClient.Patch<Permission>(`/permissions/${id}`, permissionData),

  /**
   * 删除权限
   */
  deletePermission: (id: string) =>
    alovaClient.Delete(`/permissions/${id}`),

  /**
   * 检查权限
   */
  checkPermission: (checkData: PermissionCheckRequest) =>
    alovaClient.Post<PermissionCheckResponse>('/permissions/check', checkData),



  /**
   * 获取用户的所有权限
   */
  getUserPermissions: (userId: string) =>
    alovaClient.Get<Permission[]>(`/permissions/user/${userId}`),


};
