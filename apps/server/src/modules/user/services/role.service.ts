import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from '../repositories/role.repository';
import { PermissionRepository } from '../../auth/repositories/permission.repository';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async create(roleData: Partial<Role>, permissionIds?: number[]): Promise<Role> {
    // 创建角色
    const role = await this.roleRepository.create(roleData);

    // 如果提供了权限ID，则关联权限
    if (permissionIds && permissionIds.length > 0) {
      const permissions = await this.permissionRepository.findAll();
      const selectedPermissions = permissions.filter(p => permissionIds.includes(p.id));
      
      role.permissions = selectedPermissions;
      await this.roleRepository.save(role);
    }

    return role;
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.findAllWithPermissions();
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findWithPermissions(id);
    
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    return role;
  }

  async update(id: number, roleData: Partial<Role>, permissionIds?: number[]): Promise<Role> {
    // 检查角色是否存在
    await this.findOne(id);

    // 更新角色基本信息
    await this.roleRepository.update(id, roleData);

    // 如果提供了权限ID，则更新权限关联
    if (permissionIds !== undefined) {
      if (permissionIds.length > 0) {
        const permissions = await this.permissionRepository.findAll();
        const selectedPermissions = permissions.filter(p => permissionIds.includes(p.id));
        await this.roleRepository.update(id, { permissions: selectedPermissions });
      } else {
        await this.roleRepository.update(id, { permissions: [] });
      }
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    // 检查角色是否存在
    await this.findOne(id);
    await this.roleRepository.delete(id);
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findByName(name);
  }
}
