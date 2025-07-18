import { useRbac } from './use-rbac';

/**
 * 便捷的权限检查Hook
 * 提供更直观的权限检查方法
 */
export const usePermission = () => {
  const rbac = useRbac();

  /**
   * 检查是否有权限执行操作，无权限时显示提示
   */
  const checkAndAlert = (permission: string, action?: string) => {
    if (rbac.hasPermission(permission)) {
      return true;
    }
    alert(`没有${action || '执行该操作的'}权限`);
    return false;
  };

  /**
   * 获取按钮权限检查函数
   */
  const getButtonProps = (permission: string) => ({
    disabled: !rbac.hasPermission(permission),
    title: rbac.hasPermission(permission) ? '' : '没有权限',
  });

  /**
   * 获取带权限检查的点击处理函数
   */
  const withPermissionCheck = (
    permission: string,
    callback: () => void,
    errorMessage?: string
  ) => {
    return () => {
      if (rbac.hasPermission(permission)) {
        callback();
      } else {
        alert(errorMessage || '没有权限执行此操作');
      }
    };
  };

  /**
   * 检查CRUD权限
   */
  const crud = (module: string) => ({
    canView: rbac.hasPermission(`${module}.view`),
    canAdd: rbac.hasPermission(`${module}.add`),
    canEdit: rbac.hasPermission(`${module}.edit`),
    canDelete: rbac.hasPermission(`${module}.delete`),
  });

  return {
    ...rbac,
    checkAndAlert,
    getButtonProps,
    withPermissionCheck,
    crud,
  };
};

/**
 * 专门的权限检查Hook
 */
export const usePermissionCheck = (permission: string) => {
  const { hasPermission } = useRbac();
  return hasPermission(permission);
};

/**
 * 多权限检查Hook
 */
export const usePermissionsCheck = (permissions: string[], requireAll = false) => {
  const { hasAllPermissions, hasAnyPermission } = useRbac();
  return requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
}; 