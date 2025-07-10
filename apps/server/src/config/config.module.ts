import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`],
      cache: true,
      expandVariables: true
    })
  ],
  providers: [],
  exports: []
})
export class NestConfigModule {
}
