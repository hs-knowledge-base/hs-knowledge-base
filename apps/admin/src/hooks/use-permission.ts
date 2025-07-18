import { useRbac } from './use-rbac';

/**
 * 便捷的权限检查Hook
 * 提供更直观的权限检查方法和实用工具
 * 
 * @returns 包含所有RBAC方法和额外便捷方法的对象
 * 
 * @example
 * const { checkAndAlert, withPermissionCheck, crud } = usePermission();
 */
export const usePermission = (): object => {
  const rbac = useRbac();

  /**
   * 检查是否有权限执行操作，无权限时显示提示
   * @param permission - 权限编码
   * @param [action] - 操作描述，用于提示信息
   * @returns 如果有权限返回 true，否则显示提示并返回 false
   *
   * @example
   * if (checkAndAlert('system.user.delete', '删除用户')) {
   *   deleteUser(userId);
   * }
   */
  const checkAndAlert = (permission: string, action?: string): boolean => {
    if (rbac.hasPermission(permission)) {
      return true;
    }
    alert(`没有${action || "执行该操作的"}权限`);
    return false;
  };

  /**
   * 获取按钮权限检查函数
   * @param permission - 权限编码
   * @returns 包含 disabled 和 title 属性的对象
   *
   * @example
   * <Button {...getButtonProps('system.user.edit')}>编辑</Button>
   */
  const getButtonProps = (permission: string): object => ({
    disabled: !rbac.hasPermission(permission),
    title: rbac.hasPermission(permission) ? "" : "没有权限",
  });

  /**
   * 获取带权限检查的点击处理函数
   * @param permission - 权限编码
   * @param callback - 有权限时执行的回调函数
   * @param [errorMessage] - 无权限时的错误提示
   * @returns 包装后的点击处理函数
   *
   * @example
   * const handleEdit = withPermissionCheck(
   *   'system.user.edit',
   *   () => editUser(user),
   *   '没有编辑用户的权限'
   * );
   */
  const withPermissionCheck = (
    permission: string,
    callback: () => void,
    errorMessage?: string,
  ): Function => {
    return () => {
      if (rbac.hasPermission(permission)) {
        callback();
      } else {
        alert(errorMessage || "没有权限执行此操作");
      }
    };
  };

  /**
   * 检查CRUD权限
   * @param module - 模块名称，如 'system.user'
   * @returns 包含各种CRUD权限检查结果的对象
   *
   * @example
   * const userPermissions = crud('system.user');
   * if (userPermissions.canEdit) {
   *   // 显示编辑按钮
   * }
   */
  const crud = (module: string): object => ({
    /** 是否可以查看 */
    canView: rbac.hasPermission(`${module}.view`),
    /** 是否可以新增 */
    canAdd: rbac.hasPermission(`${module}.add`),
    /** 是否可以编辑 */
    canEdit: rbac.hasPermission(`${module}.edit`),
    /** 是否可以删除 */
    canDelete: rbac.hasPermission(`${module}.delete`),
  });

  return {
    ...rbac,
    /** 检查权限并显示提示 */
    checkAndAlert,
    /** 获取按钮属性 */
    getButtonProps,
    /** 带权限检查的回调包装器 */
    withPermissionCheck,
    /** CRUD权限检查 */
    crud,
  };
};

/**
 * 专门的权限检查Hook
 * @param permission - 权限编码
 * @returns 是否拥有该权限
 * 
 * @example
 * const canEdit = usePermissionCheck('system.user.edit');
 */
export const usePermissionCheck = (permission: string): boolean => {
  const { hasPermission } = useRbac();
  return hasPermission(permission);
};

/**
 * 多权限检查Hook
 * @param permissions - 权限编码数组
 * @param [requireAll=false] - 是否需要所有权限，默认 false
 * @returns 权限检查结果
 * 
 * @example
 * const hasEditOrView = usePermissionsCheck(['system.user.edit', 'system.user.view']);
 * const hasEditAndDelete = usePermissionsCheck(['system.user.edit', 'system.user.delete'], true);
 */
export const usePermissionsCheck = (permissions: string[], requireAll = false): boolean => {
  const { hasAllPermissions, hasAnyPermission } = useRbac();
  return requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
}; 