// 权限操作枚举
export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

// 资源主体枚举
export enum Subject {
  USER = 'User',
  ROLE = 'Role',
  PERMISSION = 'Permission',
  DOCUMENT = 'Document',
  KNOWLEDGE_BASE = 'KnowledgeBase',
  ALL = 'all',
}

// 用户接口
export interface User {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  firstName?: string;
  lastName?: string;
  attributes?: Record<string, any>;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

// 角色接口
export interface Role {
  id: string;
  name: string;
  description?: string;
  attributes?: Record<string, any>;
  users: User[];
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

// 权限接口
export interface Permission {
  id: string;
  action: Action;
  subject: Subject;
  conditions?: Record<string, any>;
  fields?: string;
  inverted: boolean;
  reason?: string;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

// 创建用户 DTO
export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  isActive?: boolean;
  firstName?: string;
  lastName?: string;
  roleIds?: string[];
  attributes?: Record<string, any>;
}

// 创建角色 DTO
export interface CreateRoleDto {
  name: string;
  description?: string;
  permissionIds?: string[];
  attributes?: Record<string, any>;
}

// 创建权限 DTO
export interface CreatePermissionDto {
  action: Action;
  subject: Subject;
  conditions?: Record<string, any>;
  fields?: string;
  inverted?: boolean;
  reason?: string;
}

// 权限检查请求
export interface PermissionCheckRequest {
  userId: string;
  action: Action;
  subject: Subject;
  conditions?: any;
}

// 权限检查响应
export interface PermissionCheckResponse {
  allowed: boolean;
  message?: string;
}
