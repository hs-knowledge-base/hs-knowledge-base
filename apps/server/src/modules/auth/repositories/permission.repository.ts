import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Permission } from '../entities/permission.entity';

export interface GetPermissionsQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  parentId?: number;
}

@Injectable()
export class PermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly repository: Repository<Permission>,
  ) {}

  async findByRoleIds(roleIds: number[]): Promise<Permission[]> {
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
    return this.repository.find({
      relations: ['parent', 'children'],
      order: { sort: 'ASC' },
    });
  }

  async findAllWithQuery(query: GetPermissionsQuery): Promise<Permission[]> {
    const queryBuilder = this.repository.createQueryBuilder('permission')
      .leftJoinAndSelect('permission.parent', 'parent')
      .leftJoinAndSelect('permission.children', 'children')
      .orderBy('permission.sort', 'ASC');

    // 添加搜索条件
    if (query.search) {
      queryBuilder.andWhere(
        '(permission.name LIKE :search OR permission.code LIKE :search)',
        { search: `%${query.search}%` }
      );
    }

    // 添加类型筛选
    if (query.type) {
      queryBuilder.andWhere('permission.type = :type', { type: query.type });
    }

    // 添加父权限筛选
    if (query.parentId !== undefined) {
      if (query.parentId === null || query.parentId === 0) {
        queryBuilder.andWhere('permission.parent IS NULL');
      } else {
        queryBuilder.andWhere('permission.parent.id = :parentId', { parentId: query.parentId });
      }
    }

    return queryBuilder.getMany();
  }

  async findAllWithPagination(
    query: GetPermissionsQuery, 
    page: number, 
    limit: number
  ): Promise<{ data: Permission[]; total: number }> {
    const queryBuilder = this.repository.createQueryBuilder('permission')
      .leftJoinAndSelect('permission.parent', 'parent')
      .leftJoinAndSelect('permission.children', 'children')
      .orderBy('permission.sort', 'ASC');

    // 添加搜索条件
    if (query.search) {
      queryBuilder.andWhere(
        '(permission.name LIKE :search OR permission.code LIKE :search)',
        { search: `%${query.search}%` }
      );
    }

    // 添加类型筛选
    if (query.type) {
      queryBuilder.andWhere('permission.type = :type', { type: query.type });
    }

    // 添加父权限筛选
    if (query.parentId !== undefined) {
      if (query.parentId === null || query.parentId === 0) {
        queryBuilder.andWhere('permission.parent IS NULL');
      } else {
        queryBuilder.andWhere('permission.parent.id = :parentId', { parentId: query.parentId });
      }
    }

    // 添加分页
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    
    return { data, total };
  }

  async findByType(type: string): Promise<Permission[]> {
    return this.repository.find({
      where: { type: type as any },
      relations: ['parent', 'children'],
      order: { sort: 'ASC' },
    });
  }

  async findAllWithRoles(): Promise<Permission[]> {
    return this.repository.find({
      relations: ['roles'],
    });
  }

  async findOne(id: number): Promise<Permission | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['roles', 'parent', 'children'],
    });
  }

  async create(permissionData: Partial<Permission>): Promise<Permission> {
    const permission = this.repository.create(permissionData);
    return this.repository.save(permission);
  }

  async update(id: number, permissionData: Partial<Permission>): Promise<Permission | null> {
    await this.repository.update(id, permissionData);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
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
