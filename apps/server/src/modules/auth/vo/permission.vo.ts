import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { DateTransformUtil } from '@/core/utils/date-transform.util';

/**
 * 权限信息 VO
 */
export class PermissionVo {
  @ApiProperty({ description: '权限ID' })
  @Expose()
  id: number;

  @ApiProperty({ description: '权限编码', example: 'system.user.view' })
  @Expose()
  code: string;

  @ApiProperty({ description: '权限名称', example: '查看用户' })
  @Expose()
  name: string;

  @ApiProperty({ description: '权限类型', example: 'BUTTON' })
  @Expose()
  type: string;

  @ApiPropertyOptional({ description: '路径', example: '/system/user' })
  @Expose()
  path?: string;

  @ApiPropertyOptional({ description: '图标', example: 'user-o' })
  @Expose()
  icon?: string;

  @ApiProperty({ description: '排序值', example: 1 })
  @Expose()
  sort: number;

  @ApiPropertyOptional({ description: '父权限ID' })
  @Expose()
  parentId?: number;

  @ApiPropertyOptional({ description: '子权限列表', type: [PermissionVo] })
  @Expose()
  @Type(() => PermissionVo)
  children?: PermissionVo[];

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  @Expose()
  @Transform(({ value }) => DateTransformUtil.toISOString(value))
  createdAt: string;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  @Expose()
  @Transform(({ value }) => DateTransformUtil.toISOString(value))
  updatedAt: string;

  @ApiPropertyOptional({ description: '权限显示名称' })
  @Expose()
  @Transform(({ obj }) => {
    return obj.name || obj.code;
  })
  displayName?: string;
}

/**
 * 权限简化信息 VO - 用于在角色等地方显示
 */
export class PermissionSimpleVo {
  @ApiProperty({ description: '权限ID' })
  @Expose()
  id: number;

  @ApiProperty({ description: '权限编码' })
  @Expose()
  code: string;

  @ApiProperty({ description: '权限名称' })
  @Expose()
  name: string;

  @ApiProperty({ description: '权限类型' })
  @Expose()
  type: string;

  @ApiPropertyOptional({ description: '权限显示名称' })
  @Expose()
  @Transform(({ obj }) => {
    return obj.name || obj.code;
  })
  displayName?: string;
}
