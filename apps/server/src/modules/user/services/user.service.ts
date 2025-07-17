import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserRepository } from '../repositories/user.repository';
import { RoleRepository } from '../repositories/role.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { roleIds, ...userData } = createUserDto;
    
    // 创建用户
    const user = await this.userRepository.create(userData);

    // 如果提供了角色ID，则关联角色
    if (roleIds && roleIds.length > 0) {
      const roles = await this.roleRepository.findByIds(roleIds);
      await this.userRepository.update(user.id, { roles });
    }

    return this.userRepository.findOne(user.id) as Promise<User>;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAllWithRoles();
  }

  async findOne(id: string): Promise<User> {
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

  async update(id: string, updateUserDto: Partial<CreateUserDto>): Promise<User> {
    const { roleIds, ...userData } = updateUserDto;
    
    // 更新用户基本信息
    await this.userRepository.update(id, userData);

    // 如果提供了角色ID，则更新角色关联
    if (roleIds !== undefined) {
      if (roleIds.length > 0) {
        const roles = await this.roleRepository.findByIds(roleIds);
        await this.userRepository.update(id, { roles });
      } else {
        await this.userRepository.update(id, { roles: [] });
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.delete(id);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
}
