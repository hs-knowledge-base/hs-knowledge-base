import { alovaClient } from '../client';
import { QueryParams, PaginatedResponse } from '../types';
import { Role, CreateRoleDto } from '../../../types/auth';

/**
 * 角色管理 API 服务
 * 处理角色的 CRUD 操作和权限分配
 */

/**
 * 更新角色请求参数
 */
export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

/**
 * 角色查询参数
 */
export interface RoleQueryParams extends QueryParams {
  hasPermission?: string;
}

/**
 * 角色 API 服务
 */
export const roleApi = {
  /**
   * 获取角色列表（支持分页和查询）
   */
  getRoles: (params?: RoleQueryParams) =>
    alovaClient.Get<PaginatedResponse<Role>>('/roles', { params }),

  /**
   * 获取所有角色（不分页）
   */
  getAll: () =>
    alovaClient.Get<Role[]>('/roles/all'),

  /**
   * 根据 ID 获取角色详情
   */
  getRole: (id: string) =>
    alovaClient.Get<Role>(`/roles/${id}`),

  /**
   * 创建新角色
   */
  createRole: (roleData: CreateRoleDto) =>
    alovaClient.Post<Role>('/roles', roleData),

  /**
   * 更新角色信息
   */
  updateRole: (id: string, roleData: UpdateRoleRequest) =>
    alovaClient.Patch<Role>(`/roles/${id}`, roleData),

  /**
   * 删除角色
   */
  deleteRole: (id: string) =>
    alovaClient.Delete(`/roles/${id}`),

  /**
   * 为角色分配权限
   */
  assignPermissions: (id: string, permissionIds: string[]) =>
    alovaClient.Patch<Role>(`/roles/${id}/permissions`, { permissionIds }),



  /**
   * 获取角色的用户列表
   */
  getRoleUsers: (id: string) =>
    alovaClient.Get(`/roles/${id}/users`),
};
