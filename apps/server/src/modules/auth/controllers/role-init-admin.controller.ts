import { Controller, Post, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PoliciesGuard } from '../guards/permissions.guard';
import { RequirePermission } from '@/core/decorators';
import { Action, Subject } from '../entities/permission.entity';
import { RoleInitService } from '../services/role-init.service';

/**
 * 角色初始化管理控制器
 * 用于系统角色和权限的初始化管理
 */
@ApiTags('admin/role-init', '角色初始化管理')
@Controller('admin/role-init')
@UseGuards(JwtAuthGuard, PoliciesGuard)
@ApiBearerAuth()
export class RoleInitAdminController {
  constructor(private readonly roleInitService: RoleInitService) {}

  @Post('initialize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '初始化系统角色和权限' })
  @ApiResponse({ status: 200, description: '初始化成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @RequirePermission(Action.MANAGE, Subject.ROLE)
  async initializeRoles() {
    await this.roleInitService.initializeRoles();
    return { message: '系统角色和权限初始化完成' };
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '重置系统角色和权限（危险操作）' })
  @ApiResponse({ status: 200, description: '重置成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @RequirePermission(Action.MANAGE, Subject.ALL) // 只有超级管理员可以重置
  async resetRoles() {
    await this.roleInitService.resetRoles();
    return { message: '系统角色和权限重置完成' };
  }

  @Get('overview')
  @ApiOperation({ summary: '获取角色权限概览' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @RequirePermission(Action.READ, Subject.ROLE)
  async getRoleOverview() {
    const overview = await this.roleInitService.getRolePermissionOverview();
    return {
      message: '获取角色权限概览成功',
      data: overview
    };
  }
}
