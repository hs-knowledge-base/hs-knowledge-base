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
import { PoliciesGuard, CheckPolicies } from '../../auth/guards/permissions.guard';
import { Action, Subject } from '../../auth/entities/permission.entity';

// 权限策略函数
const ReadRolePolicy = (ability: any) => ability.can(Action.READ, Subject.ROLE);
const CreateRolePolicy = (ability: any) => ability.can(Action.CREATE, Subject.ROLE);
const UpdateRolePolicy = (ability: any) => ability.can(Action.UPDATE, Subject.ROLE);
const DeleteRolePolicy = (ability: any) => ability.can(Action.DELETE, Subject.ROLE);

@ApiTags('admin', '角色管理')
@Controller('admin/roles')
@UseGuards(PoliciesGuard)
export class RoleAdminController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: '创建角色' })
  @ApiResponse({ status: 201, description: '角色创建成功' })
  @CheckPolicies(CreateRolePolicy)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有角色' })
  @ApiResponse({ status: 200, description: '获取角色列表成功' })
  @CheckPolicies(ReadRolePolicy)
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取角色' })
  @ApiResponse({ status: 200, description: '获取角色成功' })
  @CheckPolicies(ReadRolePolicy)
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新角色' })
  @ApiResponse({ status: 200, description: '角色更新成功' })
  @CheckPolicies(UpdateRolePolicy)
  update(@Param('id') id: string, @Body() updateRoleDto: Partial<CreateRoleDto>) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  @ApiResponse({ status: 200, description: '角色删除成功' })
  @CheckPolicies(DeleteRolePolicy)
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
