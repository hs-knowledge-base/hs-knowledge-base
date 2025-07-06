/** 颜色配置 */
export const COLORS = {
  PRIMARY: '#006fee',
  SECONDARY: '#808085',
  SUCCESS: '#17c964',
  WARNING: '#f5a524',
  DANGER: '#f31260',
  BACKGROUND: '#0d1117',
  FOREGROUND: '#e6edf3',
  BORDER: '#30363d'
} as const;

/** 字体配置 */
export const FONTS = {
  MONO: ['Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'monospace'],
  SANS: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  SERIF: ['Georgia', 'Times New Roman', 'serif']
} as const;

/** 动画配置 */
export const ANIMATION_CONFIG = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out'
  }
} as const;

/** Z-Index 层级 */
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080
} as const;

/** 阴影配置 */
export const SHADOWS = {
  SM: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  MD: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  LG: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  XL: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
} as const;
