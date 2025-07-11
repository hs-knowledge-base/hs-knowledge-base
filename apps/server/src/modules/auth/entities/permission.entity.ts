import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Role } from '../../user/entities/role.entity';

/**
 * 操作类型枚举
 */
export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

/**
 * 资源类型枚举
 */
export enum Subject {
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  DOCUMENT = 'document',
  KNOWLEDGE_BASE = 'knowledge_base',
  SYSTEM = 'system',
  ALL = 'all',
}

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, comment: "操作类型，如 create, read, update, delete, manage" })
  action: string;

  @Column({ length: 50, comment: "资源类型，如 user, role, permission, document, knowledge_base, all" })
  subject: string;

  @Column('json', { nullable: true, comment: "条件限制，如 { department: 'IT', level: { $gte: 3 } }" })
  conditions?: Record<string, any>;

  @Column({ nullable: true, comment: "字段限制，如 'name,email,phone'" })
  fields?: string;

  @Column({ default: false, comment: "是否为禁止权限" })
  inverted: boolean;

  @Column({ nullable: true, comment: "权限说明" })
  reason?: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
