import { IsEmail, IsString, IsOptional, IsBoolean, MinLength, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'admin' })
  @IsString()
  username: string;

  @ApiProperty({ description: '邮箱', example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ description: '是否激活', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: '名字', example: '张' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: '姓氏', example: '三' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: '角色ID列表', example: [1, 2] })
  @IsOptional()
  @IsNumber({}, { each: true })
  roleIds?: number[];

  @ApiPropertyOptional({ description: '用户属性', example: { level: 3, clearance: 'high' } })
  @IsOptional()
  attributes?: Record<string, any>;
}
