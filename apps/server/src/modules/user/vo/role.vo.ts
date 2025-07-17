import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SimpleUserVo } from './user.vo';
import { DateTransformUtil } from '@/core/utils';

/**
 * 权限摘要信息
 */
export class PermissionSummaryVo {
  @ApiProperty({ description: '权限ID' })
  @Expose()
  id: string;

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

/**
 * 角色 VO - User 模块专用
 * 用于用户管理中的角色信息展示
 */
export class RoleVo {
  @ApiProperty({ description: '角色ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: '角色名称', example: 'admin' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ description: '角色描述', example: '管理员角色' })
  @Expose()
  description?: string;

  @ApiProperty({ description: '角色层级', example: 3 })
  @Expose()
  level: number;

  @ApiProperty({ description: '是否启用', example: true })
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional({ description: '父角色ID', example: 2 })
  @Expose()
  @Transform(({ obj }) => obj.parent?.id || null)
  parentId?: number;

  @ApiPropertyOptional({ description: '父角色名称', example: 'super_admin' })
  @Expose()
  @Transform(({ obj }) => obj.parent?.name || null)
  parentName?: string;

  @ApiPropertyOptional({ description: '继承的角色ID列表', example: [1, 2] })
  @Expose()
  inheritedRoleIds?: number[];

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
 * 简化角色 VO - 用于列表显示
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

  @ApiProperty({ description: '创建时间（本地格式）', example: '2024/1/1' })
  @Expose()
  @Transform(({ value }) => DateTransformUtil.toLocaleDateString(value))
  createdAtLocal: string;

  @ApiPropertyOptional({ description: '权限数量' })
  @Expose()
  @Transform(({ obj }) => obj.permissions?.length || 0)
  permissionCount?: number;

  @ApiPropertyOptional({ description: '用户数量' })
  @Expose()
  @Transform(({ obj }) => obj.users?.length || 0)
  userCount?: number;
}

/**
 * 角色详情 VO - 包含完整的权限和用户信息
 */
export class RoleDetailVo extends RoleVo {
  @ApiPropertyOptional({ description: '角色拥有的权限按类型分组' })
  @Expose()
  @Transform(({ obj }) => {
    if (!obj.permissions) return {};
    
    const grouped: Record<string, string[]> = {};
    obj.permissions.forEach((permission: any) => {
      const type = permission.type;
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(permission.code);
    });
    
    return grouped;
  })
  permissionsByType?: Record<string, string[]>;
}
