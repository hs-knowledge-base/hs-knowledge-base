import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UserService } from '@/modules/user/services/user.service';
import { RoleInitService } from '@/modules/auth/services/role-init.service';
import { UserRepository } from '@/modules/user/repositories/user.repository';
import { RoleRepository } from '@/modules/user/repositories/role.repository';

/**
 * 数据初始化服务
 * 负责在应用启动时初始化必要的数据
 */
@Injectable()
export class DataInitializerService implements OnModuleInit {
  private readonly logger = new Logger(DataInitializerService.name);

  constructor(
    private readonly userService: UserService,
    private readonly roleInitService: RoleInitService,
    private readonly roleRepository: RoleRepository,
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

      await this.roleInitService.initializeRoles();
      await this.initializeDefaultUsers();

      this.logger.log('默认数据初始化完成');
    } catch (error) {
      this.logger.error('初始化默认数据失败:', error);
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
        username: 'superadmin',
        email: 'superadmin@example.com',
        password: 'admin123',
        firstName: '超级',
        lastName: '管理员',
        department: 'IT',
        position: '超级管理员',
        attributes: { level: 10, clearance: 'highest' },
        roleName: 'super_admin',
      },
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        firstName: '系统',
        lastName: '管理员',
        department: 'IT',
        position: '系统管理员',
        attributes: { level: 8, clearance: 'high' },
        roleName: 'admin',
      },
      {
        username: 'developer',
        email: 'developer@example.com',
        password: 'dev123',
        firstName: '团队',
        lastName: '开发者',
        department: 'IT',
        position: '开发工程师',
        attributes: { level: 5, clearance: 'medium' },
        roleName: 'team_developer',
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