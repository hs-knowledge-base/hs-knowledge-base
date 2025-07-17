import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly repository: Repository<Permission>,
  ) {}

  async findByRoleIds(roleIds: string[]): Promise<Permission[]> {
    return this.repository
      .createQueryBuilder('permission')
      .innerJoin('permission.roles', 'role')
      .where('role.id IN (:...roleIds)', { roleIds })
      .getMany();
  }

  async findByCode(code: string): Promise<Permission | null> {
    return this.repository.findOne({
      where: { code },
      relations: ['roles'],
    });
  }

  async findAll(): Promise<Permission[]> {
    return this.repository.find();
  }

  async findAllWithRoles(): Promise<Permission[]> {
    return this.repository.find({
      relations: ['roles'],
    });
  }

  async findOne(id: string): Promise<Permission | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['roles', 'parent', 'children'],
    });
  }

  async create(permissionData: Partial<Permission>): Promise<Permission> {
    const permission = this.repository.create(permissionData);
    return this.repository.save(permission);
  }

  async update(id: string, permissionData: Partial<Permission>): Promise<Permission | null> {
    await this.repository.update(id, permissionData);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async existsByCode(code: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { code },
    });
    return count > 0;
  }

  async hasAnyPermissions(): Promise<boolean> {
    const count = await this.repository.count();
    return count > 0;
  }
}
