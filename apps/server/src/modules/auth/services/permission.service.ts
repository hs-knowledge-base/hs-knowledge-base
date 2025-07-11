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
    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.findAllWithRoles();
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!permission) {
      throw new NotFoundException('权限不存在');
    }

    return permission;
  }

  async update(id: string, updateData: Partial<CreatePermissionDto>): Promise<Permission> {
    const permission = await this.findOne(id);
    Object.assign(permission, updateData);
    return this.permissionRepository.save(permission);
  }

  async remove(id: string): Promise<void> {
    const permission = await this.findOne(id);
    await this.permissionRepository.remove(permission);
  }

  async findByRoleIds(roleIds: string[]): Promise<Permission[]> {
    return this.permissionRepository.findByRoleIds(roleIds);
  }
}
