import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: '用户名', example: 'newuser' })
  @IsString()
  username: string;

  @ApiProperty({ description: '邮箱', example: 'newuser@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ description: '名字', example: '张' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: '姓氏', example: '三' })
  @IsOptional()
  @IsString()
  lastName?: string;
}
