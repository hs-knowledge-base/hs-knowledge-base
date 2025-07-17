import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacAbilityFactory, RbacAbility } from '../casl/rbac-ability.factory';
import { User } from '../../user/entities/user.entity';

export interface RequiredRule {
  action: string;
  subject: string;
}

export type PolicyHandler = (ability: RbacAbility) => boolean;

export interface IPolicyHandler {
  handle(ability: RbacAbility): boolean;
}

export type PolicyHandlerCallback = PolicyHandler | IPolicyHandler;

export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...handlers: PolicyHandlerCallback[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);

/**
 * RBAC权限守卫
 * 基于RBAC2模型的权限检查守卫
 */
@Injectable()
export class RbacPermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacAbilityFactory: RbacAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandlerCallback[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    if (policyHandlers.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    if (!user) {
      throw new ForbiddenException('用户未认证，请先登录');
    }

    if (!user.isActive) {
      throw new ForbiddenException('用户已被禁用');
    }

    // 创建RBAC权限检查器
    const ability = this.rbacAbilityFactory.createForUser(user);

    // 检查所有权限策略
    const hasPermission = policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
    );

    if (!hasPermission) {
      throw new ForbiddenException('权限不足，无法执行此操作');
    }

    // 将ability添加到请求上下文，供后续使用
    request.rbacAbility = ability;

    return hasPermission;
  }

  private execPolicyHandler(handler: PolicyHandlerCallback, ability: RbacAbility): boolean {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
} 