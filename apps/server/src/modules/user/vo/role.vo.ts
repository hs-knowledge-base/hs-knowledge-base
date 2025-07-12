import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SimpleUserVo } from './user.vo';
import { DateTransformUtil } from '@/core/utils';

/**
 * 权限简化 VO - 用于角色中显示权限信息
 */
export class SimplePermissionVo {
  @ApiProperty({ description: '权限ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: '操作类型' })
  @Expose()
  action: string;

  @ApiProperty({ description: '资源类型' })
  @Expose()
  subject: string;

  @ApiPropertyOptional({ description: '权限说明' })
  @Expose()
  reason?: string;

  @ApiPropertyOptional({ description: '权限显示名称' })
  @Expose()
  @Transform(({ obj }) => {
    const actionMap: Record<string, string> = {
      'create': '创建',
      'read': '读取',
      'update': '更新',
      'delete': '删除',
      'manage': '管理'
    };
    
    const subjectMap: Record<string, string> = {
      'user': '用户',
      'role': '角色',
      'permission': '权限',
      'document': '文档',
      'knowledge_base': '知识库',
      'all': '全部'
    };

    const actionText = actionMap[obj.action] || obj.action;
    const subjectText = subjectMap[obj.subject] || obj.subject;
    
    return `${actionText}${subjectText}`;
  })
  displayName?: string;
}

/**
 * 角色 VO - User 模块专用
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

  @ApiPropertyOptional({ description: '角色属性', example: { level: 'high', department: 'IT' } })
  @Expose()
  attributes?: Record<string, any>;

  @ApiPropertyOptional({ description: '权限列表', type: [SimplePermissionVo] })
  @Expose()
  @Type(() => SimplePermissionVo)
  permissions?: SimplePermissionVo[];

  @ApiPropertyOptional({ description: '用户列表', type: [SimpleUserVo] })
  @Expose()
  @Type(() => SimpleUserVo)
  users?: SimpleUserVo[];

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  @Expose()
  @Transform(({ value }) => DateTransformUtil.toISOString(value))
  createdAt: string;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  @Expose()
  @Transform(({ value }) => DateTransformUtil.toISOString(value))
  updatedAt: string;

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
  @ApiPropertyOptional({ description: '角色拥有的权限分组' })
  @Expose()
  @Transform(({ obj }) => {
    if (!obj.permissions) return {};
    
    const grouped: Record<string, string[]> = {};
    obj.permissions.forEach((permission: any) => {
      const subject = permission.subject;
      if (!grouped[subject]) {
        grouped[subject] = [];
      }
      grouped[subject].push(permission.action);
    });
    
    return grouped;
  })
  permissionsBySubject?: Record<string, string[]>;
}
