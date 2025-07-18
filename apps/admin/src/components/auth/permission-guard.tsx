'use client'

import React from 'react';
import { useRbac } from '@/hooks/use-rbac';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  role?: string;
  roles?: string[];
  level?: number;
  requireAll?: boolean; // 是否需要满足所有条件，默认false（满足任一条件即可）
  fallback?: React.ReactNode; // 无权限时显示的内容
}

/**
 * 权限守卫组件
 * 根据用户权限条件控制组件的显示和隐藏
 * 
 * @example
 * // 检查单个权限
 * <PermissionGuard permission="system.user.edit">
 *   <Button>编辑用户</Button>
 * </PermissionGuard>
 * 
 * // 检查多个权限（满足任一即可）
 * <PermissionGuard permissions={["system.user.edit", "system.user.view"]}>
 *   <Button>操作按钮</Button>
 * </PermissionGuard>
 * 
 * // 检查多个权限（必须全部满足）
 * <PermissionGuard permissions={["system.user.edit", "system.role.edit"]} requireAll>
 *   <Button>高级操作</Button>
 * </PermissionGuard>
 * 
 * // 检查角色
 * <PermissionGuard role="admin">
 *   <AdminPanel />
 * </PermissionGuard>
 * 
 * // 检查角色级别
 * <PermissionGuard level={5}>
 *   <HighLevelFeature />
 * </PermissionGuard>
 * 
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

  // 检查权限条件
  const checkPermissions = () => {
    // 单个权限检查
    if (permission && !hasPermission(permission)) {
      return false;
    }

    // 多个权限检查
    if (permissions && permissions.length > 0) {
      if (requireAll) {
        if (!hasAllPermissions(permissions)) {
          return false;
        }
      } else {
        if (!hasAnyPermission(permissions)) {
          return false;
        }
      }
    }

    // 单个角色检查
    if (role && !hasRole(role)) {
      return false;
    }

    // 多个角色检查
    if (roles && roles.length > 0) {
      const hasAnyRole = roles.some(r => hasRole(r));
      if (!hasAnyRole) {
        return false;
      }
    }

    // 角色级别检查
    if (level !== undefined && !hasLevel(level)) {
      return false;
    }

    return true;
  };

  const hasAccess = checkPermissions();

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
} 