import { CheckPolicies } from '@/modules/auth/guards/rbac-permissions.guard';
import { RbacAbility } from '@/modules/auth/casl/rbac-ability.factory';

/**
 * RBAC权限检查装饰器
 * 用于控制器方法的权限验证，基于UI层次权限编码
 * 
 * @param permissionCode 权限编码
 * @returns 装饰器函数
 * 
 * @example
 * ```typescript
 * @RequirePermission('user-list-btn')
 * async findAll() {
 *   // ...
 * }
 * ```
 */
export const RequirePermission = (permissionCode: string) =>
  CheckPolicies((ability: RbacAbility) => ability.can(permissionCode));


