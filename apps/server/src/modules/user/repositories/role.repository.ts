import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly repository: Repository<Role>,
  ) {}

  async findByName(name: string): Promise<Role | null> {
    return this.repository.findOne({
      where: { name },
      relations: ['permissions'],
    });
  }

  async findWithPermissions(id: number): Promise<Role | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['permissions'],
    });
  }

  async findAllWithPermissions(): Promise<Role[]> {
    return this.repository.find({
      relations: ['permissions'],
    });
  }

  async findAll(): Promise<Role[]> {
    return this.repository.find();
  }

  async findOne(id: number): Promise<Role | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['permissions', 'parent', 'children'],
    });
  }

  async findByIds(ids: number[]): Promise<Role[]> {
    return this.repository.findByIds(ids);
  }

  async create(roleData: Partial<Role>): Promise<Role> {
    const role = this.repository.create(roleData);
    return this.repository.save(role);
  }

  async update(id: number, roleData: Partial<Role>): Promise<Role | null> {
    await this.repository.update(id, roleData);
    return this.findOne(id);
  }

  async save(role: Role): Promise<Role> {
    return this.repository.save(role);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.repository.count({ where: { name } });
    return count > 0;
  }

  async count(): Promise<number> {
    return this.repository.count();
  }
}
