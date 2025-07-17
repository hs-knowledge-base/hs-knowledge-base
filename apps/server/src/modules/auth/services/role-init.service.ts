import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '@/modules/user/entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RbacConstraint, ConstraintType } from '../entities/constraint.entity';
import { 
  RBAC_ROLES, 
  RBAC_ROLE_DESCRIPTIONS, 
  RBAC_ROLE_LEVELS, 
  RBAC_ROLE_INHERITANCE, 
  RBAC_DEFAULT_CONSTRAINTS,
  PERMISSION_TREE
} from '../constants/rbac-roles.constant';

/**
 * RBAC2 角色初始化服务
 * 用于初始化系统预设角色、权限和约束
 */
@Injectable()
export class RoleInitService {
  private readonly logger = new Logger(RoleInitService.name);

  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionTypeOrmRepository: Repository<Permission>,
    @InjectRepository(RbacConstraint)
    private constraintRepository: Repository<RbacConstraint>,
  ) {}

  /**
   * 初始化RBAC2系统角色、权限和约束
   */
  async initializeRoles(): Promise<void> {
    this.logger.log('开始初始化RBAC2系统...');

    try {
      // 检查是否已经初始化过
      const existingRoles = await this.roleRepository.count();
      if (existingRoles > 0) {
        this.logger.log('角色已存在，跳过初始化');
        return;
      }

      // 第一步：创建权限树结构
      await this.createPermissionTree();

      // 第二步：创建所有角色（根据权限规则分配权限）
      const createdRoles = new Map<string, Role>();
      await this.createRolesWithDynamicPermissions(createdRoles);

              // 第三步：建立角色继承关系
        await this.setupRoleInheritance(createdRoles);

        // 第四步：创建默认约束
        await this.createDefaultConstraints(createdRoles);

      this.logger.log('RBAC2系统初始化完成');
    } catch (error) {
      this.logger.error('初始化RBAC2系统失败:', error);
      throw error;
    }
  }

  /**
   * 创建权限树结构
   */
  private async createPermissionTree(): Promise<void> {
    this.logger.log('开始创建权限树结构...');

    for (const moduleItem of PERMISSION_TREE) {
      await this.createPermissionNode(moduleItem, null);
    }

    this.logger.log('权限树结构创建完成');
  }

  /**
   * 递归创建权限节点
   */
  private async createPermissionNode(nodeConfig: any, parent: Permission | null): Promise<Permission> {
    const permission = this.permissionTypeOrmRepository.create({
      code: nodeConfig.code,
      name: nodeConfig.name,
      type: nodeConfig.type,
      description: nodeConfig.description,
      path: nodeConfig.path,
      icon: nodeConfig.icon,
      sort: nodeConfig.sort || 0,
      parent: parent || undefined
    });

    const savedPermission = await this.permissionTypeOrmRepository.save(permission);

    // 递归创建子节点
    if (nodeConfig.children?.length) {
      for (const childConfig of nodeConfig.children) {
        await this.createPermissionNode(childConfig, savedPermission);
      }
    }

    this.logger.log(`创建权限: ${nodeConfig.code} (${nodeConfig.name})`);
    return savedPermission;
  }

  /**
   * 动态创建角色并分配权限
   */
  private async createRolesWithDynamicPermissions(createdRoles: Map<string, Role>): Promise<void> {
    // 获取所有权限
    const allPermissions = await this.permissionTypeOrmRepository.find();
    
    // 按角色层级顺序创建角色
    const roleOrder = [
      RBAC_ROLES.VISITOR,
      RBAC_ROLES.TEAM_DEVELOPER, 
      RBAC_ROLES.TEAM_LEADER,
      RBAC_ROLES.ADMIN,
      RBAC_ROLES.SUPER_ADMIN
    ];

    for (const roleName of roleOrder) {
      const permissions = this.getPermissionsForRole(roleName, allPermissions);
      const role = await this.createRoleWithPermissions(roleName, permissions);
      createdRoles.set(roleName, role);
    }
  }

  /**
   * 根据角色获取应分配的权限
   */
  private getPermissionsForRole(roleName: string, allPermissions: Permission[]): Permission[] {
    switch (roleName) {
      case RBAC_ROLES.VISITOR:
        return allPermissions.filter(p => 
          p.code === 'dashboard' ||
          p.code === 'content' ||
          (p.code.startsWith('content.') && p.code.endsWith('.view')) ||
          p.code === 'content.document' ||
          p.code === 'content.knowledge'
        );
        
      case RBAC_ROLES.TEAM_DEVELOPER:
        return allPermissions.filter(p => 
          p.code === 'dashboard' ||
          p.code === 'content' ||
          p.code === 'content.document' ||
          p.code === 'content.knowledge' ||
          (p.code.startsWith('content.') && (
            p.code.endsWith('.view') || 
            p.code.endsWith('.add') || 
            p.code.endsWith('.edit')
          ))
        );
        
      case RBAC_ROLES.TEAM_LEADER:
        return allPermissions.filter(p => 
          p.code === 'dashboard' ||
          p.code === 'content' ||
          p.code.startsWith('content.') ||
          p.code === 'system' ||
          p.code === 'system.user' ||
          p.code === 'system.user.view'
        );
        
      case RBAC_ROLES.ADMIN:
        return allPermissions.filter(p => 
          p.code === 'dashboard' ||
          p.code === 'content' ||
          p.code.startsWith('content.') ||
          p.code === 'system' ||
          p.code.startsWith('system.user') ||
          p.code.startsWith('system.role')
        );
        
      case RBAC_ROLES.SUPER_ADMIN:
        // 超级管理员拥有所有权限
        return allPermissions;
        
      default:
        return [];
    }
  }

  /**
   * 根据权限列表创建角色
   */
  private async createRoleWithPermissions(
    roleName: string,
    permissions: Permission[]
  ): Promise<Role> {
    // 创建角色
    const role = this.roleRepository.create({
      name: roleName,
      description: RBAC_ROLE_DESCRIPTIONS[roleName as keyof typeof RBAC_ROLE_DESCRIPTIONS],
      level: RBAC_ROLE_LEVELS[roleName as keyof typeof RBAC_ROLE_LEVELS],
      isActive: true,
      permissions
    });

    const savedRole = await this.roleRepository.save(role);
    this.logger.log(`创建角色: ${roleName}, 层级: ${role.level}, 权限数量: ${permissions.length}`);
    
    return savedRole;
  }

  /**
   * 建立角色继承关系
   */
  private async setupRoleInheritance(createdRoles: Map<string, Role>): Promise<void> {
    this.logger.log('开始建立角色继承关系...');

    for (const [childRoleName, parentRoleName] of Object.entries(RBAC_ROLE_INHERITANCE)) {
      const childRole = createdRoles.get(childRoleName);
      const parentRole = createdRoles.get(parentRoleName);

      if (childRole && parentRole) {
        childRole.parent = parentRole;
        await this.roleRepository.save(childRole);
        this.logger.log(`建立继承关系: ${childRoleName} -> ${parentRoleName}`);
      }
    }

    this.logger.log('角色继承关系建立完成');
  }

  /**
   * 创建默认约束
   */
  private async createDefaultConstraints(createdRoles: Map<string, Role>): Promise<void> {
    this.logger.log('开始创建默认约束...');

    for (const constraintConfig of RBAC_DEFAULT_CONSTRAINTS) {
      // 查找约束涉及的角色
      const constrainedRoles: Role[] = [];
      for (const roleName of constraintConfig.constrainedRoles) {
        const role = createdRoles.get(roleName);
        if (role) {
          constrainedRoles.push(role);
        }
      }

      // 创建约束
      const constraint = this.constraintRepository.create({
        name: constraintConfig.name,
        description: constraintConfig.description,
        type: constraintConfig.type as ConstraintType,
        isActive: true,
        parameters: constraintConfig.parameters,
        constrainedRoles
      });

      await this.constraintRepository.save(constraint);
      this.logger.log(`创建约束: ${constraintConfig.name}`);
    }

    this.logger.log('默认约束创建完成');
  }

  /**
   * 获取角色权限概览
   */
  async getRolePermissionOverview(): Promise<any> {
    const roles = await this.roleRepository.find({
      relations: ['permissions']
    });

    return roles.map(role => ({
      name: role.name,
      description: role.description,
      permissions: role.permissions.map(p => ({
        code: p.code,
        name: p.name,
        type: p.type
      }))
    }));
  }

  /**
   * 检查用户是否具有指定角色
   */
  private async userHasRole(userId: number, roleName: string): Promise<boolean> {
    const role = await this.roleRepository.findOne({
      where: { name: roleName },
      relations: ['users'],
    });
    
    return role?.users?.some(user => user.id === userId) || false;
  }
}
