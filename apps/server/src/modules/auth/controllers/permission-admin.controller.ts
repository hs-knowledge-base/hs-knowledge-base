import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PermissionService } from '../services/permission.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { RbacPermissionsGuard } from '../guards/rbac-permissions.guard';

import { RequirePermission, VoTransform } from '@/core/decorators';
import { PermissionVo } from '../vo';

@ApiTags('admin', '权限管理')
@Controller('admin/permissions')
@UseGuards(RbacPermissionsGuard)
export class PermissionAdminController {
  constructor(
    private readonly permissionService: PermissionService,
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
  @ApiOperation({ summary: '获取权限列表（支持分页和查询）' })
  @ApiResponse({ status: 200, description: '获取权限列表成功' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键词' })
  @ApiQuery({ name: 'type', required: false, description: '权限类型' })
  @ApiQuery({ name: 'parentId', required: false, description: '父权限ID' })
  @RequirePermission('system.permission.view')
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('parentId') parentId?: number,
  ) {
    const queryParams = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      type,
      parentId: parentId ? Number(parentId) : undefined,
    };
    return this.permissionService.findAllWithQuery(queryParams);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取权限树' })
  @ApiResponse({ status: 200, description: '获取权限树成功' })
  @RequirePermission('system.permission.view')
  getPermissionTree() {
    return this.permissionService.getPermissionTree();
  }

  @Get('by-type')
  @ApiOperation({ summary: '根据类型获取权限' })
  @ApiResponse({ status: 200, description: '获取权限成功', type: [PermissionVo] })
  @ApiQuery({ name: 'type', required: true, description: '权限类型' })
  @RequirePermission('system.permission.view')
  @VoTransform({ voClass: PermissionVo })
  findByType(@Query('type') type: string) {
    return this.permissionService.findByType(type);
  }

  @Get('detail')
  @ApiOperation({ summary: '根据ID获取权限详情' })
  @ApiResponse({ status: 200, description: '获取权限成功', type: PermissionVo })
  @ApiQuery({ name: 'id', required: true, description: '权限ID' })
  @RequirePermission('system.permission.view')
  @VoTransform({ voClass: PermissionVo })
  findOne(@Query('id', ParseIntPipe) id: number) {
    return this.permissionService.findOne(id);
  }

  @Post('update')
  @ApiOperation({ summary: '更新权限' })
  @ApiResponse({ status: 200, description: '权限更新成功', type: PermissionVo })
  @RequirePermission('system.permission.edit')
  @VoTransform({ voClass: PermissionVo })
  update(@Body() updateDto: { id: number } & Partial<CreatePermissionDto>) {
    const { id, ...updateData } = updateDto;
    return this.permissionService.update(id, updateData);
  }

  @Post('toggle-status')
  @ApiOperation({ summary: '切换权限状态' })
  @ApiResponse({ status: 200, description: '权限状态更新成功', type: PermissionVo })
  @RequirePermission('system.permission.edit')
  @VoTransform({ voClass: PermissionVo })
  toggleStatus(@Body() statusDto: { id: number; isActive: boolean }) {
    return this.permissionService.toggleStatus(statusDto.id, statusDto.isActive);
  }

  @Post('delete')
  @ApiOperation({ summary: '删除权限' })
  @ApiResponse({ status: 200, description: '权限删除成功' })
  @RequirePermission('system.permission.edit')
  remove(@Body() deleteDto: { id: number }) {
    return this.permissionService.remove(deleteDto.id);
  }

  // 保留原有的动态URL接口（用于兼容性）
  @Get(':id')
  @ApiOperation({ summary: '根据ID获取权限' })
  @ApiResponse({ status: 200, description: '获取权限成功', type: PermissionVo })
  @RequirePermission('system.permission.view')
  @VoTransform({ voClass: PermissionVo })
  findOneById(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新权限' })
  @ApiResponse({ status: 200, description: '权限更新成功', type: PermissionVo })
  @RequirePermission('system.permission.edit')
  @VoTransform({ voClass: PermissionVo })
  updateById(@Param('id', ParseIntPipe) id: number, @Body() updatePermissionDto: Partial<CreatePermissionDto>) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除权限' })
  @ApiResponse({ status: 200, description: '权限删除成功' })
  @RequirePermission('system.permission.edit')
  removeById(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.remove(id);
  }
}
