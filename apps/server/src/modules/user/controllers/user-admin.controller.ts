import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete, 
  UseGuards,
  ParseIntPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserVo } from '../vo/user.vo';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacPermissionsGuard } from '../../auth/guards/rbac-permissions.guard';
import { RequirePermission } from '@/core/decorators/require-permission.decorator';

@ApiTags('用户管理')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RbacPermissionsGuard)
@ApiBearerAuth()
export class UserAdminController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @RequirePermission('system.user.add')
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '用户创建成功', type: UserVo })
  async create(@Body() createUserDto: CreateUserDto): Promise<any> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @RequirePermission('system.user.view')
  @ApiOperation({ summary: '获取所有用户' })
  @ApiResponse({ status: 200, description: '获取成功', type: [UserVo] })
  async findAll(): Promise<any[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @RequirePermission('system.user.view')
  @ApiOperation({ summary: '根据ID获取用户' })
  @ApiResponse({ status: 200, description: '获取成功', type: UserVo })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @RequirePermission('system.user.edit')
  @ApiOperation({ summary: '更新用户' })
  @ApiResponse({ status: 200, description: '更新成功', type: UserVo })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: Partial<CreateUserDto>
  ): Promise<any> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @RequirePermission('system.user.delete')
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.remove(id);
  }
}
