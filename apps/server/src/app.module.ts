import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {BootstrapModule} from "@/core/bootstrap/bootstrap.module";
import {NestConfigModule} from "@/config/config.module";

@Module({
  imports: [NestConfigModule, BootstrapModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
