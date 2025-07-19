import { IsString, IsOptional, IsEnum, Length, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PermissionType } from '../entities/permission.entity';

export class CreatePermissionDto {
  @ApiProperty({
    description: '权限编码',
    example: 'system.user.view'
  })
  @IsString()
  @Length(1, 100)
  code: string;

  @ApiProperty({
    description: '权限名称',
    example: '查看用户'
  })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({
    description: '权限类型',
    example: PermissionType.BUTTON,
    enum: PermissionType
  })
  @IsEnum(PermissionType)
  type: PermissionType;

  @ApiPropertyOptional({ 
    description: '权限描述',
    example: '允许查看用户详细信息'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ 
    description: '前端路由路径',
    example: '/system/user'
  })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ 
    description: '图标',
    example: 'user-o'
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ 
    description: '排序值',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  sort?: number;

  @ApiPropertyOptional({ 
    description: '父权限ID'
  })
  @IsOptional()
  @IsNumber()
  parentId?: number;
}
