import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BootstrapModule } from './bootstrap/bootstrap.module';
import { BootstrapService } from './bootstrap/bootstrap.service';
import { AppConfig } from './config/app.config';
import { LoggerModule } from './logger/logger.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      cache: true,
      expandVariables: true,
    }),
    LoggerModule,
    BootstrapModule,
  ],
  providers: [AppConfig, BootstrapService],
  exports: [AppConfig, BootstrapService, LoggerModule, BootstrapModule],
})
export class CoreModule {}
