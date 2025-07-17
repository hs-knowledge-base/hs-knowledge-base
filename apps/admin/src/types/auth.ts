/**
 * 常用操作类型常量
 */
export const COMMON_ACTIONS = {
  CREATE: "create",
  READ: "read", 
  UPDATE: "update",
  DELETE: "delete",
  LIST: "list",
  EXPORT: "export",
  IMPORT: "import",
  APPROVE: "approve",
  REJECT: "reject",
  PUBLISH: "publish",
  ARCHIVE: "archive",
  MANAGE: "manage",
} as const;

/**
 * 常用资源类型常量
 */
export const COMMON_SUBJECTS = {
  USER: "user",
  DOCUMENT: "document", 
  SYSTEM: "system",
  POLICY: "policy",
  ATTRIBUTE_DEFINITION: "attribute-definition",
  ALL: "*",
} as const;

/**
 * 策略效果枚举
 */
export enum Effect {
  ALLOW = "allow",
  DENY = "deny",
}

/**
 * 用户响应接口
 */
export interface UserRes {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // ABAC 用户属性
  attributes?: {
    level?: number;
    skills?: string[];
    [key: string]: any;
  };
}

/**
 * ABAC策略响应接口（支持四维属性）
 */
export interface PolicyRes {
  id: string;
  name: string;
  description?: string;
  effect: Effect;
  action: string;  // 动态字符串，支持任意操作
  subject: string; // 动态字符串，支持任意资源
  isActive: boolean;
  priority: number;
  
  // 四维属性条件
  subjectConditions?: Record<string, any>;    // 主体属性条件
  resourceConditions?: Record<string, any>;   // 资源属性条件
  environmentConditions?: Record<string, any>; // 环境属性条件
  actionConditions?: Record<string, any>;     // 动作属性条件
  
  // 元数据
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
  // ABAC 用户属性
  level?: number;
  skills?: string[];
  attributes?: Record<string, any>;
}

/**
 * 创建策略请求（支持四维属性）
 */
export interface CreatePolicyReq {
  name: string;
  description?: string;
  effect: Effect;
  action: string;
  subject: string;
  isActive?: boolean;
  priority?: number;
  
  // 四维属性条件
  subjectConditions?: Record<string, any>;
  resourceConditions?: Record<string, any>;
  environmentConditions?: Record<string, any>;
  actionConditions?: Record<string, any>;
}