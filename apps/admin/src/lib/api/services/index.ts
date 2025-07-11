/**
 * API 服务统一导出
 * 提供所有 API 服务的统一入口
 */

// 导出客户端实例
export { alovaClient, alovaInstance } from '../client';

// 导出拦截器和错误类
export { ApiError } from '../interceptors';

// 导出通用类型
export type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  QueryParams,
  ApiErrorResponse,
} from '../types';

// 导出认证服务
export { authApi } from './auth';
export type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenResponse,
} from './auth';

// 导出用户服务
export { userApi } from './users';
export type {
  UpdateUserRequest,
  UserQueryParams,
} from './users';

// 导出角色服务
export { roleApi } from './roles';
export type {
  UpdateRoleRequest,
  RoleQueryParams,
} from './roles';

// 导出权限服务
export { permissionApi } from './permissions';
export type {
  UpdatePermissionRequest,
  PermissionQueryParams,
} from './permissions';

// 重新导出原有类型定义
export type {
  User,
  Role,
  Permission,
  CreateUserDto,
  CreateRoleDto,
  CreatePermissionDto,
  PermissionCheckRequest,
  PermissionCheckResponse,
  Action,
  Subject,
} from '../../../types/auth';
