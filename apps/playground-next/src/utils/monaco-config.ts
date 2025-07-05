import type { EditorConfig } from '@/types';
import { getMonacoLanguageId } from '@/utils/language-utils';
import { EDITOR_FONTS } from '@/constants/editor';

/** Monaco 编辑器默认配置 */
const DEFAULT_MONACO_CONFIG = {
  theme: 'vs-dark',
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
