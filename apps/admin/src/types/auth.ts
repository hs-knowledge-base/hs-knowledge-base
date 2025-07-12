/**
 * 权限操作枚举
 */
export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

/**
 * 资源主体枚举
 */
export enum Subject {
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  DOCUMENT = 'document',
  KNOWLEDGE_BASE = 'knowledge_base',
  ALL = 'all',
}

/**
 * 用户响应接口
 */
export interface UserRes {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  firstName?: string;
  lastName?: string;
  department?: string;
  position?: string;
  attributes?: Record<string, any>;
  roles?: RoleRes[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 角色响应接口
 */
export interface RoleRes {
  id: string;
  name: string;
  description?: string;
  attributes?: Record<string, any>;
  users?: UserRes[];
  permissions?: PermissionRes[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 权限响应接口
 */
export interface PermissionRes {
  id: string;
  action: Action;
  subject: Subject;
  conditions?: Record<string, any>;
  fields?: string;
  inverted: boolean;
  reason?: string;
  roles?: RoleRes[];
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
  isActive?: boolean;
  firstName?: string;
  lastName?: string;
  roleIds?: string[];
  attributes?: Record<string, any>;
}

/**
 * 更新用户请求
 */
export interface UpdateUserReq {
  username?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
  firstName?: string;
  lastName?: string;
  roleIds?: string[];
  attributes?: Record<string, any>;
}

/**
 * 创建角色请求
 */
export interface CreateRoleReq {
  name: string;
  description?: string;
  permissionIds?: string[];
  attributes?: Record<string, any>;
}

/**
 * 更新角色请求
 */
export interface UpdateRoleReq {
  name?: string;
  description?: string;
  permissionIds?: string[];
  attributes?: Record<string, any>;
}

/**
 * 创建权限请求
 */
export interface CreatePermissionReq {
  action: Action;
  subject: Subject;
  conditions?: Record<string, any>;
  fields?: string;
  inverted?: boolean;
  reason?: string;
}

/**
 * 更新权限请求
 */
export interface UpdatePermissionReq {
  action?: string;
  subject?: string;
  conditions?: Record<string, any>;
  fields?: string;
  inverted?: boolean;
  reason?: string;
}



/**
 * 权限检查请求
 */
export interface PermissionCheckReq {
  userId: string;
  action: string;
  subject: string;
  resource?: Record<string, any>;
  context?: Record<string, any>;
}

/**
 * 权限检查响应
 */
export interface PermissionCheckRes {
  allowed: boolean;
  reason?: string;
  matchedPermissions?: PermissionRes[];
}

/**
 * 登录请求
 */
export interface LoginReq {
  usernameOrEmail: string;
  password: string;
}

/**
 * 登录响应
 */
export interface LoginRes {
  accessToken: string;
  refreshToken: string;
  user: UserRes;
}

/**
 * 注册请求
 */
export interface RegisterReq {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * 刷新令牌响应
 */
export interface RefreshTokenRes {
  accessToken: string;
  refreshToken: string;
}


