import { CheckPolicies } from '@/modules/auth/guards/permissions.guard';
import { Action, Subject } from '@/modules/auth/entities/permission.entity';
import { AppAbility } from '@/modules/auth/casl/casl-ability.factory';

/**
 * 权限检查装饰器
 * 用于控制器方法的权限验证
 * 
 * @param action 操作类型
 * @param subject 资源类型
 * @returns 装饰器函数
 * 
 * @example
 * ```typescript
 * @RequirePermission(Action.READ, Subject.USER)
 * async findAll() {
 *   // ...
 * }
 * ```
 */
export const RequirePermission = (action: Action, subject: Subject) =>
  CheckPolicies((ability: AppAbility) => ability.can(action, subject));
