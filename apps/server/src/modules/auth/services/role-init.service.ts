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
  RBAC_ROLE_PERMISSIONS,
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

      // 第二步：创建所有角色（不包含继承关系）
      const createdRoles = new Map<string, Role>();
      for (const [roleName, permissionCodes] of Object.entries(RBAC_ROLE_PERMISSIONS)) {
        const role = await this.createRoleWithPermissionCodes(roleName, permissionCodes);
        createdRoles.set(roleName, role);
      }

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
   * 根据权限编码创建角色
   */
  private async createRoleWithPermissionCodes(
    roleName: string,
    permissionCodes: readonly string[]
  ): Promise<Role> {
    // 查找权限
    const permissions: Permission[] = [];
    for (const code of permissionCodes) {
      const permission = await this.permissionTypeOrmRepository.findOne({
        where: { code }
      });
      if (permission) {
        permissions.push(permission);
      } else {
        this.logger.warn(`权限不存在: ${code}`);
      }
    }

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
   * 重置角色和权限（开发环境使用）
   */
  async resetRoles(): Promise<void> {
    this.logger.warn('重置所有角色和权限...');
    
    // 删除所有角色（会级联删除权限关联）
    await this.roleRepository.delete({});
    await this.permissionTypeOrmRepository.delete({});
    
    // 重新初始化
    await this.initializeRoles();
    
    this.logger.log('角色和权限重置完成');
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
