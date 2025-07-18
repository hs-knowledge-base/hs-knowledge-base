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
  Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { RbacPermissionsGuard } from '../../auth/guards/rbac-permissions.guard';

import { RequirePermission, VoTransform } from '@/core/decorators';
import { UserVo } from '../vo';

@ApiTags('admin', '用户管理')
@Controller('admin/users')
@UseGuards(RbacPermissionsGuard)
export class UserAdminController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '用户创建成功', type: UserVo })
  @RequirePermission('system.user.add')
  @VoTransform({ voClass: UserVo })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: '获取用户列表（支持分页和查询）' })
  @ApiResponse({ status: 200, description: '获取用户列表成功' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键词' })
  @ApiQuery({ name: 'isActive', required: false, description: '是否启用' })
  @ApiQuery({ name: 'role', required: false, description: '角色名称' })
  @RequirePermission('system.user.view')
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('isActive') isActive?: boolean,
    @Query('role') role?: string,
  ) {
    const queryParams = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      role,
    };
    return this.userService.findAllWithQuery(queryParams);
  }

  @Get('detail')
  @ApiOperation({ summary: '根据ID获取用户详情' })
  @ApiResponse({ status: 200, description: '获取用户成功', type: UserVo })
  @ApiQuery({ name: 'id', required: true, description: '用户ID' })
  @RequirePermission('system.user.view')
  @VoTransform({ voClass: UserVo })
  findOne(@Query('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Post('update')
  @ApiOperation({ summary: '更新用户' })
  @ApiResponse({ status: 200, description: '用户更新成功', type: UserVo })
  @RequirePermission('system.user.edit')
  @VoTransform({ voClass: UserVo })
  update(@Body() updateDto: { id: number } & Partial<CreateUserDto>) {
    const { id, ...updateData } = updateDto;
    return this.userService.update(id, updateData);
  }

  @Post('toggle-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '切换用户状态' })
  @ApiResponse({ status: 200, description: '用户状态更新成功', type: UserVo })
  @RequirePermission('system.user.edit')
  @VoTransform({ voClass: UserVo })
  toggleStatus(@Body() statusDto: { id: number; isActive: boolean }) {
    return this.userService.toggleStatus(statusDto.id, statusDto.isActive);
  }

  @Post('delete')
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ status: 200, description: '用户删除成功' })
  @RequirePermission('system.user.delete')
  remove(@Body() deleteDto: { id: number }) {
    return this.userService.remove(deleteDto.id);
  }

  @Post('update-roles')
  @ApiOperation({ summary: '更新用户角色' })
  @ApiResponse({ status: 200, description: '用户角色更新成功', type: UserVo })
  @RequirePermission('system.user.edit')
  @VoTransform({ voClass: UserVo })
  updateUserRoles(@Body() rolesDto: { id: number; roleIds: number[] }) {
    return this.userService.update(rolesDto.id, { roleIds: rolesDto.roleIds });
  }

  @Post('reset-password')
  @ApiOperation({ summary: '重置用户密码' })
  @ApiResponse({ status: 200, description: '密码重置成功' })
  @RequirePermission('system.user.edit')
  resetPassword(@Body() passwordDto: { id: number; password: string }) {
    return this.userService.update(passwordDto.id, { password: passwordDto.password });
  }

  @Get('permissions')
  @ApiOperation({ summary: '获取用户的有效权限' })
  @ApiResponse({ status: 200, description: '获取用户权限成功' })
  @ApiQuery({ name: 'id', required: true, description: '用户ID' })
  @RequirePermission('system.user.view')
  getUserPermissions(@Query('id', ParseIntPipe) id: number) {
    return this.userService.getUserPermissions(id);
  }

  // 保留原有的动态URL接口（用于兼容性）
  @Get(':id')
  @ApiOperation({ summary: '根据ID获取用户' })
  @ApiResponse({ status: 200, description: '获取用户成功', type: UserVo })
  @RequirePermission('system.user.view')
  @VoTransform({ voClass: UserVo })
  findOneById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新用户' })
  @ApiResponse({ status: 200, description: '用户更新成功', type: UserVo })
  @RequirePermission('system.user.edit')
  @VoTransform({ voClass: UserVo })
  updateById(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: Partial<CreateUserDto>) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ status: 200, description: '用户删除成功' })
  @RequirePermission('system.user.delete')
  removeById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
