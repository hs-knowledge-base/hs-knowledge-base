/** 事件名称常量 */
export const EVENT_NAMES = {
  // 代码相关事件
  CODE_CHANGE: 'code-change',
  CODE_SAVE: 'code-save',
  CODE_LOAD: 'code-load',
  CODE_RESET: 'code-reset',
  
  // 语言相关事件
  LANGUAGE_CHANGE: 'language-change',
  LANGUAGE_LOAD: 'language-load',
  
  // 编译相关事件
  COMPILE_START: 'compile-start',
  COMPILE_COMPLETE: 'compile-complete',
  COMPILE_ERROR: 'compile-error',
  
  // 运行相关事件
  RUN_CODE: 'run-code',
  RUN_START: 'run-start',
  RUN_COMPLETE: 'run-complete',
  RUN_ERROR: 'run-error',
  
  // 控制台相关事件
  CONSOLE_MESSAGE: 'console-message',
  CONSOLE_CLEAR: 'console-clear',
  
  // 布局相关事件
  LAYOUT_CHANGE: 'layout-change',
  PANEL_RESIZE: 'panel-resize',
  FULLSCREEN_TOGGLE: 'fullscreen-toggle',
  
  // 主题相关事件
  THEME_CHANGE: 'theme-change',
  
  // 设置相关事件
  SETTINGS_CHANGE: 'settings-change',
  SETTINGS_SAVE: 'settings-save',
  SETTINGS_LOAD: 'settings-load',
  
  // 项目相关事件
  PROJECT_NEW: 'project-new',
  PROJECT_SAVE: 'project-save',
  PROJECT_LOAD: 'project-load',
  PROJECT_EXPORT: 'project-export',
  PROJECT_IMPORT: 'project-import',
  
  // 错误相关事件
  ERROR_OCCURRED: 'error-occurred',
  WARNING_OCCURRED: 'warning-occurred'
} as const;

/** 事件类型定义 */
export type EventName = typeof EVENT_NAMES[keyof typeof EVENT_NAMES];
