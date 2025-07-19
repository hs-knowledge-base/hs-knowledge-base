import { SetMetadata } from '@nestjs/common';

/**
 * 权限元数据键
 */
export const REQUIRE_PERMISSION_KEY = 'require_permission';

/**
 * RBAC权限检查装饰器
 * 用于控制器方法的权限验证，基于权限编码
 * 
 * @param permissionCode 权限编码，如 'system.user.view'
 * @returns 装饰器函数
 * 
 * @example
 * ```typescript
 * @RequirePermission('system.user.view')
 * async findAll() {
 *   // 需要用户查看权限
 * }
 * ```
 */
export const RequirePermission = (permissionCode: string) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, permissionCode);


