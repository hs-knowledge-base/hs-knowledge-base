import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission, Action, Subject } from '../entities/permission.entity';
import { BaseRepository } from './base.repository';

export interface IPermissionRepository {
  findByRoleIds(roleIds: string[]): Promise<Permission[]>;
  findByActionAndSubject(action: Action, subject: Subject): Promise<Permission[]>;
  findAllWithRoles(): Promise<Permission[]>;
  existsByActionAndSubject(action: Action, subject: Subject): Promise<boolean>;
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

  async findByActionAndSubject(action: Action, subject: Subject): Promise<Permission[]> {
    return this.repository.find({
      where: { action, subject },
      relations: ['roles'],
    });
  }

  async findAllWithRoles(): Promise<Permission[]> {
    return this.repository.find({
      relations: ['roles'],
    });
  }

  async existsByActionAndSubject(action: Action, subject: Subject): Promise<boolean> {
    const count = await this.repository.count({
      where: { action, subject },
    });
    return count > 0;
  }

  async hasAnyPermissions(): Promise<boolean> {
    const count = await this.repository.count();
    return count > 0;
  }
}
