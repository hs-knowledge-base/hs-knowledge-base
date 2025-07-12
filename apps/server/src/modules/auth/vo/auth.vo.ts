import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserVo } from './user.vo';

/**
 * 登录响应 VO
 */
export class LoginResponseVo {
  @ApiProperty({ description: '用户信息', type: UserVo })
  @Expose()
  @Type(() => UserVo)
  user: UserVo;

  @ApiProperty({ description: '访问令牌', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @Expose()
  accessToken: string;

  @ApiProperty({ description: '刷新令牌', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @Expose()
  refreshToken: string;
}

/**
 * 注册响应 VO
 */
export class RegisterResponseVo {
  @ApiProperty({ description: '用户信息', type: UserVo })
  @Expose()
  @Type(() => UserVo)
  user: UserVo;

  @ApiProperty({ description: '访问令牌', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @Expose()
  accessToken: string;

  @ApiProperty({ description: '刷新令牌', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @Expose()
  refreshToken: string;
}

/**
 * 刷新令牌响应 VO
 */
export class RefreshTokenResponseVo {
  @ApiProperty({ description: '新的访问令牌', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @Expose()
  accessToken: string;

  @ApiProperty({ description: '新的刷新令牌', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @Expose()
  refreshToken: string;
}

/**
 * 令牌检查响应 VO
 */
export class TokenCheckResponseVo {
  @ApiProperty({ description: '令牌是否有效', example: true })
  @Expose()
  valid: boolean;

  @ApiProperty({ description: '用户基本信息', type: UserVo })
  @Expose()
  @Type(() => UserVo)
  user: UserVo;
}
