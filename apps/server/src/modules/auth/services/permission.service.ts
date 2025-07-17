import { Injectable, NotFoundException } from '@nestjs/common';
import { PermissionRepository } from '../repositories/permission.repository';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto } from '../dto/create-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    return this.permissionRepository.create(createPermissionDto);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.findAll();
  }

  async findOne(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne(id);
    
    if (!permission) {
      throw new NotFoundException('权限不存在');
    }

    return permission;
  }

  async update(id: number, updateData: Partial<CreatePermissionDto>): Promise<Permission> {
    await this.findOne(id); // 检查权限是否存在
    
    const updated = await this.permissionRepository.update(id, updateData);
    
    if (!updated) {
      throw new NotFoundException('权限更新失败');
    }

    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // 检查权限是否存在
    await this.permissionRepository.delete(id);
  }

  async findByRoleIds(roleIds: number[]): Promise<Permission[]> {
    return this.permissionRepository.findByRoleIds(roleIds);
  }

  async findByCode(code: string): Promise<Permission | null> {
    return this.permissionRepository.findByCode(code);
  }

  /**
   * 获取权限树结构
   */
  async getPermissionTree(): Promise<Permission[]> {
    const permissions = await this.permissionRepository.findAll();
    
    if (!permissions || permissions.length === 0) {
      return [];
    }

    // 创建权限映射
    const permissionMap = new Map<number, Permission & { children: Permission[] }>();
    
    // 初始化所有权限
    permissions.forEach(permission => {
      permissionMap.set(permission.id, { ...permission, children: [] });
    });

    // 构建树形结构
    const rootPermissions: Permission[] = [];
    permissions.forEach(permission => {
      const currentPermission = permissionMap.get(permission.id);
      
      if (permission.parent && permission.parent.id) {
        // 有父节点，添加到父节点的children中
        const parent = permissionMap.get(permission.parent.id);
        if (parent) {
          parent.children.push(currentPermission!);
        }
      } else {
        // 没有父节点，是根节点
        rootPermissions.push(currentPermission!);
      }
    });

    return rootPermissions;
  }
}
