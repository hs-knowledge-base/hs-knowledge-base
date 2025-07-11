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
    const { name, permissionIds, ...roleData } = createRoleDto;

    // 检查角色名是否已存在
    const existingRole = await this.roleRepository.existsByName(name);
    if (existingRole) {
      throw new ConflictException('角色名已存在');
    }

    // 创建角色实例
    const role = this.roleRepository.create({
      name,
      ...roleData,
    });

    // 如果提供了权限ID，则关联权限
    if (permissionIds && permissionIds.length > 0) {
      const permissions = await this.permissionRepository.find({
        where: permissionIds.map(id => ({ id })),
      });
      role.permissions = permissions;
    }

    return this.roleRepository.save(role);
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

  async update(id: string, updateData: Partial<CreateRoleDto>): Promise<Role> {
    const role = await this.findOne(id);
    const { permissionIds, ...otherData } = updateData;

    // 更新权限关联
    if (permissionIds !== undefined) {
      if (permissionIds.length > 0) {
        const permissions = await this.permissionRepository.find({
          where: permissionIds.map(id => ({ id })),
        });
        role.permissions = permissions;
      } else {
        role.permissions = [];
      }
    }

    Object.assign(role, otherData);
    return this.roleRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepository.remove(role);
  }
}
