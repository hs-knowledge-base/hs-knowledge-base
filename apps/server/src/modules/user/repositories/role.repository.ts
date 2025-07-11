import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { BaseRepository } from './base.repository';

export interface IRoleRepository {
  findByName(name: string): Promise<Role | null>;
  findWithPermissions(id: string): Promise<Role | null>;
  findAllWithPermissions(): Promise<Role[]>;
  findByIds(ids: string[]): Promise<Role[]>;
  existsByName(name: string): Promise<boolean>;
}

@Injectable()
export class RoleRepository extends BaseRepository<Role> implements IRoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {
    super(roleRepository);
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
  }

  async findWithPermissions(id: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
  }

  async findAllWithPermissions(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['permissions'],
    });
  }

  async findByIds(ids: string[]): Promise<Role[]> {
    return this.roleRepository.findByIds(ids);
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.roleRepository.count({ where: { name } });
    return count > 0;
  }
}
