// 基础类型定义

/** 支持的编程语言 */
export type Language =
  | 'html' | 'markdown'
  | 'css' | 'scss' | 'less'
  | 'javascript' | 'typescript'
  | 'python' | 'go' | 'php' | 'java'
  | 'json' | 'xml' | 'yaml';

/** 编辑器类型 */
export type EditorType = 'markup' | 'style' | 'script';

/** 编辑器配置 */
export interface EditorConfig {
  language: Language;
  theme: 'vs-dark' | 'vs-light';
  fontSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
}

/** 代码内容 */
export interface CodeContent {
  markup: string;
  style: string;
  script: string;
}

/** 编译结果 */
export interface CompileResult {
  code: string;
  error?: string;
  sourceMap?: string;
}

/** 编译器配置 */
export interface CompilerConfig {
  markup: EditorConfig;
  style: EditorConfig;
  script: EditorConfig;
}

/** 布局配置 */
export interface LayoutConfig {
  direction: 'horizontal' | 'vertical';
  editorWidth: number;
  resultWidth: number;
  showPreview: boolean;
  showConsole: boolean;
  showCompiled: boolean;
}

/** 控制台消息 */
export interface ConsoleMessage {
  id: string;
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: number;
  args?: any[];
}

/** 编译错误 */
export interface CompileError {
  message: string;
  line?: number;
  column?: number;
  file?: string;
}

/** 运行状态 */
export type RunStatus = 'idle' | 'compiling' | 'running' | 'success' | 'error';

/** 主题配置 */
export interface ThemeConfig {
  mode: 'light' | 'dark';
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
}

/** 设置配置 */
export interface Settings {
  theme: ThemeConfig;
  editor: {
    fontSize: number;
    wordWrap: boolean;
    minimap: boolean;
    lineNumbers: boolean;
    autoSave: boolean;
  };
  layout: LayoutConfig;
  compiler: {
    autoRun: boolean;
    delay: number;
  };
}

/** 项目模板 */
export interface Template {
  id: string;
  name: string;
  description: string;
  code: CodeContent;
  config: CompilerConfig;
  tags: string[];
}

/** 用户项目 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  code: CodeContent;
  config: CompilerConfig;
  createdAt: number;
  updatedAt: number;
}

/** 导出/导入格式 */
export interface ExportData {
  version: string;
  project: Project;
  settings: Settings;
}

/** 事件类型 */
export interface PlaygroundEvents {
  'code-change': { type: EditorType; code: string };
  'language-change': { type: EditorType; language: Language };
  'run-code': { code: CodeContent; config: CompilerConfig };
  'compile-complete': { results: Record<EditorType, CompileResult> };
  'console-message': ConsoleMessage;
  'layout-change': LayoutConfig;
  'theme-change': ThemeConfig;
  'settings-change': Settings;
}

/** API 响应 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** 资源加载状态 */
export interface ResourceStatus {
  monaco: 'loading' | 'loaded' | 'error';
  compilers: Record<Language, 'loading' | 'loaded' | 'error'>;
}

/** 快捷键配置 */
export interface KeyBinding {
  key: string;
  command: string;
  description: string;
}

/** 插件接口 */
export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  activate: () => void;
  deactivate: () => void;
}

/** 语言服务配置 */
export interface LanguageServiceConfig {
  language: Language;
  extensions: string[];
  compiler?: string;
  formatter?: string;
  linter?: string;
}

/** CDN 配置 */
export interface CDNConfig {
  name: string;
  baseUrl: string;
  timeout: number;
  retries: number;
}

/** 性能指标 */
export interface PerformanceMetrics {
  loadTime: number;
  compileTime: number;
  runTime: number;
  memoryUsage: number;
}

/** 错误边界状态 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

/** 组件 Props 基础类型 */
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

/** 模态框 Props */
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/** 按钮 Props */
export interface ButtonProps extends BaseComponentProps {
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
}

/** 输入框 Props */
export interface InputProps extends BaseComponentProps {
  value?: string;
  placeholder?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  onChange?: (value: string) => void;
}

/** 选择器 Props */
export interface SelectProps extends BaseComponentProps {
  value?: string;
  placeholder?: string;
  options: Array<{ key: string; label: string; value: string }>;
  isDisabled?: boolean;
  onChange?: (value: string) => void;
}
