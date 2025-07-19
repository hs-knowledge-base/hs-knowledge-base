/**
 * API服务统一导出
 */

export { authApi } from './services/auth';
export { userApi } from './services/users';
export { roleApi } from './services/roles';
export { permissionApi } from './services/permissions';

// 类型导出
export type { GetUsersReq, UpdateUserReq, CreateUserReq, LoginReq, LoginRes } from './services/users/type';
export type { GetRolesReq } from './services/roles';
export type { GetPermissionsReq } from './services/permissions';
export type { RefreshTokenRes } from './services/auth/type';

// 通用类型导出
export type { ApiResponse, PaginatedResponse } from './types'; 