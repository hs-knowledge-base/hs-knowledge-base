import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { Role } from '../entities/role.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { RoleRepository } from '../repositories/role.repository';
import { PermissionRepository } from '../../auth/repositories/permission.repository';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    @Inject(forwardRef(() => PermissionRepository))
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { permissionIds, ...roleData } = createRoleDto;
    
    // 创建角色
    const role = await this.roleRepository.create(roleData);

    // 如果提供了权限ID，则关联权限
    if (permissionIds && permissionIds.length > 0) {
      const permissions = await this.permissionRepository.findAll();
      const selectedPermissions = permissions.filter(p => permissionIds.includes(p.id));
      await this.roleRepository.update(role.id, { permissions: selectedPermissions });
    }

    return this.roleRepository.findOne(role.id) as Promise<Role>;
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.findAllWithPermissions();
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findWithPermissions(id);
    
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    return role;
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findByName(name);
  }

  async update(id: string, updateRoleDto: Partial<CreateRoleDto>): Promise<Role> {
    const { permissionIds, ...roleData } = updateRoleDto;
    
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

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepository.delete(id);
  }
}
