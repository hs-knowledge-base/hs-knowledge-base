import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from '../entities/session.entity';
import { User } from '../../user/entities/user.entity';
import { Role } from '../../user/entities/role.entity';
import { RbacConstraint, ConstraintType } from '../entities/constraint.entity';

/**
 * RBAC2 会话管理服务
 * 管理用户会话和角色激活
 */
@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(UserSession)
    private sessionRepository: Repository<UserSession>,
    @InjectRepository(RbacConstraint)
    private constraintRepository: Repository<RbacConstraint>,
  ) {}

  /**
   * 创建新的用户会话
   */
  async createSession(
    user: User,
    sessionToken: string,
    refreshToken: string,
    clientInfo?: {
      ipAddress?: string;
      userAgent?: string;
      deviceInfo?: string;
    }
  ): Promise<UserSession> {
    const now = new Date();
    
    const session = this.sessionRepository.create({
      user,
      userId: user.id,
      sessionToken,
      refreshToken,
      startTime: now,
      lastActivityTime: now,
      isActive: true,
      ipAddress: clientInfo?.ipAddress,
      userAgent: clientInfo?.userAgent,
      deviceInfo: clientInfo?.deviceInfo,
      // 初始时激活用户的所有角色（可以后续通过activateRole/deactivateRole调整）
      activeRoles: user.roles || [],
    });

    return this.sessionRepository.save(session);
  }

  /**
   * 根据会话令牌获取会话
   */
  async getSessionByToken(sessionToken: string): Promise<UserSession | null> {
    return this.sessionRepository.findOne({
      where: { sessionToken, isActive: true },
      relations: ['user', 'user.roles', 'activeRoles', 'activeRoles.permissions'],
    });
  }

  /**
   * 更新会话活动时间
   */
  async updateActivity(sessionId: string): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      lastActivityTime: new Date(),
    });
  }

  /**
   * 结束会话
   */
  async endSession(sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (session) {
      session.endSession();
      await this.sessionRepository.save(session);
    }
  }

  /**
   * 结束用户的所有会话
   */
  async endAllUserSessions(userId: string): Promise<void> {
    const sessions = await this.sessionRepository.find({
      where: { userId, isActive: true },
    });

    for (const session of sessions) {
      session.endSession();
    }

    await this.sessionRepository.save(sessions);
  }

  /**
   * 清理过期会话
   */
  async cleanupExpiredSessions(): Promise<number> {
    const sessions = await this.sessionRepository.find({
      where: { isActive: true },
    });

    const expiredSessions = sessions.filter(session => session.isExpired());
    
    for (const session of expiredSessions) {
      session.endSession();
    }

    await this.sessionRepository.save(expiredSessions);
    return expiredSessions.length;
  }

  /**
   * 在会话中激活角色
   */
  async activateRole(sessionId: string, roleId: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['user', 'user.roles', 'activeRoles'],
    });

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    if (session.isExpired()) {
      throw new ForbiddenException('会话已过期');
    }

    // 检查用户是否有此角色
    const userHasRole = session.user.roles?.some(role => role.id === roleId);
    if (!userHasRole) {
      throw new ForbiddenException('用户没有此角色');
    }

    // 获取要激活的角色
    const roleToActivate = session.user.roles.find(role => role.id === roleId);
    if (!roleToActivate) {
      throw new NotFoundException('角色不存在');
    }

    // 检查约束条件
    await this.validateRoleActivation(session, roleToActivate);

    // 检查是否已经激活
    const isAlreadyActive = session.activeRoles?.some(role => role.id === roleId);
    if (!isAlreadyActive) {
      session.activeRoles = session.activeRoles || [];
      session.activeRoles.push(roleToActivate);
      await this.sessionRepository.save(session);
    }
  }

  /**
   * 在会话中停用角色
   */
  async deactivateRole(sessionId: string, roleId: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['activeRoles'],
    });

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    if (session.isExpired()) {
      throw new ForbiddenException('会话已过期');
    }

    // 移除角色
    session.activeRoles = session.activeRoles?.filter(role => role.id !== roleId) || [];
    await this.sessionRepository.save(session);
  }

  /**
   * 验证角色激活是否违反约束
   */
  private async validateRoleActivation(session: UserSession, roleToActivate: Role): Promise<void> {
    const constraints = await this.constraintRepository.find({
      where: { isActive: true },
      relations: ['constrainedRoles'],
    });

    for (const constraint of constraints) {
      const constrainedRoleIds = constraint.constrainedRoles.map(r => r.id);
      
      // 检查约束是否适用于要激活的角色
      if (!constrainedRoleIds.includes(roleToActivate.id)) {
        continue;
      }

      switch (constraint.type) {
        case ConstraintType.TEMPORAL:
          if (!constraint.isTimeAllowed()) {
            throw new ForbiddenException(`角色 ${roleToActivate.name} 在当前时间段不可激活`);
          }
          break;

        case ConstraintType.MUTUAL_EXCLUSION:
          const hasConflictingRole = session.activeRoles?.some(activeRole => 
            constrainedRoleIds.includes(activeRole.id) && activeRole.id !== roleToActivate.id
          );
          if (hasConflictingRole) {
            throw new ForbiddenException(`角色 ${roleToActivate.name} 与当前激活的角色冲突`);
          }
          break;

        case ConstraintType.CARDINALITY:
          if (constraint.parameters?.maxRoles) {
            const currentActiveRoles = session.activeRoles?.length || 0;
            if (currentActiveRoles >= constraint.parameters.maxRoles) {
              throw new ForbiddenException(`激活角色数量已达上限 (${constraint.parameters.maxRoles})`);
            }
          }
          break;

        case ConstraintType.SEPARATION_OF_DUTY:
          if (constraint.parameters?.separationType === 'dynamic') {
            const hasSODConflict = session.activeRoles?.some(activeRole => 
              constrainedRoleIds.includes(activeRole.id) && activeRole.id !== roleToActivate.id
            );
            if (hasSODConflict) {
              throw new ForbiddenException(`违反职责分离约束，不能同时激活这些角色`);
            }
          }
          break;
      }
    }
  }

  /**
   * 获取用户的活跃会话
   */
  async getUserActiveSessions(userId: string): Promise<UserSession[]> {
    return this.sessionRepository.find({
      where: { userId, isActive: true },
      relations: ['activeRoles'],
      order: { lastActivityTime: 'DESC' },
    });
  }

  /**
   * 获取会话统计信息
   */
  async getSessionStats(): Promise<{
    totalActiveSessions: number;
    totalUsers: number;
    averageSessionDuration: number;
  }> {
    const activeSessions = await this.sessionRepository.find({
      where: { isActive: true },
    });

    const uniqueUsers = new Set(activeSessions.map(s => s.userId)).size;
    
    let totalDuration = 0;
    let sessionsWithDuration = 0;
    
    for (const session of activeSessions) {
      const duration = session.lastActivityTime.getTime() - session.startTime.getTime();
      if (duration > 0) {
        totalDuration += duration;
        sessionsWithDuration++;
      }
    }

    const averageSessionDuration = sessionsWithDuration > 0 ? 
      totalDuration / sessionsWithDuration : 0;

    return {
      totalActiveSessions: activeSessions.length,
      totalUsers: uniqueUsers,
      averageSessionDuration: Math.round(averageSessionDuration / 1000 / 60), // 转换为分钟
    };
  }
} 