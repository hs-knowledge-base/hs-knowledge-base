import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from '../repositories/role.repository';
import { PermissionRepository } from '../../auth/repositories/permission.repository';
import { Role } from '../entities/role.entity';

export interface GetRolesQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  level?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async create(roleData: any): Promise<Role> {
    const { permissionIds, parentId, ...restRoleData } = roleData;
    
    // 设置父角色
    if (parentId) {
      const parentRole = await this.findOne(parentId);
      restRoleData.parent = parentRole;
    }

    // 创建角色
    const role = await this.roleRepository.create(restRoleData);

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

  async findAllWithQuery(query: GetRolesQuery): Promise<PaginatedResult<Role> | Role[]> {
    // 如果没有分页参数，返回所有数据
    if (!query.page && !query.limit) {
      const roles = await this.roleRepository.findAllWithPermissions();
      return this.filterRoles(roles, query);
    }

    // 有分页参数，返回分页结果
    const page = query.page || 1;
    const limit = query.limit || 10;
    const allRoles = await this.roleRepository.findAllWithPermissions();
    const filteredRoles = this.filterRoles(allRoles, query);
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredRoles.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      total: filteredRoles.length,
      page,
      limit,
      totalPages: Math.ceil(filteredRoles.length / limit),
    };
  }

  private filterRoles(roles: Role[], query: GetRolesQuery): Role[] {
    return roles.filter(role => {
      // 搜索过滤
      if (query.search) {
        const searchLower = query.search.toLowerCase();
        const matchesSearch = 
          role.name.toLowerCase().includes(searchLower) ||
          (role.description && role.description.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // 状态过滤
      if (query.isActive !== undefined && role.isActive !== query.isActive) {
        return false;
      }

      // 级别过滤
      if (query.level !== undefined && role.level !== query.level) {
        return false;
      }

      return true;
    });
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findWithPermissions(id);
    
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    return role;
  }

  async update(id: number, roleData: any): Promise<Role> {
    const { permissionIds, parentId, ...restRoleData } = roleData;
    
    // 检查角色是否存在
    const existingRole = await this.findOne(id);

    // 处理父角色设置
    if (parentId !== undefined) {
      if (parentId) {
        const parentRole = await this.findOne(parentId);
        restRoleData.parent = parentRole;
      } else {
        restRoleData.parent = undefined;
      }
    }

    // 更新角色基本信息
    await this.roleRepository.update(id, restRoleData);

    // 如果提供了权限ID，则更新权限关联
    if (permissionIds !== undefined) {
      const role = await this.findOne(id);
      if (permissionIds.length > 0) {
        const permissions = await this.permissionRepository.findAll();
        const selectedPermissions = permissions.filter(p => permissionIds.includes(p.id));
        role.permissions = selectedPermissions;
      } else {
        role.permissions = [];
      }
      await this.roleRepository.save(role);
    }

    return this.findOne(id);
  }

  async toggleStatus(id: number, isActive: boolean): Promise<Role> {
    await this.findOne(id); // 检查角色是否存在
    
    const updated = await this.roleRepository.update(id, { isActive });
    
    if (!updated) {
      throw new NotFoundException('角色状态更新失败');
    }

    return updated;
  }

  async remove(id: number): Promise<void> {
    // 检查角色是否存在
    await this.findOne(id);
    await this.roleRepository.delete(id);
  }

  async getRoleHierarchy(): Promise<Role[]> {
    const allRoles = await this.roleRepository.findAllWithPermissions();
    // 过滤出根角色（没有父角色的角色）
    return allRoles.filter(role => !role.parent);
  }

  async addInheritance(juniorRoleId: number, seniorRoleId: number): Promise<void> {
    const juniorRole = await this.findOne(juniorRoleId);
    const seniorRole = await this.findOne(seniorRoleId);
    
    // 设置继承关系
    juniorRole.parent = seniorRole;
    await this.roleRepository.save(juniorRole);
  }

  async removeInheritance(juniorRoleId: number): Promise<void> {
    const juniorRole = await this.findOne(juniorRoleId);
    
    // 移除继承关系
    juniorRole.parent = undefined;
    await this.roleRepository.save(juniorRole);
  }

  async getRolePermissions(id: number): Promise<string[]> {
    const role = await this.findOne(id);
    return role.permissions.map(permission => permission.code);
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findByName(name);
  }
}
