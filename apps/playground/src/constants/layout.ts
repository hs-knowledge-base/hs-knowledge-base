import type { LayoutConfig } from '@/types';

/** 默认布局配置 */
export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  direction: 'horizontal',
  editorWidth: 50,
  resultWidth: 50,
  showPreview: true,
  showConsole: true,
  showCompiled: false
};

/** 组件尺寸常量 */
export const COMPONENT_SIZES = {
  HEADER_HEIGHT: 60,
  SIDEBAR_WIDTH: 280,
  MIN_PANEL_WIDTH: 200,
  MIN_PANEL_HEIGHT: 150,
  TOOLBAR_HEIGHT: 40
} as const;

/** 响应式断点 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
} as const;

/** 布局方向选项 */
export const LAYOUT_DIRECTIONS = [
  { key: 'horizontal', label: '水平布局', icon: 'columns' },
  { key: 'vertical', label: '垂直布局', icon: 'rows' }
] as const;

/** 面板配置 */
export const PANEL_CONFIG = {
  MIN_WIDTH: 200,
  MIN_HEIGHT: 150,
  DEFAULT_SPLIT: 50,
  RESIZE_HANDLE_SIZE: 4
} as const;
