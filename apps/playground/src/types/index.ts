/**
 * 支持的语言类型
 */
export type Language =
  | 'javascript' | 'typescript' | 'python'
  | 'html' | 'css' | 'markdown';

export type EditorId = 'markup' | 'style' | 'script';

export interface LanguageSpecs {
  name: Language;
  title: string;
  longTitle?: string;
  compiler: Compiler | Language;
  extensions: string[];
  editor: EditorId;
  editorLanguage?: Language;
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
