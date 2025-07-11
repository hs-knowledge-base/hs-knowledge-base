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
    const { username, email, password, roleIds, ...userData } = createUserDto;

    // 检查用户名和邮箱是否已存在
    const existingUserByUsername = await this.userRepository.existsByUsername(username);
    if (existingUserByUsername) {
      throw new ConflictException('用户名已存在');
    }

    const existingUserByEmail = await this.userRepository.existsByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictException('邮箱已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户实例
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      ...userData,
    });

    // 如果提供了角色ID，则关联角色
    if (roleIds && roleIds.length > 0) {
      const roles = await this.roleRepository.findByIds(roleIds);
      user.roles = roles;
    }

    return this.userRepository.save(user);
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

  async update(id: string, updateData: Partial<CreateUserDto>): Promise<User> {
    const user = await this.findOne(id);
    const { password, roleIds, ...otherData } = updateData;

    // 如果更新密码，需要加密
    if (password) {
      otherData['password'] = await bcrypt.hash(password, 10);
    }

    // 更新角色关联
    if (roleIds !== undefined) {
      if (roleIds.length > 0) {
        const roles = await this.roleRepository.findByIds(roleIds);
        user.roles = roles;
      } else {
        user.roles = [];
      }
    }

    Object.assign(user, otherData);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
}
