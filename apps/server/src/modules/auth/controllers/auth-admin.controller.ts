import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard, Public } from '../guards/jwt-auth.guard';
import { User } from '../../user/entities/user.entity';
import { VoTransform, CurrentUser } from '@/core/decorators';
import { LoginResponseVo, RegisterResponseVo, RefreshTokenResponseVo, TokenCheckResponseVo } from '../vo';
import {UserVo, UserDetailVo} from "@/modules/user/vo";
import { UserService } from '../../user/services/user.service';

@ApiTags('admin', '认证管理')
@Controller('admin/auth')
export class AuthAdminController {
  constructor(
    private readonly authService: AuthService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    type: LoginResponseVo
  })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  @VoTransform({ voClass: LoginResponseVo })
  async login(@Request() req: { user: User }, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({
    status: 201,
    description: '注册成功',
    type: RegisterResponseVo
  })
  @ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
  @VoTransform({ voClass: RegisterResponseVo })
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
    type: RefreshTokenResponseVo
  })
  @ApiResponse({ status: 401, description: '刷新令牌无效' })
  @VoTransform({ voClass: RefreshTokenResponseVo })
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
  @ApiResponse({ status: 200, description: '获取用户信息成功', type: UserDetailVo })
  @VoTransform({ voClass: UserDetailVo, excludeSensitive: true })
  async getProfile(@CurrentUser() user: User) {
    // 获取完整的用户信息（包含角色和权限）
    return this.userService.findOne(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('check')
  @ApiBearerAuth()
  @ApiOperation({ summary: '检查令牌有效性' })
  @ApiResponse({ status: 200, description: '令牌有效', type: TokenCheckResponseVo })
  @ApiResponse({ status: 401, description: '令牌无效' })
  @VoTransform({ voClass: TokenCheckResponseVo })
  async checkToken(@CurrentUser() user: User) {
    return {
      valid: true,
      user,
    };
  }
}
