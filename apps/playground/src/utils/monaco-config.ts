import type { EditorConfig } from '@/types';
import { getMonacoLanguageId } from '@/utils/language-utils';
import { EDITOR_FONTS } from '@/constants/editor';

/** 获取 Monaco 主题 */
function getMonacoTheme(theme?: string): string {
  // 如果明确指定了主题，使用指定的主题
  if (theme === 'vs-light' || theme === 'vs-dark') {
    return theme;
  }

  // 否则根据系统主题自动选择
  if (typeof window !== 'undefined') {
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? 'vs-dark' : 'vs-light';
  }

  // 服务端渲染时默认使用暗色主题
  return 'vs-dark';
}

/** Monaco 编辑器默认配置 */
const DEFAULT_MONACO_CONFIG = {
  automaticLayout: true,
  scrollBeyondLastLine: false,
  renderWhitespace: 'selection',
  tabSize: 2,
  insertSpaces: true,
  folding: true,
  foldingStrategy: 'indentation',
  showFoldingControls: 'always',
  unfoldOnClickAfterEndOfLine: false,
  contextmenu: true,
  mouseWheelZoom: true,
  smoothScrolling: true,
  cursorBlinking: 'blink',
  cursorSmoothCaretAnimation: 'on',
  renderLineHighlight: 'line'
} as const;

/** 创建 Monaco 编辑器配置 */
export function createMonacoConfig(
  editorConfig: EditorConfig,
  options: {
    value?: string;
    readOnly?: boolean;
    showMinimap?: boolean;
    showLineNumbers?: boolean;
  } = {}
) {
  const {
    value = '',
    readOnly = false,
    showMinimap = false,
    showLineNumbers = true
  } = options;

  return {
    ...DEFAULT_MONACO_CONFIG,
    value,
    language: getMonacoLanguageId(editorConfig.language),
    theme: getMonacoTheme(editorConfig.theme),
    fontSize: editorConfig.fontSize || 14,
    fontFamily: EDITOR_FONTS.MONO.join(', '),
    wordWrap: editorConfig.wordWrap ? 'on' : 'off',
    minimap: { enabled: showMinimap },
    lineNumbers: showLineNumbers ? 'on' : 'off',
    readOnly
  };
}

/** Monaco 编辑器更新配置 */
export function updateMonacoConfig(
  editor: any,
  editorConfig: EditorConfig,
  options: {
    showMinimap?: boolean;
    showLineNumbers?: boolean;
  } = {}
) {
  const {
    showMinimap = false,
    showLineNumbers = true
  } = options;

  editor.updateOptions({
    fontSize: editorConfig.fontSize || 14,
    fontFamily: EDITOR_FONTS.MONO.join(', '),
    wordWrap: editorConfig.wordWrap ? 'on' : 'off',
    minimap: { enabled: showMinimap },
    lineNumbers: showLineNumbers ? 'on' : 'off'
  });
}