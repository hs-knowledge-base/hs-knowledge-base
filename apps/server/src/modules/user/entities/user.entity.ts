import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, comment: "用户名" })
  username: string;

  @Column({ unique: true, comment: "邮箱" })
  email: string;

  @Column()
  password: string;

  @Column({ name: 'is_active', default: true, comment: "是否激活" })
  isActive: boolean;

  @Column({ name: 'first_name', nullable: true, comment: "名字" })
  firstName?: string;

  @Column({ name: 'last_name', nullable: true, comment: "姓氏" })
  lastName?: string;

  @Column('json', { nullable: true, comment: "用户属性" })
  attributes?: Record<string, any>;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: Role[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
