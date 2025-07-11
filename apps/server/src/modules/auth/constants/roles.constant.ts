import { Action, Subject } from '../entities/permission.entity';

/**
 * 用户角色常量
 */
export const USER_ROLES = {
  /**
   * 超级管理员，拥有所有权限
   */
  SUPER_ADMIN: 'super_admin',
  /**
   * 管理员，可以管理用户、角色和内容
   */
  ADMIN: 'admin',
  /**
   * 团队开发者，可以管理文档和知识库内容
   */
  TEAM_DEVELOPER: 'team_developer',
  /**
   * 访客，只能查看公开内容
   */
  VISITOR: 'visitor'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * 角色权限配置
 */
export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: [
    {
      action: Action.MANAGE,
      subject: Subject.ALL,
      reason: '超级管理员拥有所有权限'
    }
  ],
  
  [USER_ROLES.ADMIN]: [
    {
      action: Action.MANAGE,
      subject: Subject.USER,
      reason: '管理员可以管理用户'
    },
    {
      action: Action.MANAGE,
      subject: Subject.ROLE,
      reason: '管理员可以管理角色'
    },
    {
      action: Action.MANAGE,
      subject: Subject.KNOWLEDGE_BASE,
      reason: '管理员可以管理知识库'
    },
    {
      action: Action.MANAGE,
      subject: Subject.DOCUMENT,
      reason: '管理员可以管理文档'
    },
    {
      action: Action.READ,
      subject: Subject.SYSTEM,
      reason: '管理员可以查看系统信息'
    }
  ],
  
  [USER_ROLES.TEAM_DEVELOPER]: [
    {
      action: Action.MANAGE,
      subject: Subject.DOCUMENT,
      reason: '团队开发者可以管理文档'
    },
    {
      action: Action.MANAGE,
      subject: Subject.KNOWLEDGE_BASE,
      reason: '团队开发者可以管理知识库'
    },
    {
      action: Action.READ,
      subject: Subject.USER,
      reason: '团队开发者可以查看用户信息'
    }
  ],
  
  [USER_ROLES.VISITOR]: [
    {
      action: Action.READ,
      subject: Subject.DOCUMENT,
      reason: '访客可以查看文档'
    },
    {
      action: Action.READ,
      subject: Subject.KNOWLEDGE_BASE,
      reason: '访客可以查看知识库'
    }
  ]
} as const;

/**
 * 角色描述
 */
export const ROLE_DESCRIPTIONS = {
  [USER_ROLES.SUPER_ADMIN]: '超级管理员，拥有系统所有权限',
  [USER_ROLES.ADMIN]: '管理员，可以管理用户、角色和内容',
  [USER_ROLES.TEAM_DEVELOPER]: '团队开发者，可以管理文档和知识库内容',
  [USER_ROLES.VISITOR]: '访客，只能查看公开内容'
} as const;
