import { useRequest } from 'alova/client';
import { permissionApi, userApi } from '@/lib/api';
import { Action, Subject, PermissionCheckRequest } from '@/types/auth';
import { useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';

// 权限检查 Hook
export function usePermissionCheck() {
  const checkPermission = async (request: PermissionCheckRequest) => {
    try {
      const response = await permissionApi.checkPermission(request);
      return response.allowed;
    } catch (error) {
      console.error('权限检查失败:', error);
      return false;
    }
  };

  return { checkPermission };
}

// 用户权限 Hook
export function useUserPermissions(userId?: string) {
  const {
    data: user,
    loading,
    error,
  } = useRequest(
    () => userApi.getUser(userId!),
    {
      immediate: !!userId,
    }
  );

  const permissions = useMemo(() => {
    if (!user?.roles) return [];
    
    const allPermissions = user.roles.flatMap(role => role.permissions || []);
    return allPermissions;
  }, [user]);

  const hasPermission = (action: Action, subject: Subject, conditions?: any) => {
    if (!permissions.length) return false;

    return permissions.some(permission => {
      // 检查基本权限匹配
      const actionMatch = permission.action === action || permission.action === Action.MANAGE;
      const subjectMatch = permission.subject === subject || permission.subject === Subject.ALL;

      if (!actionMatch || !subjectMatch) return false;

      // 如果是禁止权限，返回 false
      if (permission.inverted) return false;

      // 简单的条件检查（实际项目中需要更复杂的逻辑）
      if (permission.conditions && conditions) {
        return Object.keys(permission.conditions).every(key => {
          const permissionValue = permission.conditions![key];
          const conditionValue = conditions[key];
          
          if (typeof permissionValue === 'object' && permissionValue.$gte !== undefined) {
            return conditionValue >= permissionValue.$gte;
          }
          
          return permissionValue === conditionValue;
        });
      }

      return true;
    });
  };

  const canRead = (subject: Subject, conditions?: any) => hasPermission(Action.READ, subject, conditions);
  const canCreate = (subject: Subject, conditions?: any) => hasPermission(Action.CREATE, subject, conditions);
  const canUpdate = (subject: Subject, conditions?: any) => hasPermission(Action.UPDATE, subject, conditions);
  const canDelete = (subject: Subject, conditions?: any) => hasPermission(Action.DELETE, subject, conditions);
  const canManage = (subject: Subject, conditions?: any) => hasPermission(Action.MANAGE, subject, conditions);

  return {
    user,
    permissions,
    loading,
    error,
    hasPermission,
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    canManage,
  };
}

// 当前用户权限 Hook（集成认证系统）
export function useCurrentUserPermissions() {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user?.roles) return [];

    const allPermissions = user.roles.flatMap(role => role.permissions || []);
    return allPermissions;
  }, [user]);

  const hasPermission = (action: Action, subject: Subject, conditions?: any) => {
    if (!permissions.length) return false;

    return permissions.some(permission => {
      // 检查基本权限匹配
      const actionMatch = permission.action === action || permission.action === Action.MANAGE;
      const subjectMatch = permission.subject === subject || permission.subject === Subject.ALL;

      if (!actionMatch || !subjectMatch) return false;

      // 如果是禁止权限，返回 false
      if (permission.inverted) return false;

      // 简单的条件检查（实际项目中需要更复杂的逻辑）
      if (permission.conditions && conditions) {
        return Object.keys(permission.conditions).every(key => {
          const permissionValue = permission.conditions![key];
          const conditionValue = conditions[key];

          if (typeof permissionValue === 'object' && permissionValue.$gte !== undefined) {
            return conditionValue >= permissionValue.$gte;
          }

          return permissionValue === conditionValue;
        });
      }

      return true;
    });
  };

  const canRead = (subject: Subject, conditions?: any) => hasPermission(Action.READ, subject, conditions);
  const canCreate = (subject: Subject, conditions?: any) => hasPermission(Action.CREATE, subject, conditions);
  const canUpdate = (subject: Subject, conditions?: any) => hasPermission(Action.UPDATE, subject, conditions);
  const canDelete = (subject: Subject, conditions?: any) => hasPermission(Action.DELETE, subject, conditions);
  const canManage = (subject: Subject, conditions?: any) => hasPermission(Action.MANAGE, subject, conditions);

  return {
    user,
    permissions,
    loading: false,
    error: null,
    hasPermission,
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    canManage,
  };
}
