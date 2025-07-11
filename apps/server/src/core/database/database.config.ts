import { NodeEnv } from '@/enum/node-env.enum';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class DatabaseConfig {
  constructor(private configService: ConfigService) {}

  private readonly DEFAULT_POOL_SIZE = 10;
  private readonly DEFAULT_RETRY_ATTEMPTS = 3;
  private readonly DEFAULT_RETRY_DELAY = 3000;

  get isDevelopment(): boolean {
    return this.configService.get('NODE_ENV') === NodeEnv.Development;
  }

  get config(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.configService.get('DB_HOST'),
      port: this.configService.get('DB_PORT'),
      username: this.configService.get('DB_USERNAME'),
      password: this.configService.get('DB_PASSWORD'),
      database: this.configService.get('DB_DATABASE'),
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: this.configService.get('DB_SYNC') === 'true',
      logging: this.isDevelopment ? ['error', 'warn'] : ['error', 'warn'],
      poolSize: this.configService.get('DB_POOL_SIZE', this.DEFAULT_POOL_SIZE),
      retryAttempts: this.configService.get('DB_RETRY_ATTEMPTS', this.DEFAULT_RETRY_ATTEMPTS),
      retryDelay: this.configService.get('DB_RETRY_DELAY', this.DEFAULT_RETRY_DELAY),
      extra: {
        connectionTimeout: 60000,
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci'
      },
    };
  }
}
