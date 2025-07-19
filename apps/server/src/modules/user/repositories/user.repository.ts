import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({
      where: { username },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async findByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.permissions', 'permissions')
      .where('user.username = :usernameOrEmail OR user.email = :usernameOrEmail', {
        usernameOrEmail,
      })
      .getOne();
  }

  async findWithRolesAndPermissions(id: number): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async findAllWithRoles(): Promise<User[]> {
    return this.repository.find({
      relations: ['roles'],
    });
  }

  async findAll(): Promise<User[]> {
    return this.repository.find();
  }

  async findOne(id: number): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['roles'],
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    // 从userData中排除roles字段，因为它需要特殊处理
    const { roles, ...updateData } = userData;
    
    if (Object.keys(updateData).length > 0) {
      await this.repository.update(id, updateData);
    }
    
    return this.findOne(id);
  }

  async updateUserRoles(id: number, roles: Role[]): Promise<User | null> {
    const user = await this.repository.findOne({
      where: { id },
      relations: ['roles'],
    });
    
    if (!user) {
      return null;
    }
    
    user.roles = roles;
    await this.repository.save(user);
    
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { username },
    });
    return count > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { email },
    });
    return count > 0;
  }

  async hasAnyUsers(): Promise<boolean> {
    const count = await this.repository.count();
    return count > 0;
  }
}
