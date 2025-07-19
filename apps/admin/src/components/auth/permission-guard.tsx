'use client'

import React from 'react';
import { useRbac } from '@/hooks/use-rbac';

/**
 * 权限守卫组件的属性接口
 * @interface PermissionGuardProps
 */
interface PermissionGuardProps {
  /** 需要权限保护的子组件 */
  children: React.ReactNode;
  /** 单个权限编码，如 'system.user.edit' */
  permission?: string;
  /** 多个权限编码数组，如 ['system.user.edit', 'system.user.view'] */
  permissions?: string[];
  /** 单个角色名称，如 'admin' */
  role?: string;
  /** 多个角色名称数组，如 ['admin', 'super_admin'] */
  roles?: string[];
  /** 最小角色级别，如 5 */
  level?: number;
  /** 是否需要满足所有条件，默认 false（满足任一条件即可） */
  requireAll?: boolean;
  /** 无权限时显示的后备内容，默认为 null（不显示任何内容） */
  fallback?: React.ReactNode;
}

/**
 * 权限守卫组件
 * 根据用户权限条件控制组件的显示和隐藏
 * 
 * @component
 * @param {PermissionGuardProps} props - 组件属性
 * @returns {JSX.Element} 根据权限检查结果返回子组件或后备内容
 * 
 * @example
 * // 检查单个权限
 * <PermissionGuard permission="system.user.edit">
 *   <Button>编辑用户</Button>
 * </PermissionGuard>
 * 
 * @example
 * // 检查多个权限（满足任一即可）
 * <PermissionGuard permissions={["system.user.edit", "system.user.view"]}>
 *   <Button>操作按钮</Button>
 * </PermissionGuard>
 * 
 * @example
 * // 检查多个权限（必须全部满足）
 * <PermissionGuard permissions={["system.user.edit", "system.role.edit"]} requireAll>
 *   <Button>高级操作</Button>
 * </PermissionGuard>
 * 
 * @example
 * // 检查角色
 * <PermissionGuard role="admin">
 *   <AdminPanel />
 * </PermissionGuard>
 * 
 * @example
 * // 检查角色级别
 * <PermissionGuard level={5}>
 *   <HighLevelFeature />
 * </PermissionGuard>
 * 
 * @example
 * // 提供无权限时的后备内容
 * <PermissionGuard permission="system.user.edit" fallback={<span>无权限</span>}>
 *   <Button>编辑</Button>
 * </PermissionGuard>
 */
export function PermissionGuard({
  children,
  permission,
  permissions,
  role,
  roles,
  level,
  requireAll = false,
  fallback = null,
}: PermissionGuardProps) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasLevel,
  } = useRbac();

  /**
   * 检查权限条件
   * @returns {boolean} 如果用户有权限返回 true，否则返回 false
   */
  const checkPermissions = (): boolean => {

    // 单个权限检查
    if (permission) {
      const hasThisPermission = hasPermission(permission);
      if (!hasThisPermission) {
        return false;
      }
    }

    // 多个权限检查
    if (permissions && permissions.length > 0) {
      if (requireAll) {
        // 需要满足所有权限
        const hasAllPerms = hasAllPermissions(permissions);
        if (!hasAllPerms) {
          return false;
        }
      } else {
        // 满足任一权限即可
        const hasAnyPerms = hasAnyPermission(permissions);
        if (!hasAnyPerms) {
          return false;
        }
      }
    }

    // 单个角色检查
    if (role) {
      const hasThisRole = hasRole(role);
      if (!hasThisRole) {
        return false;
      }
    }

    // 多个角色检查
    if (roles && roles.length > 0) {
      const hasAnyRole = roles.some(r => hasRole(r));
      if (!hasAnyRole) {
        return false;
      }
    }

    // 角色级别检查
    if (level !== undefined) {
      const hasRequiredLevel = hasLevel(level);
      if (!hasRequiredLevel) {
        return false;
      }
    }

    return true;
  };

  const hasAccess = checkPermissions();

  // 如果没有权限，显示后备内容
  if (!hasAccess) {
    return <>{fallback}</>;
  }

  // 有权限，显示子组件
  return <>{children}</>;
} 