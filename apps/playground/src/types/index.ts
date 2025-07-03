/**
 * 支持的语言类型
 */
export type Language =
  | 'javascript' | 'typescript' | 'python'
  | 'html' | 'css' | 'markdown';

/**
 * 编辑器类型
 */
export type EditorId = 'markup' | 'style' | 'script';

/**
 * Vendor 类别枚举
 */
export enum VendorCategory {
  MONACO = 'monaco',
  COMPILER = 'compiler',
  FRAMEWORK = 'framework',
  TOOL = 'tool',
  STYLE = 'style',
  TEMPLATE = 'template',
  CHART = 'chart',
  ANIMATION = 'animation',
  UTILITY = 'utility',
  TEST = 'test'
}

/**
 * 语言配置接口
 */
export interface LanguageSpecs {
  name: Language;
  title: string;
  longTitle?: string;
  extensions: string[];
  editorType: EditorId;
  monacoLanguage?: string;
  compiler?: {
    category: VendorCategory;
    vendorKey: string;
    needsRuntime?: boolean;
  };
  runtime?: {
    category: VendorCategory;
    vendorKey: string;
  };
  aliases?: string[];
  largeDownload?: boolean;
}

export interface Compiler {
  url?: string;
  factory?: CompilerFactory;
  scripts?: string[] | ((config: any) => string[]);
  scriptType?: string;
  compiledCodeLanguage?: Language;
}

export type CompilerFactory = (config: Config, baseUrl?: string) => Promise<CompilerFunction> | CompilerFunction;
export type CompilerFunction = (code: string, options: CompilerOptions) => Promise<string | CompileResult>;

export interface CompileResult {
  code: string;
  language: Language;
  error?: string;
  info?: any;
}

export interface CompilerOptions {
  config: Config;
  language: Language;
  baseUrl?: string;
}

export interface Config {
  title?: string;
  description?: string;
  markup: EditorConfig;
  style: EditorConfig;
  script: EditorConfig;
  tools?: ToolsConfig;
  theme?: 'light' | 'dark';
  layout?: 'horizontal' | 'vertical';
  autoupdate?: boolean;
  delay?: number;
}

export interface EditorConfig {
  language: Language;
  content: string;
}

export interface ToolsConfig {
  enabled?: string[];
  active?: string;
  status?: 'open' | 'closed' | 'full';
}

export interface CompileResult {
  code: string;
  language: Language;
  error?: string;
}

export interface PlaygroundAPI {
  run: () => Promise<void>;
  getCode: () => Promise<{ markup: string; style: string; script: string }>;
  setCode: (code: Partial<{ markup: string; style: string; script: string }>) => Promise<void>;
  getConfig: () => Promise<Config>;
  setConfig: (config: Partial<Config>) => Promise<void>;
  format: () => Promise<void>;
  destroy: () => Promise<void>;
}

export interface PlaygroundOptions {
  container: HTMLElement | string;
  config?: Partial<Config>;
}

// 事件类型
export interface PlaygroundEvent {
  type: string;
  payload?: any;
}

export type EventHandler = (event: PlaygroundEvent) => void;
