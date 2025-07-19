import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { generateSwaggerDocument } from '@/config/swagger';
import { BootstrapService } from '@/core/bootstrap/bootstrap.service';
import { LoggerService } from '@/core/logger/logger.service';
import { TransformInterceptor, GlobalExceptionFilter } from "@/core";

async function bootstrap() {
  const logger = new LoggerService().setContext('main');

  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const bootstrapService = app.get(BootstrapService);

    /**配置静态资源目录*/
    app.useStaticAssets(join(__dirname, '..', 'public'), {
      prefix: '/static/',
    });

    /*全局拦截器，统一响应*/
    app.useGlobalInterceptors(new TransformInterceptor());

    /*全局异常过滤器，统一异常处理*/
    app.useGlobalFilters(new GlobalExceptionFilter());

    await bootstrapService.setup(app);

    await bootstrapService.initializeData(app);

    generateSwaggerDocument(app);

    await bootstrapService.start(app);

    logger.log('应用启动完成!');
  } catch (error) {
    logger.error(`应用启动失败: ${error.message}`, error.stack);
    process.exit(1);
  }
}

bootstrap().catch(err => {
  console.error('无法启动应用:', err);
  process.exit(1);
});
