import { Module } from '@nestjs/common';
import { BootstrapService } from './bootstrap.service';
import { DataInitializerService } from './data-initializer.service';
import { AppConfig } from '@/core/config/app.config';
import { LoggerModule } from '@/core/logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [LoggerModule, ConfigModule, AuthModule, UserModule],
  providers: [BootstrapService, DataInitializerService, AppConfig],
  exports: [BootstrapService, DataInitializerService],
})
export class BootstrapModule {}
