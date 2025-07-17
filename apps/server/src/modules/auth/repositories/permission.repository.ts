import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { BaseRepository } from './base.repository';

export interface IPermissionRepository {
  findByRoleIds(roleIds: string[]): Promise<Permission[]>;
  findByCode(code: string): Promise<Permission | null>;
  findAllWithRoles(): Promise<Permission[]>;
  existsByCode(code: string): Promise<boolean>;
  hasAnyPermissions(): Promise<boolean>;
}

@Injectable()
export class PermissionRepository extends BaseRepository<Permission> implements IPermissionRepository {
  constructor(
    @InjectRepository(Permission)
    permissionRepository: Repository<Permission>,
  ) {
    super(permissionRepository);
  }

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

  async findAllWithRoles(): Promise<Permission[]> {
    return this.repository.find({
      relations: ['roles'],
    });
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
