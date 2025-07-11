import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称', example: 'admin' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '角色描述', example: '系统管理员' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '权限ID列表', example: ['permission-uuid-1', 'permission-uuid-2'] })
  @IsOptional()
  @IsString({ each: true })
  permissionIds?: string[];

  @ApiPropertyOptional({ description: '角色属性', example: { level: 'high', department: 'IT' } })
  @IsOptional()
  attributes?: Record<string, any>;
}
