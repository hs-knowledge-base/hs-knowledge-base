import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    private readonly configService: ConfigService,
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

    const superAdminPassword = this.configService.get<string>('SUPER_ADMIN_PASSWORD');

    if (!superAdminPassword) {
      this.logger.warn('未设置 SUPER_ADMIN_PASSWORD 环境变量，跳过超级管理员创建');
      return;
    }

    const superAdminData = {
      username: 'superadmin',
      email: 'superadmin@example.com',
      password: superAdminPassword,
      firstName: '超级',
      lastName: '管理员',
      department: 'IT',
      position: '超级管理员',
      attributes: { level: 10, clearance: 'highest' },
      roleName: 'super_admin',
    };

    try {
      const existingUser = await this.userService.findByUsername(superAdminData.username);
      if (!existingUser) {
        const { roleName, ...userCreateData } = superAdminData;

        // 获取超级管理员角色
        const role = await this.roleRepository.findByName(roleName);
        if (!role) {
          this.logger.error('未找到超级管理员角色，请确保角色初始化已完成');
          return;
        }

        const roleIds = [role.id];

        await this.userService.create({
          ...userCreateData,
          roleIds,
        });

        this.logger.log(`✅ 超级管理员账户创建成功: ${superAdminData.username}`);
        this.logger.warn('🔐 请及时修改超级管理员密码！');
      } else {
        this.logger.debug(`超级管理员已存在: ${superAdminData.username}`);
      }
    } catch (error) {
      this.logger.error(`创建超级管理员失败: ${superAdminData.username}`, error);
      throw error;
    }
  }
}