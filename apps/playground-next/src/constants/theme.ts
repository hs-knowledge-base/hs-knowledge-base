import type { Settings } from '@/types';
import { DEFAULT_LAYOUT_CONFIG } from './layout';

/** 主题配置 */
export const THEME_CONFIG = {
  mode: 'dark' as const,
  primary: '#006fee',
  secondary: '#808085',
  background: '#0d1117',
  foreground: '#e6edf3'
} as const;

/** 默认设置 */
export const DEFAULT_SETTINGS: Settings = {
  theme: {
    mode: 'dark',
    primary: '#006fee',
    secondary: '#808085',
    background: '#0d1117',
    foreground: '#e6edf3'
  },
  editor: {
    fontSize: 14,
    wordWrap: true,
    minimap: false,
    lineNumbers: true,
    autoSave: true
  },
  layout: DEFAULT_LAYOUT_CONFIG,
  compiler: {
    autoRun: false,
    delay: 1000
  }
} as const;
