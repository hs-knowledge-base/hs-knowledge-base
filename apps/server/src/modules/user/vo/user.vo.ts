import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleVo } from './role.vo';
import { DateTransformUtil } from '@/core/utils';

/**
 * 用户 VO - User 模块专用
 * 包含完整的用户信息，用于用户管理
 */
export class UserVo {
  @ApiProperty({ description: '用户ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: '用户名', example: 'john_doe' })
  @Expose()
  username: string;

  @ApiProperty({ description: '邮箱', example: 'john@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ description: '是否激活', example: true })
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional({ description: '名字', example: '张' })
  @Expose()
  firstName?: string;

  @ApiPropertyOptional({ description: '姓氏', example: '三' })
  @Expose()
  lastName?: string;

  @ApiPropertyOptional({ description: '用户属性', example: { department: 'IT', level: 3 } })
  @Expose()
  attributes?: Record<string, any>;

  @ApiPropertyOptional({ description: '用户角色列表', type: [RoleVo] })
  @Expose()
  @Type(() => RoleVo)
  roles?: RoleVo[];

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  @Expose()
  @Transform(({ value }) => DateTransformUtil.toISOString(value))
  createdAt: string;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  @Expose()
  @Transform(({ value }) => DateTransformUtil.toISOString(value))
  updatedAt: string;

  @ApiPropertyOptional({ description: '全名', example: '张三' })
  @Expose()
  @Transform(({ obj }) => {
    if (obj.firstName && obj.lastName) {
      return `${obj.firstName}${obj.lastName}`;
    }
    return obj.firstName || obj.lastName || null;
  })
  fullName?: string;

  @ApiPropertyOptional({ description: '创建时间（本地格式）', example: '2024/1/1' })
  @Expose()
  @Transform(({ value }) => DateTransformUtil.toLocaleDateString(value))
  createdAtLocal?: string;

  @ApiPropertyOptional({ description: '角色数量' })
  @Expose()
  @Transform(({ obj }) => obj.roles?.length || 0)
  roleCount?: number;
}

/**
 * 简化用户 VO - 用于列表显示
 */
export class SimpleUserVo {
  @ApiProperty({ description: '用户ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: '用户名' })
  @Expose()
  username: string;

  @ApiProperty({ description: '邮箱' })
  @Expose()
  email: string;

  @ApiProperty({ description: '是否激活' })
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional({ description: '全名' })
  @Expose()
  @Transform(({ obj }) => {
    if (obj.firstName && obj.lastName) {
      return `${obj.firstName}${obj.lastName}`;
    }
    return obj.firstName || obj.lastName || null;
  })
  fullName?: string;

  @ApiProperty({ description: '创建时间（本地格式）', example: '2024/1/1' })
  @Expose()
  @Transform(({ value }) => DateTransformUtil.toLocaleDateString(value))
  createdAtLocal: string;

  @ApiPropertyOptional({ description: '角色数量' })
  @Expose()
  @Transform(({ obj }) => obj.roles?.length || 0)
  roleCount?: number;
}

/**
 * 用户详情 VO - 包含角色和权限信息
 */
export class UserDetailVo extends UserVo {
  @ApiPropertyOptional({ description: '用户拥有的所有权限（通过角色）' })
  @Expose()
  @Transform(({ obj }) => {
    if (!obj.roles) return [];
    const permissions = new Set();
    obj.roles.forEach((role: any) => {
      if (role.permissions) {
        role.permissions.forEach((permission: any) => {
          permissions.add(permission.code);
        });
      }
    });
    return Array.from(permissions);
  })
  allPermissions?: string[];
}
