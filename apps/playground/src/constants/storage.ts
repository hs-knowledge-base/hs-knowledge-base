/** 本地存储键名 */
export const STORAGE_KEYS = {
  // 编辑器相关
  EDITOR_CONTENT: 'playground-editor-content',
  EDITOR_CONFIG: 'playground-editor-config',
  EDITOR_THEME: 'playground-editor-theme',
  
  // 布局相关
  LAYOUT_CONFIG: 'playground-layout-config',
  PANEL_SIZES: 'playground-panel-sizes',
  
  // 项目相关
  PROJECT_DATA: 'playground-project-data',
  RECENT_PROJECTS: 'playground-recent-projects',
  
  // 用户设置
  USER_SETTINGS: 'playground-user-settings',
  LANGUAGE_PREFERENCES: 'playground-language-preferences',
  
  // 缓存相关
  COMPILER_CACHE: 'playground-compiler-cache',
  VENDOR_CACHE: 'playground-vendor-cache'
} as const;

/** 存储配置 */
export const STORAGE_CONFIG = {
  // 缓存过期时间（毫秒）
  CACHE_EXPIRY: {
    SHORT: 5 * 60 * 1000,      // 5分钟
    MEDIUM: 30 * 60 * 1000,    // 30分钟
    LONG: 24 * 60 * 60 * 1000  // 24小时
  },
  
  // 最大存储大小（字节）
  MAX_SIZE: {
    PROJECT: 1024 * 1024,      // 1MB
    CACHE: 5 * 1024 * 1024,    // 5MB
    TOTAL: 10 * 1024 * 1024    // 10MB
  }
} as const;
