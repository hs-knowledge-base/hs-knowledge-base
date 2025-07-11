import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Role } from '../../user/entities/role.entity';

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

export enum Subject {
  USER = 'User',
  ROLE = 'Role',
  PERMISSION = 'Permission',
  DOCUMENT = 'Document',
  KNOWLEDGE_BASE = 'KnowledgeBase',
  ALL = 'all',
}

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: Action,
  })
  action: Action;

  @Column({
    type: 'enum',
    enum: Subject,
  })
  subject: Subject;

  @Column('json', { nullable: true })
  conditions?: Record<string, any>;

  @Column({ nullable: true })
  fields?: string;

  @Column({ default: false })
  inverted: boolean;

  @Column({ nullable: true })
  reason?: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
