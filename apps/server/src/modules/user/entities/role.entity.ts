import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Permission } from '../../auth/entities/permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, comment: "角色名称", length: 50 })
  name: string;

  @Column({ nullable: true, comment: "角色描述", length: 200 })
  description?: string;

  @Column({ default: 0, comment: "角色层级，数字越大权限越高" })
  level: number;

  @Column({ default: true, comment: "是否启用" })
  isActive: boolean;

  // RBAC2: 角色层次结构
  @ManyToOne(() => Role, (role) => role.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: Role;

  @OneToMany(() => Role, (role) => role.parent)
  children: Role[];

  @Column('simple-array', { nullable: true, comment: "继承的角色ID列表" })
  inheritedRoleIds?: string[];

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
