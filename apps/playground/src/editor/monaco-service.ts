import { loadMonaco, getMonaco } from '../utils/monaco-loader';
import { Logger } from '../utils/logger';
import type { Language } from '@/types';

/**
 * Monaco Editor 服务
 * 负责 Monaco Editor 的核心操作，不涉及 UI 管理
 */
export class MonacoService {
  private readonly logger = new Logger('MonacoService');
  private monaco: any = null;

  /** 初始化 Monaco Editor */
  async initialize(): Promise<void> {
    if (this.monaco) {
      return;
    }

    try {
      this.monaco = await loadMonaco();
      this.configureMonaco();
      this.logger.info('Monaco Editor 服务初始化成功');
    } catch (error) {
      this.logger.error('Monaco Editor 服务初始化失败', error);
      throw error;
    }
  }

  /** 创建编辑器实例 */
  createEditor(container: HTMLElement, options: any): any {
    if (!this.monaco) {
      throw new Error('Monaco Editor 未初始化');
    }

    return this.monaco.editor.create(container, {
      theme: 'playground-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: 'on',
      renderWhitespace: 'selection',
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'on',
      folding: true,
      lineDecorationsWidth: 10,
      lineNumbersMinChars: 3,
      glyphMargin: false,
      ...options
    });
  }

  /** 创建模型 */
  createModel(content: string, language: string, uri?: any): any {
    if (!this.monaco) {
      throw new Error('Monaco Editor 未初始化');
    }

    return this.monaco.editor.createModel(content, language, uri);
  }

  /** 创建 URI */
  createUri(path: string): any {
    if (!this.monaco) {
      throw new Error('Monaco Editor 未初始化');
    }

    return this.monaco.Uri.parse(path);
  }

  /** 设置主题 */
  setTheme(theme: string): void {
    if (!this.monaco) {
      throw new Error('Monaco Editor 未初始化');
    }

    this.monaco.editor.setTheme(theme);
  }

  /** 获取 Monaco 实例 */
  getMonaco(): any {
    return this.monaco;
  }

  /** 检查是否已初始化 */
  isInitialized(): boolean {
    return !!this.monaco;
  }

  /** 配置 Monaco Editor */
  private configureMonaco(): void {
    // 设置自定义主题
    this.monaco.editor.defineTheme('playground-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorLineNumber.foreground': '#858585',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41'
      }
    });

    this.monaco.editor.setTheme('playground-dark');

    // 配置 TypeScript 编译选项
    this.configureTypeScript();

    this.logger.info('Monaco Editor 配置完成');
  }

  /** 配置 TypeScript 语言服务 */
  private configureTypeScript(): void {
    const compilerOptions = {
      target: this.monaco.languages.typescript.ScriptTarget.ES2020,
      module: this.monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: this.monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      allowNonTsExtensions: true,
      declaration: false,
      allowJs: true,
      checkJs: false,
      strict: false,
      noImplicitAny: false,
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true
    };

    // 配置 TypeScript
    this.monaco.languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions);
    this.monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false
    });

    // 配置 JavaScript
    this.monaco.languages.typescript.javascriptDefaults.setCompilerOptions(compilerOptions);
    this.monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false
    });

    this.logger.info('TypeScript 语言服务配置完成');
  }

  /** 获取文件扩展名 */
  getFileExtension(language: Language): string {
    const extensionMap: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      html: 'html',
      css: 'css',
      markdown: 'md',
      json: 'json',
      xml: 'xml',
      yaml: 'yml',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      csharp: 'cs',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs',
      swift: 'swift',
      kotlin: 'kt',
      scala: 'scala'
    };

    return extensionMap[language] || 'txt';
  }
}
