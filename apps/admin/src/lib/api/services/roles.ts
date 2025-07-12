import { alovaClient } from '../client';
import { QueryParams, PaginatedResponse, ApiResponse } from '../types';
import { RoleRes, CreateRoleReq, UpdateRoleReq } from '../../../types/auth';

/**
 * 角色管理 API 服务
 * 处理角色的 CRUD 操作和权限分配
 */



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
    alovaClient.Get<PaginatedResponse<RoleRes>>('/roles', { params }),

  /**
   * 获取所有角色（不分页）
   */
  getAll: () =>
    alovaClient.Get<ApiResponse<RoleRes[]>>('/roles'),

  /**
   * 根据 ID 获取角色详情
   */
  getRole: (id: string) =>
    alovaClient.Get<ApiResponse<RoleRes>>(`/roles/${id}`),

  /**
   * 创建新角色
   */
  createRole: (roleData: CreateRoleReq) =>
    alovaClient.Post<ApiResponse<RoleRes>>('/roles', roleData),

  /**
   * 更新角色信息
   */
  updateRole: (id: string, roleData: UpdateRoleReq) =>
    alovaClient.Patch<ApiResponse<RoleRes>>(`/roles/${id}`, roleData),

  /**
   * 删除角色
   */
  deleteRole: (id: string) =>
    alovaClient.Delete<ApiResponse<null>>(`/roles/${id}`),

  /**
   * 为角色分配权限
   */
  assignPermissions: (id: string, permissionIds: string[]) =>
    alovaClient.Patch<ApiResponse<RoleRes>>(`/roles/${id}/permissions`, { permissionIds }),
};
