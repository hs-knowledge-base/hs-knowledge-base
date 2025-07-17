import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_PERMISSION_KEY } from '@/core/decorators/require-permission.decorator';
import { User } from '../../user/entities/user.entity';

/**
 * RBAC权限守卫 - 基于权限编码的简单权限检查
 */
@Injectable()
export class RbacPermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<string>(
      REQUIRE_PERMISSION_KEY,
      context.getHandler(),
    );

    if (!requiredPermission) {
      return true; // 没有权限要求则允许访问
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    if (!user) {
      throw new ForbiddenException('用户未登录');
    }

    if (!user.isActive) {
      throw new ForbiddenException('用户已被禁用');
    }

    // 检查用户是否具有所需权限
    const hasPermission = await this.checkUserPermission(user, requiredPermission);
    
    if (!hasPermission) {
      throw new ForbiddenException(`缺少权限: ${requiredPermission}`);
    }

    return true;
  }

  /**
   * 检查用户是否具有指定权限
   */
  private async checkUserPermission(user: User, permissionCode: string): Promise<boolean> {
    if (!user.roles || user.roles.length === 0) {
      return false;
    }

    // 遍历用户的所有角色
    for (const role of user.roles) {
      if (role.permissions && role.permissions.length > 0) {
        // 检查角色的权限列表
        const hasPermission = role.permissions.some(
          permission => permission.code === permissionCode
        );
        
        if (hasPermission) {
          return true;
        }
      }
    }

    return false;
  }
} 