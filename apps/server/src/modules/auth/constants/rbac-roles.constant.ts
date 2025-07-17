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
  
  // 内容管理
  {
    code: 'content',
    name: '内容管理',
    type: PermissionType.MODULE,
    icon: 'content',
    path: '/content',
    sort: 3,
    children: [
      {
        code: 'content.document',
        name: '文档管理',
        type: PermissionType.MENU,
        icon: 'document',
        path: '/content/document',
        sort: 1,
        children: [
          {
            code: 'content.document.view',
            name: '查看',
            type: PermissionType.BUTTON,
            sort: 1
          },
          {
            code: 'content.document.add',
            name: '新增',
            type: PermissionType.BUTTON,
            sort: 2
          },
          {
            code: 'content.document.edit',
            name: '编辑',
            type: PermissionType.BUTTON,
            sort: 3
          },
          {
            code: 'content.document.delete',
            name: '删除',
            type: PermissionType.BUTTON,
            sort: 4
          }
        ]
      },
      {
        code: 'content.knowledge',
        name: '知识库管理',
        type: PermissionType.MENU,
        icon: 'knowledge',
        path: '/content/knowledge',
        sort: 2,
        children: [
          {
            code: 'content.knowledge.view',
            name: '查看',
            type: PermissionType.BUTTON,
            sort: 1
          },
          {
            code: 'content.knowledge.add',
            name: '新增',
            type: PermissionType.BUTTON,
            sort: 2
          },
          {
            code: 'content.knowledge.edit',
            name: '编辑',
            type: PermissionType.BUTTON,
            sort: 3
          },
          {
            code: 'content.knowledge.delete',
            name: '删除',
            type: PermissionType.BUTTON,
            sort: 4
          }
        ]
      }
    ]
  }
];

/**
 * 角色权限分配 - 基于权限编码
 */
export const RBAC_ROLE_PERMISSIONS = {
  [RBAC_ROLES.VISITOR]: [
    'dashboard',
    'content',
    'content.document',
    'content.document.view',
    'content.knowledge',
    'content.knowledge.view'
  ],
  
  [RBAC_ROLES.TEAM_DEVELOPER]: [
    // 继承访客权限，增加文档编辑权限
    'content.document.add',
    'content.document.edit',
    'content.knowledge.add',
    'content.knowledge.edit'
  ],
  
  [RBAC_ROLES.TEAM_LEADER]: [
    // 继承开发者权限，增加删除权限
    'content.document.delete',
    'content.knowledge.delete',
    'system',
    'system.user',
    'system.user.view'
  ],
  
  [RBAC_ROLES.ADMIN]: [
    // 继承领导权限，增加用户和角色管理权限
    'system.user.add',
    'system.user.edit',
    'system.user.delete',
    'system.role',
    'system.role.view',
    'system.role.add',
    'system.role.edit',
    'system.role.delete'
  ],
  
  [RBAC_ROLES.SUPER_ADMIN]: [
    // 继承管理员权限，增加权限管理权限
    'system.permission',
    'system.permission.view',
    'system.permission.edit'
  ]
} as const;

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