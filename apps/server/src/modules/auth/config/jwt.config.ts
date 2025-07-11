import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtConfig {
  constructor(private readonly configService: ConfigService) {}

  get accessTokenSecret(): string {
    return this.configService.get<string>('JWT_SECRET') || 'your_jwt_secret_key';
  }

  get refreshTokenSecret(): string {
    return this.configService.get<string>('JWT_REFRESH_SECRET') || 'your_refresh_secret';
  }

  get accessTokenExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN') || '5d';
  }

  get refreshTokenExpiresIn(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ||
           this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
  }

  get issuer(): string {
    return this.configService.get<string>('JWT_ISSUER') || 'volcano-knowledge-base';
  }

  get audience(): string {
    return this.configService.get<string>('JWT_AUDIENCE') || 'volcano-users';
  }
}
