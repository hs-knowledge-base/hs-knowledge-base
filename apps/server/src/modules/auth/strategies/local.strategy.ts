import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'usernameOrEmail', // 支持用户名或邮箱登录
      passwordField: 'password',
    });
  }

  async validate(usernameOrEmail: string, password: string) {
    const user = await this.authService.validateUser(usernameOrEmail, password);
    
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    return user;
  }
}
