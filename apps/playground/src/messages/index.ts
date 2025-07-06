/** 错误消息 */
export const ERROR_MESSAGES = {
  // 编译错误
  COMPILE_FAILED: '代码编译失败',
  COMPILE_TIMEOUT: '编译超时，请检查代码复杂度',
  SYNTAX_ERROR: '语法错误，请检查代码格式',
  
  // 运行时错误
  RUNTIME_ERROR: '代码运行时出错',
  EXECUTION_TIMEOUT: '代码执行超时',
  MEMORY_LIMIT: '内存使用超出限制',
  
  // 网络错误
  NETWORK_ERROR: '网络连接失败',
  CDN_LOAD_FAILED: 'CDN 资源加载失败',
  RESOURCE_NOT_FOUND: '资源文件未找到',
  
  // 文件操作错误
  FILE_TOO_LARGE: '文件大小超出限制',
  INVALID_FILE_TYPE: '不支持的文件类型',
  SAVE_FAILED: '保存失败',
  LOAD_FAILED: '加载失败',
  
  // 权限错误
  PERMISSION_DENIED: '权限不足',
  ACCESS_FORBIDDEN: '访问被禁止',
  
  // 通用错误
  UNKNOWN_ERROR: '未知错误',
  OPERATION_FAILED: '操作失败',
  INVALID_INPUT: '输入无效'
} as const;

/** 成功消息 */
export const SUCCESS_MESSAGES = {
  COMPILE_SUCCESS: '编译成功',
  EXECUTION_SUCCESS: '运行成功',
  SAVE_SUCCESS: '保存成功',
  LOAD_SUCCESS: '加载成功',
  EXPORT_SUCCESS: '导出成功',
  IMPORT_SUCCESS: '导入成功',
  RESET_SUCCESS: '重置成功',
  COPY_SUCCESS: '复制成功'
} as const;

/** 信息提示消息 */
export const INFO_MESSAGES = {
  COMPILING: '正在编译...',
  EXECUTING: '正在运行...',
  LOADING: '正在加载...',
  SAVING: '正在保存...',
  EXPORTING: '正在导出...',
  IMPORTING: '正在导入...',
  INITIALIZING: '正在初始化...',
  PREPARING: '正在准备...'
} as const;

/** 警告消息 */
export const WARNING_MESSAGES = {
  UNSAVED_CHANGES: '有未保存的更改',
  LARGE_FILE: '文件较大，可能影响性能',
  DEPRECATED_FEATURE: '此功能已废弃',
  EXPERIMENTAL_FEATURE: '这是实验性功能',
  BROWSER_COMPATIBILITY: '浏览器兼容性警告',
  PERFORMANCE_WARNING: '性能警告'
} as const;

/** 用户提示消息 */
export const HINT_MESSAGES = {
  FIRST_TIME: '欢迎使用代码演练场！',
  KEYBOARD_SHORTCUTS: '按 Ctrl+Enter 运行代码',
  SAVE_REMINDER: '记得保存你的代码',
  SHARE_TIP: '可以分享你的代码给其他人',
  PERFORMANCE_TIP: '大型项目建议分模块编写',
  DEBUGGING_TIP: '使用 console.log 调试代码'
} as const;
