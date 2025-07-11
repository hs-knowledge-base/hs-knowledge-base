import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PermissionService } from '../services/permission.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { PoliciesGuard } from '../guards/permissions.guard';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { Action, Subject } from '../entities/permission.entity';
import { RequirePermission } from '@/core/decorators';

@ApiTags('admin', '权限管理')
@Controller('admin/permissions')
@UseGuards(PoliciesGuard)
export class PermissionAdminController {
  constructor(
    private readonly permissionService: PermissionService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @Post()
  @ApiOperation({ summary: '创建权限' })
  @ApiResponse({ status: 201, description: '权限创建成功' })
  @RequirePermission(Action.MANAGE, Subject.PERMISSION)
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有权限' })
  @ApiResponse({ status: 200, description: '获取权限列表成功' })
  @RequirePermission(Action.READ, Subject.PERMISSION)
  findAll() {
    return this.permissionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取权限' })
  @ApiResponse({ status: 200, description: '获取权限成功' })
  @RequirePermission(Action.READ, Subject.PERMISSION)
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新权限' })
  @ApiResponse({ status: 200, description: '权限更新成功' })
  @RequirePermission(Action.MANAGE, Subject.PERMISSION)
  update(@Param('id') id: string, @Body() updatePermissionDto: Partial<CreatePermissionDto>) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除权限' })
  @ApiResponse({ status: 200, description: '权限删除成功' })
  @RequirePermission(Action.MANAGE, Subject.PERMISSION)
  remove(@Param('id') id: string) {
    return this.permissionService.remove(id);
  }

  @Post('check')
  @ApiOperation({ summary: '检查用户权限' })
  @ApiResponse({ status: 200, description: '权限检查完成' })
  @RequirePermission(Action.READ, Subject.PERMISSION)
  async checkPermission(
    @Body() checkData: { userId: string; action: Action; subject: Subject; conditions?: any }
  ) {
    // 这里需要获取用户信息，实际实现中应该从认证中间件获取
    // 暂时返回检查结果的示例
    return {
      allowed: true,
      message: '权限检查功能需要配合认证中间件实现',
    };
  }
}
