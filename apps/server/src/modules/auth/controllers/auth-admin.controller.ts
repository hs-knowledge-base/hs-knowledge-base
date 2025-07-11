import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard, Public } from '../guards/jwt-auth.guard';
import { User } from '../../user/entities/user.entity';

@ApiTags('admin', '认证管理')
@Controller('admin/auth')
export class AuthAdminController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ 
    status: 200, 
    description: '登录成功',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          description: '用户信息（不包含密码）'
        },
        accessToken: {
          type: 'string',
          description: '访问令牌'
        },
        refreshToken: {
          type: 'string',
          description: '刷新令牌'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  async login(@Request() req: { user: User }, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ 
    status: 201, 
    description: '注册成功',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          description: '用户信息（不包含密码）'
        },
        accessToken: {
          type: 'string',
          description: '访问令牌'
        },
        refreshToken: {
          type: 'string',
          description: '刷新令牌'
        }
      }
    }
  })
  @ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiResponse({ 
    status: 200, 
    description: '刷新成功',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: '新的访问令牌'
        },
        refreshToken: {
          type: 'string',
          description: '新的刷新令牌'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: '刷新令牌无效' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '用户登出' })
  @ApiResponse({ status: 200, description: '登出成功' })
  async logout(@Request() req: { user: User }) {
    await this.authService.logout(req.user.id);
    return { message: '登出成功' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '获取用户信息成功' })
  async getProfile(@Request() req: { user: User }) {
    const { password, ...userWithoutPassword } = req.user;
    return userWithoutPassword;
  }

  @UseGuards(JwtAuthGuard)
  @Get('check')
  @ApiBearerAuth()
  @ApiOperation({ summary: '检查令牌有效性' })
  @ApiResponse({ status: 200, description: '令牌有效' })
  @ApiResponse({ status: 401, description: '令牌无效' })
  async checkToken(@Request() req: { user: User }) {
    return {
      valid: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        isActive: req.user.isActive,
      },
    };
  }
}
