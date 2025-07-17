import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { PermissionRepository } from '../repositories/permission.repository';

@Injectable()
export class PermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    @InjectRepository(Permission)
    private readonly permissionTypeOrmRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    return this.permissionRepository.create(createPermissionDto);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.findAllWithRoles();
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne(id);

    if (!permission) {
      throw new NotFoundException('权限不存在');
    }

    return permission;
  }

  async update(id: string, updateData: Partial<CreatePermissionDto>): Promise<Permission> {
    const permission = await this.findOne(id);
    const updated = await this.permissionRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException('权限不存在');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const permission = await this.findOne(id);
    await this.permissionRepository.delete(id);
  }

  async findByRoleIds(roleIds: string[]): Promise<Permission[]> {
    return this.permissionRepository.findByRoleIds(roleIds);
  }

  /**
   * 获取权限树结构
   */
  async getPermissionTree(): Promise<Permission[]> {
    // 获取所有权限
    const allPermissions = await this.permissionTypeOrmRepository.find({
      order: { sort: 'ASC' },
    });

    // 构建树形结构
    return this.buildPermissionTree(allPermissions);
  }

  /**
   * 构建权限树
   */
  private buildPermissionTree(permissions: Permission[]): Permission[] {
    const permissionMap = new Map<string, Permission>();
    const rootPermissions: Permission[] = [];

    // 先将所有权限放入Map
    permissions.forEach(permission => {
      permissionMap.set(permission.id, { ...permission, children: [] });
    });

    // 建立父子关系
    permissions.forEach(permission => {
      const currentPermission = permissionMap.get(permission.id);
      if (!currentPermission) return;

      if (permission.parent) {
        const parent = permissionMap.get(permission.parent.id);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(currentPermission);
        }
      } else {
        rootPermissions.push(currentPermission);
      }
    });

    return rootPermissions;
  }
}
