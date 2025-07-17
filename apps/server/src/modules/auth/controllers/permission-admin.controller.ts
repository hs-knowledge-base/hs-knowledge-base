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
import { RbacPermissionsGuard } from '../guards/rbac-permissions.guard';
import { RbacAbilityFactory } from '../casl/rbac-ability.factory';
import { RequirePermission, VoTransform } from '@/core/decorators';
import { PermissionVo } from '../vo';

@ApiTags('admin', '权限管理')
@Controller('admin/permissions')
@UseGuards(RbacPermissionsGuard)
export class PermissionAdminController {
  constructor(
    private readonly permissionService: PermissionService,
    private readonly rbacAbilityFactory: RbacAbilityFactory,
  ) {}

  @Post()
  @ApiOperation({ summary: '创建权限' })
  @ApiResponse({ status: 201, description: '权限创建成功', type: PermissionVo })
  @RequirePermission('system.permission.edit')
  @VoTransform({ voClass: PermissionVo })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有权限' })
  @ApiResponse({ status: 200, description: '获取权限列表成功', type: [PermissionVo] })
  @RequirePermission('system.permission.view')
  @VoTransform({ voClass: PermissionVo })
  findAll() {
    return this.permissionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取权限' })
  @ApiResponse({ status: 200, description: '获取权限成功', type: PermissionVo })
  @RequirePermission('system.permission.view')
  @VoTransform({ voClass: PermissionVo })
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新权限' })
  @ApiResponse({ status: 200, description: '权限更新成功', type: PermissionVo })
  @RequirePermission('system.permission.edit')
  @VoTransform({ voClass: PermissionVo })
  update(@Param('id') id: string, @Body() updatePermissionDto: Partial<CreatePermissionDto>) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除权限' })
  @ApiResponse({ status: 200, description: '权限删除成功' })
  @RequirePermission('system.permission.edit')
  remove(@Param('id') id: string) {
    return this.permissionService.remove(id);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取权限树' })
  @ApiResponse({ status: 200, description: '获取权限树成功' })
  @RequirePermission('system.permission.view')
  getPermissionTree() {
    return this.permissionService.getPermissionTree();
  }
}
