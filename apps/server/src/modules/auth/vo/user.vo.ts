import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleVo } from './role.vo';
import { DateTransformUtil } from '@/core/utils';

/**
 * 用户 VO - 用于响应数据
 * 排除敏感字段，格式化输出
 */
export class UserVo {
  @ApiProperty({ description: '用户ID', example: 'uuid-string' })
  @Expose()
  id: string;

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

  @ApiPropertyOptional({ description: '用户属性', example: { department: 'IT' } })
  @Expose()
  attributes?: Record<string, any>;

  @ApiPropertyOptional({ description: '用户角色列表', type: [RoleVo] })
  @Expose()
  @Type(() => RoleVo)
  roles?: RoleVo[];

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  @Expose()
  @Transform(({ value }) => DateTransformUtil.toLocaleDateString(value))
  createdAt: string;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  @Expose()
  @Transform(({ value }) => DateTransformUtil.toLocaleDateString(value))
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
}

/**
 * 简化用户 VO - 用于列表显示或关联对象
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
}
