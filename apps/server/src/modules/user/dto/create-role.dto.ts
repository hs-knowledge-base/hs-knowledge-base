import { IsString, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称', example: 'admin' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '角色描述', example: '系统管理员' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '角色级别', example: 3 })
  @IsOptional()
  @IsNumber()
  level?: number;

  @ApiPropertyOptional({ description: '是否启用', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: '父角色ID', example: 1 })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiPropertyOptional({ description: '权限ID列表', example: [1, 2, 3] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds?: number[];

  @ApiPropertyOptional({ description: '角色属性', example: { department: 'IT' } })
  @IsOptional()
  attributes?: Record<string, any>;
}
