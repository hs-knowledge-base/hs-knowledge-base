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
import { PoliciesGuard } from '../../auth/guards/permissions.guard';
import { Action, Subject } from '../../auth/entities/permission.entity';
import { RequirePermission, VoTransform } from '@/core/decorators';
import { UserVo, SimpleUserVo, UserDetailVo } from '../vo';

@ApiTags('admin', '用户管理')
@Controller('admin/users')
@UseGuards(PoliciesGuard)
export class UserAdminController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '用户创建成功', type: UserVo })
  @RequirePermission(Action.CREATE, Subject.USER)
  @VoTransform({ voClass: UserVo, excludeSensitive: true })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有用户' })
  @ApiResponse({ status: 200, description: '获取用户列表成功', type: [UserDetailVo] })
  @RequirePermission(Action.READ, Subject.USER)
  @VoTransform({ voClass: UserDetailVo, excludeSensitive: true })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取用户' })
  @ApiResponse({ status: 200, description: '获取用户成功', type: UserDetailVo })
  @RequirePermission(Action.READ, Subject.USER)
  @VoTransform({ voClass: UserDetailVo, excludeSensitive: true, deep: true })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新用户' })
  @ApiResponse({ status: 200, description: '用户更新成功', type: UserVo })
  @RequirePermission(Action.UPDATE, Subject.USER)
  @VoTransform({ voClass: UserVo, excludeSensitive: true })
  update(@Param('id') id: string, @Body() updateUserDto: Partial<CreateUserDto>) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ status: 200, description: '用户删除成功' })
  @RequirePermission(Action.DELETE, Subject.USER)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
