import { IsString, IsOptional, IsBoolean, Length, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Action, Subject } from '../entities/permission.entity';

export class CreatePermissionDto {
  @ApiProperty({
    description: '操作类型',
    example: Action.READ,
    enum: Action
  })
  @IsString()
  @Length(1, 50)
  action: string;

  @ApiProperty({
    description: '资源类型',
    example: Subject.USER,
    enum: Subject
  })
  @IsString()
  @Length(1, 50)
  subject: string;

  @ApiPropertyOptional({
    description: '条件限制 - ABAC 核心功能',
    example: { department: 'IT', level: { $gte: 3 } }
  })
  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;

  @ApiPropertyOptional({ description: '字段限制', example: 'name,email' })
  @IsOptional()
  @IsString()
  fields?: string;

  @ApiPropertyOptional({ description: '是否为禁止权限', example: false })
  @IsOptional()
  @IsBoolean()
  inverted?: boolean;

  @ApiPropertyOptional({ description: '权限说明', example: '允许读取同部门用户信息' })
  @IsOptional()
  @IsString()
  reason?: string;
}
