import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Role } from '../../user/entities/role.entity';
import { Permission } from '../entities/permission.entity';

/**
 * 角色层次管理服务
 * 实现RBAC2模型中的角色继承和层次结构管理
 */
@Injectable()
export class RoleHierarchyService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  /**
   * 建立角色继承关系
   */
  async addInheritance(juniorRoleId: string, seniorRoleId: string): Promise<void> {
    const juniorRole = await this.roleRepository.findOne({
      where: { id: juniorRoleId },
      relations: ['parent', 'children'],
    });

    const seniorRole = await this.roleRepository.findOne({
      where: { id: seniorRoleId },
      relations: ['parent', 'children'],
    });

    if (!juniorRole || !seniorRole) {
      throw new NotFoundException('角色不存在');
    }

    // 检查是否会形成循环继承
    if (await this.wouldCreateCycle(juniorRoleId, seniorRoleId)) {
      throw new BadRequestException('不能建立循环继承关系');
    }

    // 检查层级限制
    const seniorLevel = await this.calculateRoleLevel(seniorRole);
    if (seniorLevel <= juniorRole.level) {
      throw new BadRequestException('高级角色的层级必须大于低级角色');
    }

    // 建立继承关系
    juniorRole.parent = seniorRole;
    await this.roleRepository.save(juniorRole);

    // 更新继承权限缓存
    await this.updateInheritedPermissions(juniorRole);
  }

  /**
   * 移除角色继承关系
   */
  async removeInheritance(juniorRoleId: string): Promise<void> {
    const juniorRole = await this.roleRepository.findOne({
      where: { id: juniorRoleId },
      relations: ['parent'],
    });

    if (!juniorRole) {
      throw new NotFoundException('角色不存在');
    }

    juniorRole.parent = undefined;
    await this.roleRepository.save(juniorRole);

    // 更新继承权限缓存
    await this.updateInheritedPermissions(juniorRole);
  }

  /**
   * 获取角色的所有上级角色
   */
  async getSeniorRoles(roleId: string): Promise<Role[]> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['parent'],
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    const seniors: Role[] = [];
    let currentRole = role;

    while (currentRole.parent) {
      seniors.push(currentRole.parent);
      const nextRole = await this.roleRepository.findOne({
        where: { id: currentRole.parent.id },
        relations: ['parent'],
      });
      if (!nextRole) break;
      currentRole = nextRole;
    }

    return seniors;
  }

  /**
   * 获取角色的所有下级角色
   */
  async getJuniorRoles(roleId: string): Promise<Role[]> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['children'],
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    const juniors: Role[] = [];
    await this.collectJuniorRoles(role, juniors);
    return juniors;
  }

  /**
   * 递归收集所有下级角色
   */
  private async collectJuniorRoles(role: Role, juniors: Role[]): Promise<void> {
    if (role.children?.length) {
      for (const child of role.children) {
        juniors.push(child);
        const childWithChildren = await this.roleRepository.findOne({
          where: { id: child.id },
          relations: ['children'],
        });
        if (childWithChildren) {
          await this.collectJuniorRoles(childWithChildren, juniors);
        }
      }
    }
  }

  /**
   * 获取角色的所有有效权限（包括继承的权限）
   */
  async getEffectivePermissions(roleId: string): Promise<Permission[]> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions', 'parent', 'parent.permissions'],
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    const permissionMap = new Map<string, Permission>();

    // 添加角色直接权限
    if (role.permissions) {
      role.permissions.forEach(permission => {
        const key = permission.code;
        permissionMap.set(key, permission);
      });
    }

    // 递归添加继承权限
    await this.addInheritedPermissionsRecursive(role, permissionMap);

    return Array.from(permissionMap.values());
  }

  /**
   * 递归添加继承的权限
   */
  private async addInheritedPermissionsRecursive(
    role: Role,
    permissionMap: Map<string, Permission>
  ): Promise<void> {
    if (role.parent) {
      const parentRole = await this.roleRepository.findOne({
        where: { id: role.parent.id },
        relations: ['permissions', 'parent'],
      });

      if (parentRole && parentRole.permissions) {
        parentRole.permissions.forEach(permission => {
          const key = permission.code;
          if (!permissionMap.has(key)) {
            permissionMap.set(key, permission);
          }
        });

        // 继续向上递归
        await this.addInheritedPermissionsRecursive(parentRole, permissionMap);
      }
    }
  }

  /**
   * 检查是否会形成循环继承
   */
  private async wouldCreateCycle(juniorRoleId: string, seniorRoleId: string): Promise<boolean> {
    const seniorRoles = await this.getSeniorRoles(seniorRoleId);
    return seniorRoles.some(role => role.id === juniorRoleId);
  }

  /**
   * 计算角色的实际层级
   */
  private async calculateRoleLevel(role: Role): Promise<number> {
    let level = role.level;
    let currentRole = role;

    while (currentRole.parent) {
      const nextRole = await this.roleRepository.findOne({
        where: { id: currentRole.parent.id },
        relations: ['parent'],
      });
      if (!nextRole) break;
      currentRole = nextRole;
      level = Math.max(level, currentRole.level + 1);
    }

    return level;
  }

  /**
   * 更新角色的继承权限缓存
   */
  private async updateInheritedPermissions(role: Role): Promise<void> {
    const seniorRoles = await this.getSeniorRoles(role.id);
    const inheritedRoleIds = seniorRoles.map(r => r.id);
    
    await this.roleRepository.update(role.id, {
      inheritedRoleIds,
    });
  }

  /**
   * 获取角色层次结构树
   */
  async getRoleHierarchyTree(): Promise<Role[]> {
    // 获取所有根角色（没有父角色的角色）
    const rootRoles = await this.roleRepository.find({
      where: { parent: IsNull() },
      relations: ['children'],
    });

    // 递归构建树结构
    for (const root of rootRoles) {
      await this.buildRoleTree(root);
    }

    return rootRoles;
  }

  /**
   * 递归构建角色树
   */
  private async buildRoleTree(role: Role): Promise<void> {
    if (role.children?.length) {
      for (let i = 0; i < role.children.length; i++) {
        const child = await this.roleRepository.findOne({
          where: { id: role.children[i].id },
          relations: ['children'],
        });
        if (child) {
          role.children[i] = child;
          await this.buildRoleTree(child);
        }
      }
    }
  }

  /**
   * 验证角色层次结构的一致性
   */
  async validateHierarchyConsistency(): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    const allRoles = await this.roleRepository.find({
      relations: ['parent', 'children'],
    });

    for (const role of allRoles) {
      // 检查循环继承
      try {
        await this.getSeniorRoles(role.id);
      } catch (error) {
        errors.push(`角色 ${role.name} 存在循环继承`);
      }

      // 检查层级一致性
      if (role.parent) {
        const parentLevel = await this.calculateRoleLevel(role.parent);
        if (parentLevel <= role.level) {
          errors.push(`角色 ${role.name} 的层级设置不一致`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 自动修复角色层级
   */
  async autoFixRoleLevels(): Promise<void> {
    const rootRoles = await this.roleRepository.find({
      where: { parent: IsNull() },
    });

    for (const root of rootRoles) {
      await this.updateRoleLevelsRecursive(root, 0);
    }
  }

  /**
   * 递归更新角色层级
   */
  private async updateRoleLevelsRecursive(role: Role, level: number): Promise<void> {
    await this.roleRepository.update(role.id, { level });

    const children = await this.roleRepository.find({
      where: { parent: { id: role.id } },
    });

    for (const child of children) {
      await this.updateRoleLevelsRecursive(child, level + 1);
    }
  }
} 