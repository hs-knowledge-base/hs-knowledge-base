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
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { PoliciesGuard, CheckPolicies } from '../../auth/guards/permissions.guard';
import { Action, Subject } from '../../auth/entities/permission.entity';

// 权限策略函数
const ReadUserPolicy = (ability: any) => ability.can(Action.READ, Subject.USER);
const CreateUserPolicy = (ability: any) => ability.can(Action.CREATE, Subject.USER);
const UpdateUserPolicy = (ability: any) => ability.can(Action.UPDATE, Subject.USER);
const DeleteUserPolicy = (ability: any) => ability.can(Action.DELETE, Subject.USER);

@ApiTags('用户管理')
@Controller('users')
@UseGuards(PoliciesGuard)
export class UserAdminController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '用户创建成功' })
  @CheckPolicies(CreateUserPolicy)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有用户' })
  @ApiResponse({ status: 200, description: '获取用户列表成功' })
  @CheckPolicies(ReadUserPolicy)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取用户' })
  @ApiResponse({ status: 200, description: '获取用户成功' })
  @CheckPolicies(ReadUserPolicy)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新用户' })
  @ApiResponse({ status: 200, description: '用户更新成功' })
  @CheckPolicies(UpdateUserPolicy)
  update(@Param('id') id: string, @Body() updateUserDto: Partial<CreateUserDto>) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ status: 200, description: '用户删除成功' })
  @CheckPolicies(DeleteUserPolicy)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
