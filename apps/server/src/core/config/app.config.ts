import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * 应用基础配置服务
 * 负责从环境变量中读取应用基础配置
 */
@Injectable()
export class AppConfig {
  public readonly port: number;
  public readonly enableCors: boolean;
  public readonly corsOrigin: string | string[];
  public readonly apiPrefix: string;

  constructor(private configService: ConfigService) {
    this.port = this.configService.get<number>('PORT', 3001);
    this.enableCors = this.configService.get<boolean>('ENABLE_CORS', true);
    this.corsOrigin = this.configService.get<string>('CORS_ORIGINS', '*').split(',');
    this.apiPrefix = this.configService.get<string>('API_PREFIX', 'api');
  }

  /**
   * 应用名称
   */
  get appName(): string {
    return this.configService.get<string>('APP_NAME') || 'hs blog';
  }

  /**
   * 应用环境
   */
  get environment(): string {
    return this.configService.get<string>('NODE_ENV') || 'development';
  }
}
