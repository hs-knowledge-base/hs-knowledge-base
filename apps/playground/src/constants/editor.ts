import type {EditorConfig, MarkupLanguage, StyleLanguage, ScriptLanguage, Language} from '@/types';

/** 默认语言配置 */
export const DEFAULT_LANGUAGES = {
  markup: 'html' as MarkupLanguage,
  style: 'css' as StyleLanguage,
  script: 'javascript' as ScriptLanguage
} as const;

/** 默认编辑器配置 */
export const DEFAULT_EDITOR_CONFIG: EditorConfig = {
  language: 'javascript',
  theme: 'vs-dark',
  fontSize: 14,
  wordWrap: true,
  minimap: false,
  lineNumbers: true
};

/** 创建类型安全的编辑器配置 */
export function createEditorConfig<T extends Language>(
  language: T,
  overrides?: Partial<Omit<EditorConfig, 'language'>>
): EditorConfig & { language: T } {
  return {
    ...DEFAULT_EDITOR_CONFIG,
    ...overrides,
    language
  };
}

/** Monaco Editor 主题映射 */
export const MONACO_THEMES = {
  'vs-dark': 'vs-dark',
  'vs-light': 'vs'
} as const;

/** 编辑器快捷键配置 */
export const EDITOR_SHORTCUTS = [
  { key: 'Ctrl+Enter', command: 'run', description: '运行代码' },
  { key: 'Ctrl+S', command: 'save', description: '保存项目' },
  { key: 'Ctrl+Shift+F', command: 'format', description: '格式化代码' },
  { key: 'F11', command: 'fullscreen', description: '切换全屏' },
  { key: 'Ctrl+/', command: 'comment', description: '切换注释' },
  { key: 'Ctrl+D', command: 'duplicate', description: '复制行' },
  { key: 'Alt+Up', command: 'move-up', description: '向上移动行' },
  { key: 'Alt+Down', command: 'move-down', description: '向下移动行' }
] as const;

/** 编辑器字体配置 */
export const EDITOR_FONTS = {
  MONO: ['Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'monospace'],
  SANS: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
} as const;

/** 编辑器类型标签 */
export const EDITOR_TYPE_LABELS = {
  markup: '标记',
  style: '样式',
  script: '脚本'
} as const;
