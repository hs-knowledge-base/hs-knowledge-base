import {INestApplication, Injectable} from '@nestjs/common';
import {AppConfig} from '../config/app.config';
import {LoggerService} from '../logger/logger.service';
import { getDocumentInfo } from '@/config/swagger';

/**
 * 应用启动服务
 * 负责配置和启动 NestJS 应用
 */
@Injectable()
export class BootstrapService {
  constructor(
    private readonly appConfig: AppConfig,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('Bootstrap');
  }

  /**
   * 配置应用
   * @param app NestJS 应用实例
   */
  async setup(app: INestApplication) {
    // 配置全局前缀
    app.setGlobalPrefix(this.appConfig.apiPrefix);

    // 配置跨域
    if (this.appConfig.enableCors) {
      app.enableCors({
        origin: this.appConfig.corsOrigin,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
      });
    }

    this.logger.log('应用配置完成');
  }

  /**
   * 初始化应用数据
   * @param app NestJS 应用实例
   */
  async initializeData(app: INestApplication) {
    try {
      this.logger.log('应用数据初始化完成');
    } catch (error) {
      this.logger.error('应用数据初始化失败', error.stack);
    }
  }

  /**
   * 启动应用
   * @param app NestJS 应用实例
   */
  async start(app: INestApplication) {
    const port = this.appConfig.port;
    await app.listen(port);

    const baseUrl = `http://localhost:${port}`;
    const documentInfo = getDocumentInfo(baseUrl);

    this.logger.log(`应用已启动: ${baseUrl}`);

    Object.values(documentInfo).forEach(doc => {
      this.logger.log(`${doc.title}: ${doc.url}`);
    });
  }
}
