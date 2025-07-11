import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UserService } from '@/modules/user/services/user.service';
import { PermissionService } from '@/modules/auth/services/permission.service';
import { RoleRepository } from '@/modules/user/repositories/role.repository';
import { PermissionRepository } from '@/modules/auth/repositories/permission.repository';
import { UserRepository } from '@/modules/user/repositories/user.repository';
import { Action, Subject } from '@/modules/auth/entities/permission.entity';

/**
 * 数据初始化服务
 * 负责在应用启动时初始化必要的数据
 */
@Injectable()
export class DataInitializerService implements OnModuleInit {
  private readonly logger = new Logger(DataInitializerService.name);

  constructor(
    private readonly userService: UserService,
    private readonly permissionService: PermissionService,
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly userRepository: UserRepository,
  ) {
    this.logger.log('DataInitializerService构造函数被调用');
  }

  /**
   * NestJS生命周期钩子，在模块初始化时自动调用
   */
  async onModuleInit() {
    await this.initializeDefaultData();
  }

  /**
   * 初始化默认数据
   */
  private async initializeDefaultData() {
    try {
      this.logger.log('开始初始化默认数据...');

      await this.initializeDefaultPermissions();
      await this.initializeDefaultRoles();
      await this.initializeDefaultUsers();

      this.logger.log('默认数据初始化完成');
    } catch (error) {
      this.logger.error('初始化默认数据失败:', error);
    }
  }

  /**
   * 初始化默认权限
   */
  private async initializeDefaultPermissions() {
    // 检查是否已有权限数据
    const hasPermissions = await this.permissionRepository.hasAnyPermissions();
    if (hasPermissions) {
      this.logger.debug('权限数据已存在，跳过权限初始化');
      return;
    }

    const defaultPermissions = [
      // 用户管理权限
      { action: Action.MANAGE, subject: Subject.ALL, reason: '超级管理员权限' },
      { action: Action.READ, subject: Subject.USER, reason: '读取用户信息' },
      { action: Action.CREATE, subject: Subject.USER, reason: '创建用户' },
      { action: Action.UPDATE, subject: Subject.USER, reason: '更新用户信息' },
      { action: Action.DELETE, subject: Subject.USER, reason: '删除用户' },

      // 角色管理权限
      { action: Action.READ, subject: Subject.ROLE, reason: '读取角色信息' },
      { action: Action.CREATE, subject: Subject.ROLE, reason: '创建角色' },
      { action: Action.UPDATE, subject: Subject.ROLE, reason: '更新角色' },
      { action: Action.DELETE, subject: Subject.ROLE, reason: '删除角色' },

      // 权限管理权限
      { action: Action.READ, subject: Subject.PERMISSION, reason: '读取权限信息' },
      { action: Action.CREATE, subject: Subject.PERMISSION, reason: '创建权限' },
      { action: Action.UPDATE, subject: Subject.PERMISSION, reason: '更新权限' },
      { action: Action.DELETE, subject: Subject.PERMISSION, reason: '删除权限' },
    ];

    for (const permissionData of defaultPermissions) {
      try {
        await this.permissionService.create(permissionData);
        this.logger.log(`创建权限: ${permissionData.action} ${permissionData.subject}`);
      } catch (error) {
        // 权限可能已存在，忽略错误
        this.logger.debug(`权限已存在: ${permissionData.action} ${permissionData.subject}`);
      }
    }
  }

  /**
   * 初始化默认角色
   */
  private async initializeDefaultRoles() {
    const defaultRoles = [
      {
        name: 'admin',
        description: '系统管理员',
        attributes: { level: 10, clearance: 'highest' },
      },
      {
        name: 'user',
        description: '普通用户',
        attributes: { level: 1, clearance: 'low' },
      },
      {
        name: 'editor',
        description: '编辑者',
        attributes: { level: 5, clearance: 'medium' },
      },
    ];

    for (const roleData of defaultRoles) {
      try {
        const existingRole = await this.roleRepository.existsByName(roleData.name);
        if (!existingRole) {
          const role = this.roleRepository.create(roleData);

          // 为管理员角色分配所有权限
          if (roleData.name === 'admin') {
            const allPermissions = await this.permissionRepository.findAllWithRoles();
            role.permissions = allPermissions;
          }

          await this.roleRepository.save(role);
          this.logger.log(`创建角色: ${roleData.name}`);
        } else {
          this.logger.debug(`角色已存在: ${roleData.name}`);
        }
      } catch (error) {
        this.logger.error(`创建角色失败: ${roleData.name}`, error);
      }
    }
  }

  /**
   * 初始化默认用户
   */
  private async initializeDefaultUsers() {
    // 检查是否已有用户数据
    const hasUsers = await this.userRepository.hasAnyUsers();
    if (hasUsers) {
      this.logger.debug('用户数据已存在，跳过用户初始化');
      return;
    }

    const defaultUsers = [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        firstName: '系统',
        lastName: '管理员',
        department: 'IT',
        position: '系统管理员',
        attributes: { level: 10, clearance: 'highest' },
        roleName: 'admin',
      },
      {
        username: 'user',
        email: 'user@example.com',
        password: 'user123',
        firstName: '普通',
        lastName: '用户',
        department: '业务部',
        position: '业务员',
        attributes: { level: 1, clearance: 'low' },
        roleName: 'user',
      },
    ];

    for (const userData of defaultUsers) {
      try {
        const existingUser = await this.userService.findByUsername(userData.username);
        if (!existingUser) {
          const { roleName, ...userCreateData } = userData;

          // 获取角色
          const role = await this.roleRepository.findByName(roleName);
          const roleIds = role ? [role.id] : [];

          await this.userService.create({
            ...userCreateData,
            roleIds,
          });
          this.logger.log(`创建默认用户: ${userData.username}`);
        } else {
          this.logger.debug(`用户已存在: ${userData.username}`);
        }
      } catch (error) {
        this.logger.error(`创建用户失败: ${userData.username}`, error);
      }
    }
  }
}