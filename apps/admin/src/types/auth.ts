/**
 * RBAC2权限类型常量
 */
export const PermissionType = {
  MODULE: 'module',
  MENU: 'menu',
  BUTTON: 'button',
} as const;

export type PermissionTypeValues = typeof PermissionType[keyof typeof PermissionType];

/**
 * 用户响应接口
 */
export interface UserRes {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: RoleRes[];
  allPermissions?: string[]; // 用户拥有的所有权限编码
}

/**
 * 角色响应接口
 */
export interface RoleRes {
  id: number;
  name: string;
  description?: string;
  level: number;
  isActive: boolean;
  parent?: RoleRes;
  children: RoleRes[];
  inheritedRoleIds?: number[];
  permissions: PermissionRes[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 权限响应接口
 */
export interface PermissionRes {
  id: number;
  code: string;
  name: string;
  type: PermissionTypeValues;
  description?: string;
  path?: string;
  icon?: string;
  sort: number;
  isActive: boolean;
  parent?: PermissionRes;
  children: PermissionRes[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 用户会话响应接口
 */
export interface SessionRes {
  id: number;
  sessionToken: string;
  startTime: string;
  endTime?: string;
  lastActivityTime: string;
  isActive: boolean;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  user: UserRes;
  activeRoles: RoleRes[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建用户请求
 */
export interface CreateUserReq {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roleIds?: number[];
}

/**
 * 更新用户请求
 */
export interface UpdateUserReq {
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roleIds?: number[];
}

/**
 * 创建角色请求 - 对应服务端 CreateRoleDto
 */
export interface CreateRoleReq {
  name: string;
  description?: string;
  level?: number;
  isActive?: boolean;
  parentId?: number;
  permissionIds?: number[];
  attributes?: Record<string, any>;
}

/**
 * 更新角色请求 - 对应服务端 CreateRoleDto (用于更新)
 */
export interface UpdateRoleReq {
  name?: string;
  description?: string;
  level?: number;
  isActive?: boolean;
  parentId?: number;
  permissionIds?: number[];
  attributes?: Record<string, any>;
}

/**
 * 创建权限请求 - 对应服务端 CreatePermissionDto
 */
export interface CreatePermissionReq {
  code: string;
  name: string;
  type: PermissionTypeValues;
  description?: string;
  path?: string;
  icon?: string;
  sort?: number;
  parentId?: number;
}

/**
 * 更新权限请求 - 对应服务端 CreatePermissionDto (用于更新)
 */
export interface UpdatePermissionReq {
  code?: string;
  name?: string;
  type?: PermissionTypeValues;
  description?: string;
  path?: string;
  icon?: string;
  sort?: number;
  parentId?: number;
}

/**
 * 权限检查请求
 */
export interface PermissionCheckReq {
  permissionCode: string;
  userId?: number;
  sessionId?: number;
}

/**
 * 登录响应
 */
export interface LoginRes {
  user: UserRes;
  accessToken: string;
  refreshToken: string;
  session: SessionRes;
}

/**
 * 权限菜单项
 */
export interface MenuPermission {
  code: string;
  name: string;
  path?: string;
  icon?: string;
  sort: number;
  children?: MenuPermission[];
}