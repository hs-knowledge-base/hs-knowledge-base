import { Repository, FindOptionsWhere, FindManyOptions, FindOneOptions, ObjectLiteral } from 'typeorm';

export interface IBaseRepository<T extends ObjectLiteral> {
  create(entity: Partial<T>): T;
  save(entity: T): Promise<T>;
  findOne(options: FindOneOptions<T>): Promise<T | null>;
  findOneBy(where: FindOptionsWhere<T>): Promise<T | null>;
  find(options?: FindManyOptions<T>): Promise<T[]>;
  findBy(where: FindOptionsWhere<T>): Promise<T[]>;
  update(criteria: FindOptionsWhere<T>, partialEntity: Partial<T>): Promise<void>;
  delete(criteria: FindOptionsWhere<T>): Promise<void>;
  remove(entity: T): Promise<T>;
  count(options?: FindManyOptions<T>): Promise<number>;
}

export abstract class BaseRepository<T extends ObjectLiteral> implements IBaseRepository<T> {
  constructor(protected readonly repository: Repository<T>) {}

  create(entity: Partial<T>): T {
    return this.repository.create(entity as any) as unknown as T;
  }

  async save(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  async findOneBy(where: FindOptionsWhere<T>): Promise<T | null> {
    return this.repository.findOneBy(where);
  }

  async find(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async findBy(where: FindOptionsWhere<T>): Promise<T[]> {
    return this.repository.findBy(where);
  }

  async update(criteria: FindOptionsWhere<T>, partialEntity: Partial<T>): Promise<void> {
    await this.repository.update(criteria, partialEntity as any);
  }

  async delete(criteria: FindOptionsWhere<T>): Promise<void> {
    await this.repository.delete(criteria);
  }

  async remove(entity: T): Promise<T> {
    return this.repository.remove(entity);
  }

  async count(options?: FindManyOptions<T>): Promise<number> {
    return this.repository.count(options);
  }
}
