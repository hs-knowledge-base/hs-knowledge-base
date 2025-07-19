import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from '../../user/entities/role.entity';

/**
 * 约束类型枚举
 */
export enum ConstraintType {
  /**
   * 互斥约束 - 一个用户不能同时拥有两个互斥的角色
   */
  MUTUAL_EXCLUSION = 'mutual_exclusion',
  
  /**
   * 基数约束 - 限制角色的最大用户数或用户的最大角色数
   */
  CARDINALITY = 'cardinality',
  
  /**
   * 先决条件约束 - 拥有某个角色之前必须先拥有另一个角色
   */
  PREREQUISITE = 'prerequisite',
  
  /**
   * 时间约束 - 角色只能在特定时间段内激活
   */
  TEMPORAL = 'temporal',
  
  /**
   * 分离约束 - 静态分离（不能同时分配）和动态分离（不能同时激活）
   */
  SEPARATION_OF_DUTY = 'separation_of_duty',
}

/**
 * RBAC约束实体 - RBAC2 模型核心组件
 * 用于定义和实施各种访问控制约束
 */
@Entity('rbac_constraints')
export class RbacConstraint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: "约束名称" })
  name: string;

  @Column({ nullable: true, comment: "约束描述" })
  description?: string;

  @Column({
    type: 'enum',
    enum: ConstraintType,
    comment: "约束类型"
  })
  type: ConstraintType;

  @Column({ default: true, comment: "是否启用" })
  isActive: boolean;

  @Column('json', { nullable: true, comment: "约束参数配置" })
  parameters?: {
    // 基数约束参数
    maxUsers?: number;        // 最大用户数
    maxRoles?: number;        // 最大角色数
    
    // 时间约束参数
    startTime?: string;       // 开始时间 (HH:mm)
    endTime?: string;         // 结束时间 (HH:mm)
    allowedDays?: number[];   // 允许的星期几 (0-6)
    
    // 分离约束参数
    separationType?: 'static' | 'dynamic';  // 静态或动态分离
    minRoles?: number;        // 最小角色数量
  };

  // 受约束的角色
  @ManyToMany(() => Role)
  @JoinTable({
    name: 'constraint_roles',
    joinColumn: { name: 'constraint_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  constrainedRoles: Role[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * 检查当前时间是否在约束允许的时间范围内
   */
  isTimeAllowed(): boolean {
    if (this.type !== ConstraintType.TEMPORAL || !this.parameters) {
      return true;
    }

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // 检查星期几
    if (this.parameters.allowedDays && !this.parameters.allowedDays.includes(currentDay)) {
      return false;
    }

    // 检查时间范围
    if (this.parameters.startTime && this.parameters.endTime) {
      const [startHour, startMin] = this.parameters.startTime.split(':').map(Number);
      const [endHour, endMin] = this.parameters.endTime.split(':').map(Number);
      
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;

      if (currentTime < startTime || currentTime > endTime) {
        return false;
      }
    }

    return true;
  }

  /**
   * 验证角色分配是否违反约束
   */
  validateRoleAssignment(userRoles: Role[], newRole: Role): boolean {
    if (!this.isActive) {
      return true;
    }

    const constrainedRoleIds = this.constrainedRoles.map(r => r.id);
    
    switch (this.type) {
      case ConstraintType.MUTUAL_EXCLUSION:
        // 检查是否已有互斥角色
        return !userRoles.some(role => constrainedRoleIds.includes(role.id));
        
      case ConstraintType.CARDINALITY:
        // 检查角色数量限制
        if (this.parameters?.maxRoles) {
          return userRoles.length < this.parameters.maxRoles;
        }
        return true;
        
      case ConstraintType.PREREQUISITE:
        // 检查先决条件（这里需要更复杂的逻辑来定义先决条件关系）
        return true;
        
      default:
        return true;
    }
  }
} 