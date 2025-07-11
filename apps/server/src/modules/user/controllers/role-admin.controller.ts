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
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { PoliciesGuard } from '../../auth/guards/permissions.guard';
import { Action, Subject } from '../../auth/entities/permission.entity';
import { RequirePermission, VoTransform } from '@/core/decorators';
import { RoleVo, SimpleRoleVo, RoleDetailVo } from '../vo';

@ApiTags('admin', '角色管理')
@Controller('admin/roles')
@UseGuards(PoliciesGuard)
export class RoleAdminController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: '创建角色' })
  @ApiResponse({ status: 201, description: '角色创建成功', type: RoleVo })
  @RequirePermission(Action.CREATE, Subject.ROLE)
  @VoTransform({ voClass: RoleVo })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有角色' })
  @ApiResponse({ status: 200, description: '获取角色列表成功', type: [SimpleRoleVo] })
  @RequirePermission(Action.READ, Subject.ROLE)
  @VoTransform({ voClass: SimpleRoleVo })
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取角色' })
  @ApiResponse({ status: 200, description: '获取角色成功', type: RoleDetailVo })
  @RequirePermission(Action.READ, Subject.ROLE)
  @VoTransform({ voClass: RoleDetailVo, deep: true })
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新角色' })
  @ApiResponse({ status: 200, description: '角色更新成功', type: RoleVo })
  @RequirePermission(Action.UPDATE, Subject.ROLE)
  @VoTransform({ voClass: RoleVo })
  update(@Param('id') id: string, @Body() updateRoleDto: Partial<CreateRoleDto>) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  @ApiResponse({ status: 200, description: '角色删除成功' })
  @RequirePermission(Action.DELETE, Subject.ROLE)
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
