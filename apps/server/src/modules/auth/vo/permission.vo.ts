import { Expose, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DateTransformUtil } from '@/core/utils';

/**
 * 权限 VO
 */
export class PermissionVo {
  @ApiProperty({ description: '权限ID', example: 'uuid-string' })
  @Expose()
  id: string;

  @ApiProperty({ description: '操作类型', example: 'read' })
  @Expose()
  action: string;

  @ApiProperty({ description: '资源类型', example: 'user' })
  @Expose()
  subject: string;

  @ApiPropertyOptional({ 
    description: '条件限制', 
    example: { department: 'IT', level: { $gte: 3 } } 
  })
  @Expose()
  conditions?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: '字段限制', 
    example: 'name,email,phone' 
  })
  @Expose()
  fields?: string;

  @ApiProperty({ description: '是否为禁止权限', example: false })
  @Expose()
  inverted: boolean;

  @ApiPropertyOptional({ description: '权限说明', example: '用户读取权限' })
  @Expose()
  reason?: string;

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
 * 简化权限 VO - 用于列表显示或关联对象
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
