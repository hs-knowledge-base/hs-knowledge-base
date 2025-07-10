import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

/**
 * 数据初始化服务
 * 负责在应用启动时初始化必要的数据
 */
@Injectable()
export class DataInitializerService implements OnModuleInit {
  private readonly logger = new Logger(DataInitializerService.name);

  constructor(
  ) {
    this.logger.log('DataInitializerService构造函数被调用');
  }

  /**
   * NestJS生命周期钩子，在模块初始化时自动调用
   */
  async onModuleInit() {
  }


} 