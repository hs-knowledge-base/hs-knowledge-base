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
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { RbacPermissionsGuard } from '../../auth/guards/rbac-permissions.guard';
import { RequirePermission, VoTransform } from '@/core/decorators';
import { RoleVo, SimpleRoleVo, RoleDetailVo } from '../vo';

@ApiTags('admin', '角色管理')
@Controller('admin/roles')
@UseGuards(RbacPermissionsGuard)
export class RoleAdminController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: '创建角色' })
  @ApiResponse({ status: 201, description: '角色创建成功', type: RoleVo })
  @RequirePermission('system.role.add')
  @VoTransform({ voClass: RoleVo })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: '获取角色列表（支持分页和查询）' })
  @ApiResponse({ status: 200, description: '获取角色列表成功' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键词' })
  @ApiQuery({ name: 'isActive', required: false, description: '是否启用' })
  @ApiQuery({ name: 'level', required: false, description: '角色级别' })
  @RequirePermission('system.role.view')
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('isActive') isActive?: boolean,
    @Query('level') level?: number,
  ) {
    const queryParams = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      level: level ? Number(level) : undefined,
    };
    return this.roleService.findAllWithQuery(queryParams);
  }

  @Get('hierarchy')
  @ApiOperation({ summary: '获取角色层次结构树' })
  @ApiResponse({ status: 200, description: '获取角色层次结构成功' })
  @RequirePermission('system.role.view')
  getRoleHierarchy() {
    return this.roleService.getRoleHierarchy();
  }

  @Get('detail')
  @ApiOperation({ summary: '根据ID获取角色详情' })
  @ApiResponse({ status: 200, description: '获取角色成功', type: RoleDetailVo })
  @ApiQuery({ name: 'id', required: true, description: '角色ID' })
  @RequirePermission('system.role.view')
  @VoTransform({ voClass: RoleDetailVo, deep: true })
  findOne(@Query('id', ParseIntPipe) id: number) {
    return this.roleService.findOne(id);
  }

  @Post('update')
  @ApiOperation({ summary: '更新角色' })
  @ApiResponse({ status: 200, description: '角色更新成功', type: RoleVo })
  @RequirePermission('system.role.edit')
  @VoTransform({ voClass: RoleVo })
  update(@Body() updateDto: { id: number } & Partial<CreateRoleDto>) {
    const { id, ...updateData } = updateDto;
    return this.roleService.update(id, updateData);
  }

  @Post('toggle-status')
  @ApiOperation({ summary: '切换角色状态' })
  @ApiResponse({ status: 200, description: '角色状态更新成功', type: RoleVo })
  @RequirePermission('system.role.edit')
  @VoTransform({ voClass: RoleVo })
  toggleStatus(@Body() statusDto: { id: number; isActive: boolean }) {
    return this.roleService.toggleStatus(statusDto.id, statusDto.isActive);
  }

  @Post('delete')
  @ApiOperation({ summary: '删除角色' })
  @ApiResponse({ status: 200, description: '角色删除成功' })
  @RequirePermission('system.role.delete')
  remove(@Body() deleteDto: { id: number }) {
    return this.roleService.remove(deleteDto.id);
  }

  @Post('inheritance')
  @ApiOperation({ summary: '建立角色继承关系' })
  @ApiResponse({ status: 200, description: '角色继承关系建立成功' })
  @RequirePermission('system.role.edit')
  addInheritance(@Body() inheritanceDto: { juniorRoleId: number; seniorRoleId: number }) {
    return this.roleService.addInheritance(inheritanceDto.juniorRoleId, inheritanceDto.seniorRoleId);
  }

  @Post('remove-inheritance')
  @ApiOperation({ summary: '移除角色继承关系' })
  @ApiResponse({ status: 200, description: '角色继承关系移除成功' })
  @RequirePermission('system.role.edit')
  removeInheritance(@Body() removeDto: { juniorRoleId: number }) {
    return this.roleService.removeInheritance(removeDto.juniorRoleId);
  }

  @Get('permissions')
  @ApiOperation({ summary: '获取角色的有效权限' })
  @ApiResponse({ status: 200, description: '获取角色权限成功' })
  @ApiQuery({ name: 'id', required: true, description: '角色ID' })
  @RequirePermission('system.role.view')
  getRolePermissions(@Query('id', ParseIntPipe) id: number) {
    return this.roleService.getRolePermissions(id);
  }
}
