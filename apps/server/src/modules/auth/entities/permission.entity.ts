import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Role } from '../../user/entities/role.entity';

/**
 * 权限类型枚举
 */
export enum PermissionType {
  /**模块权限*/
  MODULE = 'module',
  /**菜单权限*/
  MENU = 'menu',
  /**按钮权限*/
  BUTTON = 'button',
}

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true, comment: "权限编码" })
  code: string;

  @Column({ length: 100, comment: "权限名称" })
  name: string;

  @Column({ length: 50, comment: "权限类型" })
  type: PermissionType;

  @Column({ nullable: true, comment: "权限描述" })
  description?: string;

  @Column({ nullable: true, comment: "前端路由路径" })
  path?: string;

  @Column({ nullable: true, comment: "图标" })
  icon?: string;

  @Column({ default: 0, comment: "排序" })
  sort: number;

  @Column({ default: true, comment: "是否启用" })
  isActive: boolean;

  // 树形结构
  @ManyToOne(() => Permission, (permission) => permission.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: Permission;

  @OneToMany(() => Permission, (permission) => permission.parent)
  children: Permission[];

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
