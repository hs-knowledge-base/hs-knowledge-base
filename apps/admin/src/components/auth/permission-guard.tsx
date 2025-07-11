'use client';

import { ReactNode } from 'react';
import { useCurrentUserPermissions } from '@/hooks/use-permissions';
import { Action, Subject } from '@/types/auth';

interface PermissionGuardProps {
  children: ReactNode;
  action: Action;
  subject: Subject;
  conditions?: any;
  fallback?: ReactNode;
  loading?: ReactNode;
}

/**
 * 权限保护组件
 * 根据用户权限决定是否渲染子组件
 */
export function PermissionGuard({
  children,
  action,
  subject,
  conditions,
  fallback = null,
  loading = <div>检查权限中...</div>,
}: PermissionGuardProps) {
  const { hasPermission, loading: permissionLoading } = useCurrentUserPermissions();

  if (permissionLoading) {
    return <>{loading}</>;
  }

  const allowed = hasPermission(action, subject, conditions);

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * 便捷的权限检查组件
 */
export const CanRead = ({ subject, conditions, children, fallback }: Omit<PermissionGuardProps, 'action'>) => (
  <PermissionGuard action={Action.READ} subject={subject} conditions={conditions} fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const CanCreate = ({ subject, conditions, children, fallback }: Omit<PermissionGuardProps, 'action'>) => (
  <PermissionGuard action={Action.CREATE} subject={subject} conditions={conditions} fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const CanUpdate = ({ subject, conditions, children, fallback }: Omit<PermissionGuardProps, 'action'>) => (
  <PermissionGuard action={Action.UPDATE} subject={subject} conditions={conditions} fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const CanDelete = ({ subject, conditions, children, fallback }: Omit<PermissionGuardProps, 'action'>) => (
  <PermissionGuard action={Action.DELETE} subject={subject} conditions={conditions} fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const CanManage = ({ subject, conditions, children, fallback }: Omit<PermissionGuardProps, 'action'>) => (
  <PermissionGuard action={Action.MANAGE} subject={subject} conditions={conditions} fallback={fallback}>
    {children}
  </PermissionGuard>
);
