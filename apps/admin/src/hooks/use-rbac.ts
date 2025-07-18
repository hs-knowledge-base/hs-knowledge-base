import { useAuth } from '@/contexts/auth-context';

/**
 * RBAC权限检查Hook
 * 基于用户角色和权限进行访问控制
 */
export const useRbac = () => {
  const { user } = useAuth();

  /**
   * 检查用户是否拥有指定权限
   */
  const hasPermission = (permissionCode: string): boolean => {
    if (!user?.allPermissions) return false;
    return user.allPermissions.includes(permissionCode);
  };

  /**
   * 检查用户是否拥有指定角色
   */
  const hasRole = (roleName: string): boolean => {
    if (!user?.roles) return false;
    return user.roles.some(role => role.name === roleName);
  };

  /**
   * 检查用户角色级别是否大于等于指定级别
   */
  const hasLevel = (minLevel: number): boolean => {
    if (!user?.roles) return false;
    const maxLevel = Math.max(...user.roles.map(role => role.level));
    return maxLevel >= minLevel;
  };

  /**
   * 检查用户是否拥有任一指定权限
   */
  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    if (!user?.allPermissions) return false;
    return permissionCodes.some(code => user.allPermissions?.includes(code));
  };

  /**
   * 检查用户是否拥有所有指定权限
   */
  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    if (!user?.allPermissions) return false;
    return permissionCodes.every(code => user.allPermissions?.includes(code));
  };

  /**
   * 获取用户菜单权限（用于菜单渲染）
   */
  const getMenuPermissions = () => {
    if (!user?.allPermissions) return [];
    return user.allPermissions.filter(code => 
      code.includes('.') && !code.endsWith('.add') && 
      !code.endsWith('.edit') && !code.endsWith('.delete')
    );
  };

  /**
   * 获取用户按钮权限（用于按钮显示控制）
   */
  const getButtonPermissions = () => {
    if (!user?.allPermissions) return [];
    return user.allPermissions.filter(code => 
      code.endsWith('.add') || code.endsWith('.edit') || 
      code.endsWith('.delete') || code.endsWith('.view')
    );
  };

  /**
   * 检查用户是否为超级管理员
   */
  const isSuperAdmin = (): boolean => {
    return hasRole('super_admin');
  };

  /**
   * 检查用户是否为管理员
   */
  const isAdmin = (): boolean => {
    return hasRole('admin') || isSuperAdmin();
  };

  return {
    user,
    hasPermission,
    hasRole,
    hasLevel,
    hasAnyPermission,
    hasAllPermissions,
    getMenuPermissions,
    getButtonPermissions,
    isSuperAdmin,
    isAdmin,
  };
}; 