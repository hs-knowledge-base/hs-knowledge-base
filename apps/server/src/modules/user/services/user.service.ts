import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserRepository } from '../repositories/user.repository';
import { RoleRepository } from '../repositories/role.repository';

export interface GetUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  role?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { roleIds, password, ...userData } = createUserDto;
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户
    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    // 如果提供了角色ID，则关联角色
    if (roleIds && roleIds.length > 0) {
      const roles = await this.roleRepository.findByIds(roleIds);
      await this.userRepository.updateUserRoles(user.id, roles);
    }

    return this.userRepository.findOne(user.id) as Promise<User>;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAllWithRoles();
  }

  async findAllWithQuery(query: GetUsersQuery): Promise<PaginatedResult<User> | User[]> {
    // 如果没有分页参数，返回所有数据
    if (!query.page && !query.limit) {
      const users = await this.userRepository.findAllWithRoles();
      return this.filterUsers(users, query);
    }

    // 有分页参数，返回分页结果
    const page = query.page || 1;
    const limit = query.limit || 10;
    const allUsers = await this.userRepository.findAllWithRoles();
    const filteredUsers = this.filterUsers(allUsers, query);
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredUsers.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      total: filteredUsers.length,
      page,
      limit,
      totalPages: Math.ceil(filteredUsers.length / limit),
    };
  }

  private filterUsers(users: User[], query: GetUsersQuery): User[] {
    return users.filter(user => {
      // 搜索过滤
      if (query.search) {
        const searchLower = query.search.toLowerCase();
        const matchesSearch = 
          user.username.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
          (user.lastName && user.lastName.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // 状态过滤
      if (query.isActive !== undefined && user.isActive !== query.isActive) {
        return false;
      }

      // 角色过滤
      if (query.role) {
        const hasRole = user.roles?.some(role => 
          role.name.toLowerCase().includes(query.role!.toLowerCase())
        );
        if (!hasRole) return false;
      }

      return true;
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findWithRolesAndPermissions(id);
    
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findByUsername(username);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async update(id: number, updateUserDto: Partial<CreateUserDto>): Promise<User> {
    const { roleIds, password, ...userData } = updateUserDto;
    
    // 如果有密码更新，则加密新密码
    const updateData: any = { ...userData };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    // 更新用户基本信息
    await this.userRepository.update(id, updateData);

    // 如果提供了角色ID，则更新角色关联
    if (roleIds !== undefined) {
      if (roleIds.length > 0) {
        const roles = await this.roleRepository.findByIds(roleIds);
        await this.userRepository.updateUserRoles(id, roles);
      } else {
        await this.userRepository.updateUserRoles(id, []);
      }
    }

    return this.findOne(id);
  }

  async toggleStatus(id: number, isActive: boolean): Promise<User> {
    await this.findOne(id); // 检查用户是否存在
    
    const updated = await this.userRepository.update(id, { isActive });
    
    if (!updated) {
      throw new NotFoundException('用户状态更新失败');
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.delete(id);
  }

  async getUserPermissions(id: number): Promise<string[]> {
    const user = await this.findOne(id);
    
    // 收集用户所有角色的权限
    const allPermissions = new Set<string>();
    
    if (user.roles) {
      for (const role of user.roles) {
        if (role.permissions) {
          role.permissions.forEach(permission => {
            allPermissions.add(permission.code);
          });
        }
      }
    }
    
    return Array.from(allPermissions);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
}
