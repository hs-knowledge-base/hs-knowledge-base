import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PermissionVo } from './permission.vo';
import { DateTransformUtil } from '@/core/utils';

/**
 * 角色 VO - 用于响应数据
 */
export class RoleVo {
  @ApiProperty({ description: '角色ID', example: 'uuid-string' })
  @Expose()
  id: string;

  @ApiProperty({ description: '角色名称', example: 'admin' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ description: '角色描述', example: '系统管理员' })
  @Expose()
  description?: string;

  @ApiPropertyOptional({ description: '角色属性', example: { level: 'high' } })
  @Expose()
  attributes?: Record<string, any>;

  @ApiPropertyOptional({ description: '权限列表', type: [PermissionVo] })
  @Expose()
  @Type(() => PermissionVo)
  permissions?: PermissionVo[];

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  @Expose()
  @Transform(({ value }) => DateTransformUtil.toISOString(value))
  createdAt: string;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  @Expose()
  @Transform(({ value }) => DateTransformUtil.toISOString(value))
  updatedAt: string;
}

/**
 * 简化角色 VO - 用于列表显示或关联对象
 */
export class SimpleRoleVo {
  @ApiProperty({ description: '角色ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: '角色名称' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ description: '角色描述' })
  @Expose()
  description?: string;
}
