import { IsEnum, IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Action, Subject } from '../entities/permission.entity';

export class CreatePermissionDto {
  @ApiProperty({ description: '操作类型', enum: Action, example: Action.READ })
  @IsEnum(Action)
  action: Action;

  @ApiProperty({ description: '资源类型', enum: Subject, example: Subject.USER })
  @IsEnum(Subject)
  subject: Subject;

  @ApiPropertyOptional({ 
    description: '条件限制', 
    example: { department: 'IT', level: { $gte: 3 } } 
  })
  @IsOptional()
  conditions?: Record<string, any>;

  @ApiPropertyOptional({ description: '字段限制', example: 'name,email' })
  @IsOptional()
  @IsString()
  fields?: string;

  @ApiPropertyOptional({ description: '是否为禁止权限', example: false })
  @IsOptional()
  @IsBoolean()
  inverted?: boolean;

  @ApiPropertyOptional({ description: '权限说明', example: '允许读取同部门用户信息' })
  @IsOptional()
  @IsString()
  reason?: string;
}
