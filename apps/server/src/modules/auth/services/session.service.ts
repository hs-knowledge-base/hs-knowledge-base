import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from '../entities/session.entity';
import { User } from '../../user/entities/user.entity';
import { Role } from '../../user/entities/role.entity';

/**
 * 会话管理服务 - RBAC2 模型核心组件
 * 管理用户会话和会话中的角色激活
 */
@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * 创建新的用户会话
   */
  async createSession(
    userId: number,
    sessionToken: string,
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
    deviceInfo?: string
  ): Promise<UserSession> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const session = this.sessionRepository.create({
      sessionToken,
      refreshToken,
      userId,
      user,
      ipAddress,
      userAgent,
      deviceInfo,
      activeRoles: [], // 初始时没有激活任何角色
    });

    return this.sessionRepository.save(session);
  }

  /**
   * 更新会话的最后活动时间
   */
  async updateLastActivity(sessionId: number): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      lastActivityTime: new Date(),
    });
  }

  /**
   * 根据会话令牌查找会话
   */
  async findBySessionToken(sessionToken: string): Promise<UserSession | null> {
    return this.sessionRepository.findOne({
      where: { sessionToken, isActive: true },
      relations: ['user', 'user.roles', 'activeRoles'],
    });
  }

  /**
   * 获取会话详情
   */
  async getSession(sessionId: number): Promise<UserSession> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['user', 'user.roles', 'activeRoles'],
    });

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    return session;
  }

  /**
   * 获取用户的所有活跃会话
   */
  async getUserActiveSessions(userId: number): Promise<UserSession[]> {
    return this.sessionRepository.find({
      where: { userId, isActive: true },
      relations: ['activeRoles'],
      order: { lastActivityTime: 'DESC' },
    });
  }

  /**
   * 结束会话
   */
  async endSession(sessionId: number): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      isActive: false,
      endTime: new Date(),
    });
  }

  /**
   * 在会话中激活角色
   */
  async activateRole(sessionId: number, roleId: number): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['user', 'user.roles', 'activeRoles'],
    });

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    // 检查用户是否拥有该角色
    const userHasRole = session.user.roles?.some(role => role.id === roleId);
    if (!userHasRole) {
      throw new BadRequestException('用户没有该角色');
    }

    // 获取要激活的角色
    const roleToActivate = session.user.roles.find(role => role.id === roleId);
    if (!roleToActivate) {
      throw new NotFoundException('角色不存在');
    }

    // 检查角色是否已经激活
    const isAlreadyActive = session.activeRoles?.some(role => role.id === roleId);
    if (isAlreadyActive) {
      throw new BadRequestException('角色已经激活');
    }

    // 激活角色
    if (!session.activeRoles) {
      session.activeRoles = [];
    }
    session.activeRoles.push(roleToActivate);

    await this.sessionRepository.save(session);
  }

  /**
   * 在会话中停用角色
   */
  async deactivateRole(sessionId: number, roleId: number): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['activeRoles'],
    });

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    // 从活跃角色中移除指定角色
    session.activeRoles = session.activeRoles?.filter(role => role.id !== roleId) || [];

    await this.sessionRepository.save(session);
  }

  /**
   * 获取会话中的活跃角色
   */
  async getSessionActiveRoles(sessionId: number): Promise<Role[]> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['activeRoles'],
    });

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    return session.activeRoles || [];
  }

  /**
   * 检查会话中是否有指定的活跃角色
   */
  async hasActiveRole(sessionId: number, roleId: number): Promise<boolean> {
    const activeRoles = await this.getSessionActiveRoles(sessionId);
    return activeRoles.some(role => role.id === roleId);
  }

  /**
   * 清理过期会话
   */
  async cleanupExpiredSessions(): Promise<void> {
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() - 24); // 24小时后过期

    await this.sessionRepository
      .createQueryBuilder()
      .update(UserSession)
      .set({
        isActive: false,
        endTime: new Date(),
      })
      .where('lastActivityTime < :expirationTime AND isActive = :isActive', {
        expirationTime,
        isActive: true,
      })
      .execute();
  }

  /**
   * 获取用户的会话统计
   */
  async getUserSessionStats(userId: number): Promise<{
    totalSessions: number;
    activeSessions: number;
    lastLoginTime?: Date;
  }> {
    const totalSessions = await this.sessionRepository.count({
      where: { userId },
    });

    const activeSessions = await this.sessionRepository.count({
      where: { userId, isActive: true },
    });

    const lastSession = await this.sessionRepository.findOne({
      where: { userId },
      order: { startTime: 'DESC' },
    });

    return {
      totalSessions,
      activeSessions,
      lastLoginTime: lastSession?.startTime,
    };
  }
} 