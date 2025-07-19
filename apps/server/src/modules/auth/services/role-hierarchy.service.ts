import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../user/entities/role.entity';

/**
 * 角色层次结构服务 - RBAC2 核心组件
 * 负责管理角色之间的继承关系
 */
@Injectable()
export class RoleHierarchyService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * 建立角色继承关系
   */
  async addInheritance(juniorRoleId: number, seniorRoleId: number): Promise<void> {
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

    // 检查是否会形成循环
    if (await this.wouldCreateCycle(juniorRoleId, seniorRoleId)) {
      throw new BadRequestException('不能创建循环继承关系');
    }

    // 建立继承关系
    juniorRole.parent = seniorRole;
    await this.roleRepository.save(juniorRole);

    // 更新继承角色ID列表
    await this.updateInheritedRoleIds(juniorRoleId);
  }

  /**
   * 移除角色继承关系
   */
  async removeInheritance(juniorRoleId: number): Promise<void> {
    const juniorRole = await this.roleRepository.findOne({
      where: { id: juniorRoleId },
      relations: ['parent'],
    });

    if (!juniorRole) {
      throw new NotFoundException('角色不存在');
    }

    if (!juniorRole.parent) {
      throw new BadRequestException('该角色没有父角色');
    }

    // 移除继承关系
    juniorRole.parent = undefined;
    await this.roleRepository.save(juniorRole);

    // 更新继承角色ID列表
    await this.updateInheritedRoleIds(juniorRoleId);
  }

  /**
   * 获取角色的所有上级角色
   */
  async getSeniorRoles(roleId: number): Promise<Role[]> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['parent'],
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    const seniorRoles: Role[] = [];
    let currentRole = role;

    while (currentRole.parent) {
      seniorRoles.push(currentRole.parent);
      currentRole = await this.roleRepository.findOne({
        where: { id: currentRole.parent.id },
        relations: ['parent'],
      }) as Role;
    }

    return seniorRoles;
  }

  /**
   * 获取角色的所有下级角色
   */
  async getJuniorRoles(roleId: number): Promise<Role[]> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['children'],
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    const juniorRoles: Role[] = [];
    
    const collectJuniorRoles = async (currentRole: Role) => {
      if (currentRole.children && currentRole.children.length > 0) {
        for (const child of currentRole.children) {
          juniorRoles.push(child);
          const childWithChildren = await this.roleRepository.findOne({
            where: { id: child.id },
            relations: ['children'],
          });
          if (childWithChildren) {
            await collectJuniorRoles(childWithChildren);
          }
        }
      }
    };

    await collectJuniorRoles(role);
    return juniorRoles;
  }

  /**
   * 获取角色层次结构树
   */
  async getRoleHierarchy(): Promise<Role[]> {
    const allRoles = await this.roleRepository.find({
      relations: ['parent', 'children'],
      order: { level: 'ASC' },
    });

    // 过滤出根角色（没有父角色的角色）
    return allRoles.filter(role => !role.parent);
  }

  /**
   * 检查用户是否具有指定角色（包括继承）
   */
  async hasRoleWithInheritance(userId: number, roleId: number): Promise<boolean> {
    // 获取用户的所有角色
    const user = await this.roleRepository.manager
      .createQueryBuilder()
      .relation('User', 'roles')
      .of(userId)
      .loadMany<Role>();

    if (!user || user.length === 0) {
      return false;
    }

    // 检查直接角色
    const hasDirectRole = user.some(role => role.id === roleId);
    if (hasDirectRole) {
      return true;
    }

    // 检查继承角色
    for (const role of user) {
      const seniorRoles = await this.getSeniorRoles(role.id);
      if (seniorRoles.some(seniorRole => seniorRole.id === roleId)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 获取用户的所有有效角色（包括继承）
   */
  async getUserEffectiveRoles(userId: number): Promise<Role[]> {
    // 获取用户的直接角色
    const directRoles = await this.roleRepository.manager
      .createQueryBuilder()
      .relation('User', 'roles')
      .of(userId)
      .loadMany<Role>();

    if (!directRoles || directRoles.length === 0) {
      return [];
    }

    const effectiveRoles = new Set<Role>();
    
    // 添加直接角色
    directRoles.forEach(role => effectiveRoles.add(role));

    // 添加继承角色
    for (const role of directRoles) {
      const seniorRoles = await this.getSeniorRoles(role.id);
      seniorRoles.forEach(seniorRole => effectiveRoles.add(seniorRole));
    }

    return Array.from(effectiveRoles);
  }

  /**
   * 检查是否会形成循环继承
   */
  private async wouldCreateCycle(juniorRoleId: number, seniorRoleId: number): Promise<boolean> {
    // 如果junior角色已经是senior角色的上级，则会形成循环
    const seniorRoles = await this.getSeniorRoles(seniorRoleId);
    return seniorRoles.some(role => role.id === juniorRoleId);
  }

  /**
   * 更新角色的继承角色ID列表
   */
  private async updateInheritedRoleIds(roleId: number): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      return;
    }

    const seniorRoles = await this.getSeniorRoles(role.id);
    role.inheritedRoleIds = seniorRoles.map(r => r.id);
    
    await this.roleRepository.save(role);
    
    // 递归更新所有下级角色
    const juniorRoles = await this.getJuniorRoles(roleId);
    for (const juniorRole of juniorRoles) {
      await this.updateInheritedRoleIds(juniorRole.id);
    }
  }
} 