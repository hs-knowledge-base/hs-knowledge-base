import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../../user/entities/user.entity';
import { UserRepository } from '../../user/repositories/user.repository';
import { RoleRepository } from '../../user/repositories/role.repository';
import { JwtConfig } from '../config/jwt.config';
import { JwtPayload } from '../strategies/jwt.strategy';

export interface LoginResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  position?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly jwtService: JwtService,
    private readonly jwtConfig: JwtConfig,
  ) {}

  async validateUser(usernameOrEmail: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByUsernameOrEmail(usernameOrEmail);
    
    if (!user) {
      return null;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('用户已被禁用');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(user: User): Promise<LoginResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    // 移除密码字段
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    const { username, email, password, ...userData } = registerDto;

    // 检查用户名是否已存在
    const existingUserByUsername = await this.userRepository.existsByUsername(username);
    if (existingUserByUsername) {
      throw new ConflictException('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = await this.userRepository.existsByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictException('邮箱已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      ...userData,
    });

    // 为新用户分配默认角色（如果存在）
    const defaultRole = await this.roleRepository.findByName('user');
    if (defaultRole) {
      user.roles = [defaultRole];
      await this.userRepository.update(user.id, { roles: [defaultRole] });
    }

    // 重新获取用户信息（包含角色和权限）
    const userWithRoles = await this.userRepository.findWithRolesAndPermissions(user.id);
    
    if (!userWithRoles) {
      throw new BadRequestException('用户创建失败');
    }

    return this.login(userWithRoles);
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.jwtConfig.refreshTokenSecret,
        issuer: this.jwtConfig.issuer,
        audience: this.jwtConfig.audience,
      });

      // 验证用户是否仍然存在且激活
      const user = await this.userRepository.findWithRolesAndPermissions(payload.sub);
      
      if (!user || !user.isActive) {
        throw new UnauthorizedException('用户不存在或已被禁用');
      }

      const newPayload: JwtPayload = {
        sub: user.id,
        username: user.username,
        email: user.email,
      };

      const [newAccessToken, newRefreshToken] = await Promise.all([
        this.generateAccessToken(newPayload),
        this.generateRefreshToken(newPayload),
      ]);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('刷新令牌无效');
    }
  }

  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.accessTokenSecret,
      expiresIn: this.jwtConfig.accessTokenExpiresIn,
      issuer: this.jwtConfig.issuer,
      audience: this.jwtConfig.audience,
    });
  }

  private async generateRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.refreshTokenSecret,
      expiresIn: this.jwtConfig.refreshTokenExpiresIn,
      issuer: this.jwtConfig.issuer,
      audience: this.jwtConfig.audience,
    });
  }

  async logout(userId: number): Promise<void> {
    // TODO 令牌黑名单
  }
}
