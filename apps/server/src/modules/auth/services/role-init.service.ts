import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '@/modules/user/entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { USER_ROLES, ROLE_PERMISSIONS, ROLE_DESCRIPTIONS } from '../constants/roles.constant';

/**
 * 角色初始化服务
 * 用于初始化系统预设角色和权限
 */
@Injectable()
export class RoleInitService {
  private readonly logger = new Logger(RoleInitService.name);

  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  /**
   * 初始化系统角色和权限
   */
  async initializeRoles(): Promise<void> {
    this.logger.log('开始初始化系统角色和权限...');

    try {
      // 检查是否已经初始化过
      const existingRoles = await this.roleRepository.count();
      if (existingRoles > 0) {
        this.logger.log('角色已存在，跳过初始化');
        return;
      }

      // 创建角色和权限
      for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
        await this.createRoleWithPermissions(roleName, [...permissions]);
      }

      this.logger.log('系统角色和权限初始化完成');
    } catch (error) {
      this.logger.error('初始化角色和权限失败:', error);
      throw error;
    }
  }

  /**
   * 创建角色及其权限
   */
  private async createRoleWithPermissions(
    roleName: string,
    permissionConfigs: any[]
  ) {
    // 创建权限
    const permissions: Permission[] = [];
    for (const config of permissionConfigs) {
      const permissionData = {
        action: config.action,
        subject: config.subject,
        conditions: undefined, // TODO 当前阶段保持简单，预留扩展
        fields: undefined,
        inverted: false,
        reason: config.reason
      };

      const permission = this.permissionRepository.create(permissionData);
      const savedPermission = await this.permissionRepository.save(permission);
      permissions.push(savedPermission);
    }

    // 创建角色
    const role = this.roleRepository.create({
      name: roleName,
      description: ROLE_DESCRIPTIONS[roleName as keyof typeof ROLE_DESCRIPTIONS],
      permissions
    });

    const savedRole = await this.roleRepository.save(role);
    this.logger.log(`创建角色: ${roleName}, 权限数量: ${permissions.length}`);
    
    return savedRole;
  }

  /**
   * 重置角色和权限（开发环境使用）
   */
  async resetRoles(): Promise<void> {
    this.logger.warn('重置所有角色和权限...');
    
    // 删除所有角色（会级联删除权限关联）
    await this.roleRepository.delete({});
    await this.permissionRepository.delete({});
    
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
        action: p.action,
        subject: p.subject,
        reason: p.reason
      }))
    }));
  }

  /**
   * 检查用户是否有指定角色
   */
  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const role = await this.roleRepository.findOne({
      where: { name: roleName },
      relations: ['users']
    });

    return role?.users?.some(user => user.id === userId) || false;
  }
}
