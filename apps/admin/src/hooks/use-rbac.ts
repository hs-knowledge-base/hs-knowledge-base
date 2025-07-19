import { useAuth } from '@/contexts/auth-context';

/**
 * RBAC权限检查Hook
 * 基于用户角色和权限进行访问控制
 * 
 * @returns {Object} 包含各种权限检查方法的对象
 * 
 * @example
 * const { hasPermission, hasRole, user } = useRbac();
 * 
 * if (hasPermission('system.user.edit')) {
 *   // 用户有编辑权限
 * }
 */
export const useRbac = () => {
  const { user } = useAuth();

  /**
   * 检查用户是否拥有指定权限
   * @param {string} permissionCode - 权限编码，如 'system.user.edit'
   * @returns {boolean} 如果用户拥有该权限返回 true，否则返回 false
   * 
   * @example
   * const canEdit = hasPermission('system.user.edit');
   */
  const hasPermission = (permissionCode: string): boolean => {
    console.log(user,'user数据')
    if (!user?.roles || user.roles.length === 0) return false;

    return user.roles.some(role =>
      role.permissions?.some(permission => permission.code === permissionCode)
    );
  };

  /**
   * 检查用户是否拥有指定角色
   * @param {string} roleName - 角色名称，如 'admin'
   * @returns {boolean} 如果用户拥有该角色返回 true，否则返回 false
   * 
   * @example
   * const isAdmin = hasRole('admin');
   */
  const hasRole = (roleName: string): boolean => {
    if (!user?.roles) return false;
    return user.roles.some(role => role.name === roleName);
  };

  /**
   * 检查用户角色级别是否大于等于指定级别
   * @param {number} minLevel - 最小级别要求
   * @returns {boolean} 如果用户角色级别满足要求返回 true，否则返回 false
   * 
   * @example
   * const hasHighLevel = hasLevel(5);
   */
  const hasLevel = (minLevel: number): boolean => {
    if (!user?.roles) return false;
    const maxLevel = Math.max(...user.roles.map(role => role.level));
    return maxLevel >= minLevel;
  };

  /**
   * 检查用户是否拥有任一指定权限
   * @param {string[]} permissionCodes - 权限编码数组
   * @returns {boolean} 如果用户拥有任一权限返回 true，否则返回 false
   * 
   * @example
   * const canOperate = hasAnyPermission(['system.user.edit', 'system.user.view']);
   */
  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    if (!user?.roles || user.roles.length === 0) return false;

    return permissionCodes.some(code =>
      user.roles.some(role =>
        role.permissions?.some(permission => permission.code === code)
      )
    );
  };

  /**
   * 检查用户是否拥有所有指定权限
   * @param {string[]} permissionCodes - 权限编码数组
   * @returns {boolean} 如果用户拥有所有权限返回 true，否则返回 false
   * 
   * @example
   * const canFullManage = hasAllPermissions(['system.user.edit', 'system.user.delete']);
   */
  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    if (!user?.roles || user.roles.length === 0) return false;

    return permissionCodes.every(code =>
      user.roles.some(role =>
        role.permissions?.some(permission => permission.code === code)
      )
    );
  };

  /**
   * 获取用户菜单权限（用于菜单渲染）
   * @returns {string[]} 菜单权限编码数组
   * 
   * @example
   * const menuPermissions = getMenuPermissions();
   * // ['system.user', 'system.role']
   */
  const getMenuPermissions = (): string[] => {
    if (!user?.roles || user.roles.length === 0) return [];

    const allPermissions = user.roles.flatMap(role =>
      role.permissions?.map(permission => permission.code) || []
    );

    return allPermissions.filter(code =>
      code.includes('.') && !code.endsWith('.add') &&
      !code.endsWith('.edit') && !code.endsWith('.delete')
    );
  };

  /**
   * 获取用户按钮权限（用于按钮显示控制）
   * @returns {string[]} 按钮权限编码数组
   * 
   * @example
   * const buttonPermissions = getButtonPermissions();
   * // ['system.user.add', 'system.user.edit', 'system.user.delete']
   */
  const getButtonPermissions = (): string[] => {
    if (!user?.roles || user.roles.length === 0) return [];

    const allPermissions = user.roles.flatMap(role =>
      role.permissions?.map(permission => permission.code) || []
    );

    return allPermissions.filter(code =>
      code.endsWith('.add') || code.endsWith('.edit') ||
      code.endsWith('.delete') || code.endsWith('.view')
    );
  };

  /**
   * 检查用户是否为超级管理员
   * @returns {boolean} 如果是超级管理员返回 true，否则返回 false
   * 
   * @example
   * const isSuperUser = isSuperAdmin();
   */
  const isSuperAdmin = (): boolean => {
    return hasRole('super_admin');
  };

  /**
   * 检查用户是否为管理员
   * @returns {boolean} 如果是管理员或超级管理员返回 true，否则返回 false
   * 
   * @example
   * const isAdminUser = isAdmin();
   */
  const isAdmin = (): boolean => {
    return hasRole('admin') || isSuperAdmin();
  };

  return {
    /** 当前登录用户信息 */
    user,
    /** 检查单个权限 */
    hasPermission,
    /** 检查单个角色 */
    hasRole,
    /** 检查角色级别 */
    hasLevel,
    /** 检查任一权限 */
    hasAnyPermission,
    /** 检查所有权限 */
    hasAllPermissions,
    /** 获取菜单权限 */
    getMenuPermissions,
    /** 获取按钮权限 */
    getButtonPermissions,
    /** 是否为超级管理员 */
    isSuperAdmin,
    /** 是否为管理员 */
    isAdmin,
  };
}; 