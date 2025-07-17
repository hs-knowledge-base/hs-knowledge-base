import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Role } from '../../user/entities/role.entity';

/**
 * 用户会话实体 - RBAC2 模型核心组件
 * 用于管理用户的活动会话和在会话中激活的角色
 */
@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ comment: "会话令牌" })
  sessionToken: string;

  @Column({ comment: "刷新令牌" })
  refreshToken: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', comment: "会话开始时间" })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true, comment: "会话结束时间" })
  endTime?: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', comment: "最后活动时间" })
  lastActivityTime: Date;

  @Column({ default: true, comment: "会话是否活跃" })
  isActive: boolean;

  @Column({ nullable: true, comment: "客户端IP地址" })
  ipAddress?: string;

  @Column({ nullable: true, comment: "用户代理信息" })
  userAgent?: string;

  @Column({ nullable: true, comment: "设备信息" })
  deviceInfo?: string;

  // 关联用户
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  // RBAC2: 会话中激活的角色
  @ManyToMany(() => Role)
  @JoinTable({
    name: 'session_roles',
    joinColumn: { name: 'session_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  activeRoles: Role[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * 检查会话是否过期
   */
  isExpired(): boolean {
    if (!this.isActive || this.endTime) {
      return true;
    }
    
    // 检查是否超过最大不活跃时间（例如30分钟）
    const maxInactiveTime = 30 * 60 * 1000; // 30分钟
    const now = new Date();
    return (now.getTime() - this.lastActivityTime.getTime()) > maxInactiveTime;
  }

  /**
   * 更新最后活动时间
   */
  updateActivity(): void {
    this.lastActivityTime = new Date();
  }

  /**
   * 结束会话
   */
  endSession(): void {
    this.isActive = false;
    this.endTime = new Date();
  }
} 