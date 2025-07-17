import { Injectable } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';
import { Role } from '../../user/entities/role.entity';
import { Permission, PermissionType } from '../entities/permission.entity';
import { UserSession } from '../entities/session.entity';

/**
 * RBAC2 权限能力工厂
 * 基于纯RBAC模型实现权限检查，支持角色层次结构和会话管理
 */
@Injectable()
export class RbacAbilityFactory {
  
  /**
   * 为用户创建权限检查器
   */
  createForUser(user: User): RbacAbility {
    const permissions = this.extractUserPermissions(user);
    return new RbacAbility(permissions);
  }

  /**
   * 为用户会话创建权限检查器（RBAC2 特性）
   */
  createForSession(session: UserSession): RbacAbility {
    const permissions = this.extractSessionPermissions(session);
    return new RbacAbility(permissions);
  }

  /**
   * 提取用户的所有权限（包括继承的权限）
   */
  private extractUserPermissions(user: User): Permission[] {
    if (!user.roles?.length) {
      return [];
    }

    const allPermissions = new Map<string, Permission>();
    
    // 处理每个角色及其继承的权限
    for (const role of user.roles) {
      // 添加角色直接权限
      if (role.permissions?.length) {
        role.permissions.forEach(permission => {
          const key = permission.code;
          allPermissions.set(key, permission);
        });
      }

      // 添加继承的权限（角色层次结构）
      this.addInheritedPermissions(role, allPermissions);
    }

    return Array.from(allPermissions.values());
  }

  /**
   * 提取会话的激活角色权限
   */
  private extractSessionPermissions(session: UserSession): Permission[] {
    if (!session.activeRoles?.length) {
      return [];
    }

    const allPermissions = new Map<string, Permission>();
    
    for (const role of session.activeRoles) {
      if (role.permissions?.length) {
        role.permissions.forEach(permission => {
          const key = permission.code;
          allPermissions.set(key, permission);
        });
      }

      // 添加继承的权限
      this.addInheritedPermissions(role, allPermissions);
    }

    return Array.from(allPermissions.values());
  }

  /**
   * 递归添加角色继承的权限
   */
  private addInheritedPermissions(role: Role, permissionMap: Map<string, Permission>): void {
    // 通过父角色继承权限
    if (role.parent && role.parent.permissions?.length) {
      role.parent.permissions.forEach(permission => {
        const key = permission.code;
        permissionMap.set(key, permission);
      });
      
      // 递归处理父角色的父角色
      this.addInheritedPermissions(role.parent, permissionMap);
    }
  }
}

/**
 * RBAC权限检查器
 * 简化的权限检查逻辑，不依赖CASL库
 */
export class RbacAbility {
  private permissions: Permission[];

  constructor(permissions: Permission[]) {
    this.permissions = permissions;
  }

  /**
   * 检查是否有权限访问指定权限编码
   */
  can(permissionCode: string): boolean {
    return this.permissions.some(permission => {
      return permission.code === permissionCode;
    });
  }



  /**
   * 检查是否被禁止访问指定权限编码
   */
  cannot(permissionCode: string): boolean {
    return !this.can(permissionCode);
  }

  /**
   * 获取所有权限列表
   */
  getPermissions(): Permission[] {
    return this.permissions;
  }

  /**
   * 获取用户的菜单权限（用于前端菜单生成）
   */
  getMenuPermissions(): Permission[] {
    return this.permissions.filter(permission => 
      permission.type === PermissionType.MODULE || permission.type === PermissionType.MENU
    ).sort((a, b) => a.sort - b.sort);
  }

  /**
   * 获取用户的按钮权限（用于前端按钮显示）
   */
  getButtonPermissions(): Permission[] {
    return this.permissions.filter(permission => 
      permission.type === PermissionType.BUTTON
    );
  }

  /**
   * 获取指定类型的权限编码列表
   */
  getPermissionCodes(type?: PermissionType): string[] {
    return this.permissions
      .filter(permission => type ? permission.type === type : true)
      .map(permission => permission.code);
  }

  /**
   * 构建权限树（用于前端权限树显示）
   */
  buildPermissionTree(): any[] {
    const modules = this.permissions.filter(p => 
      p.type === PermissionType.MODULE && !p.parent
    );

    return modules.map(module => this.buildTreeNode(module)).sort((a, b) => a.sort - b.sort);
  }

  private buildTreeNode(permission: Permission): any {
    const children = this.permissions
      .filter(p => p.parent?.id === permission.id)
      .map(child => this.buildTreeNode(child))
      .sort((a, b) => a.sort - b.sort);

    return {
      id: permission.id,
      code: permission.code,
      name: permission.name,
      type: permission.type,
      path: permission.path,
      icon: permission.icon,
      sort: permission.sort,
      children: children.length > 0 ? children : undefined
    };
  }
} 