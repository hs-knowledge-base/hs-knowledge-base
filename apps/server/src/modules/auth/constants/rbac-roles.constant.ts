import { PermissionType } from '../entities/permission.entity';

/**
 * RBAC2 用户角色常量
 */
export const RBAC_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TEAM_LEADER: 'team_leader',
  TEAM_DEVELOPER: 'team_developer',
  VISITOR: 'visitor'
} as const;

/**
 * 角色描述配置
 */
export const RBAC_ROLE_DESCRIPTIONS = {
  [RBAC_ROLES.SUPER_ADMIN]: '超级管理员，拥有系统最高权限',
  [RBAC_ROLES.ADMIN]: '管理员，负责平台日常管理工作',
  [RBAC_ROLES.TEAM_LEADER]: '团队领导，管理团队和项目',
  [RBAC_ROLES.TEAM_DEVELOPER]: '团队开发者，负责内容创建和维护',
  [RBAC_ROLES.VISITOR]: '访客，只能查看公开内容'
} as const;

/**
 * 角色层级配置
 */
export const RBAC_ROLE_LEVELS = {
  [RBAC_ROLES.VISITOR]: 0,
  [RBAC_ROLES.TEAM_DEVELOPER]: 1,
  [RBAC_ROLES.TEAM_LEADER]: 2,
  [RBAC_ROLES.ADMIN]: 3,
  [RBAC_ROLES.SUPER_ADMIN]: 4,
} as const;

/**
 * 角色继承关系配置
 */
export const RBAC_ROLE_INHERITANCE = {
  [RBAC_ROLES.TEAM_DEVELOPER]: RBAC_ROLES.VISITOR,
  [RBAC_ROLES.TEAM_LEADER]: RBAC_ROLES.TEAM_DEVELOPER,
  [RBAC_ROLES.ADMIN]: RBAC_ROLES.TEAM_LEADER,
  [RBAC_ROLES.SUPER_ADMIN]: RBAC_ROLES.ADMIN,
} as const;

/**
 * 简化的权限树结构
 */
export const PERMISSION_TREE = [
  // 仪表盘
  {
    code: 'dashboard',
    name: '仪表盘',
    type: PermissionType.MODULE,
    icon: 'dashboard',
    path: '/dashboard',
    sort: 1
  },
  
  // 系统管理
  {
    code: 'system',
    name: '系统管理',
    type: PermissionType.MODULE,
    icon: 'system',
    path: '/system',
    sort: 2,
    children: [
      {
        code: 'system.user',
        name: '用户管理',
        type: PermissionType.MENU,
        icon: 'user',
        path: '/system/user',
        sort: 1,
        children: [
          {
            code: 'system.user.view',
            name: '查看',
            type: PermissionType.BUTTON,
            sort: 1
          },
          {
            code: 'system.user.add',
            name: '新增',
            type: PermissionType.BUTTON,
            sort: 2
          },
          {
            code: 'system.user.edit',
            name: '编辑',
            type: PermissionType.BUTTON,
            sort: 3
          },
          {
            code: 'system.user.delete',
            name: '删除',
            type: PermissionType.BUTTON,
            sort: 4
          }
        ]
      },
      {
        code: 'system.role',
        name: '角色管理',
        type: PermissionType.MENU,
        icon: 'role',
        path: '/system/role',
        sort: 2,
        children: [
          {
            code: 'system.role.view',
            name: '查看',
            type: PermissionType.BUTTON,
            sort: 1
          },
          {
            code: 'system.role.add',
            name: '新增',
            type: PermissionType.BUTTON,
            sort: 2
          },
          {
            code: 'system.role.edit',
            name: '编辑',
            type: PermissionType.BUTTON,
            sort: 3
          },
          {
            code: 'system.role.delete',
            name: '删除',
            type: PermissionType.BUTTON,
            sort: 4
          }
        ]
      },
      {
        code: 'system.permission',
        name: '权限管理',
        type: PermissionType.MENU,
        icon: 'permission',
        path: '/system/permission',
        sort: 3,
        children: [
          {
            code: 'system.permission.view',
            name: '查看',
            type: PermissionType.BUTTON,
            sort: 1
          },
          {
            code: 'system.permission.edit',
            name: '编辑',
            type: PermissionType.BUTTON,
            sort: 2
          }
        ]
      }
    ]
  },
];



/**
 * 默认约束配置
 */
export const RBAC_DEFAULT_CONSTRAINTS = [
  {
    name: '角色数量限制',
    description: '用户最多只能同时拥有3个角色',
    type: 'cardinality',
    constrainedRoles: [],
    parameters: { maxRoles: 3 }
  }
] as const; 