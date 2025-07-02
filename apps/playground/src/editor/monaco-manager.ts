import * as monaco from 'monaco-editor';
import type { Config } from '@/types';
import { EventEmitter } from '../core/events';
import { Logger } from '../utils/logger';



/** 编辑器管理器 - 基于 Monaco Editor */
export class EditorManager {
  private readonly logger = new Logger('EditorManager');
  private editors = new Map<string, monaco.editor.IStandaloneCodeEditor>();
  private container!: HTMLElement;

  constructor(private eventEmitter: EventEmitter) {}

  /** 初始化 Monaco Editor */
  async initialize(container: HTMLElement): Promise<void> {
    this.logger.info('初始化编辑器管理器');
    this.container = container;

    // 配置 Monaco Editor Workers
    this.configureWorkers();

    // 配置 Monaco Editor
    this.configureMonaco();

    // 创建编辑器界面
    this.createEditorInterface();
  }

  /** 获取代码 */
  async getCode(): Promise<{ markup: string; style: string; script: string }> {
    return {
      markup: this.getEditorValue('markup'),
      style: this.getEditorValue('style'),
      script: this.getEditorValue('script')
    };
  }

  /** 设置代码 */
  async setCode(code: Partial<{ markup: string; style: string; script: string }>): Promise<void> {
    if (code.markup !== undefined) {
      this.setEditorValue('markup', code.markup);
    }
    if (code.style !== undefined) {
      this.setEditorValue('style', code.style);
    }
    if (code.script !== undefined) {
      this.setEditorValue('script', code.script);
    }
  }

  /** 更新配置 */
  async updateConfig(config: Config): Promise<void> {
    await this.setCode({
      markup: config.markup.content,
      style: config.style.content,
      script: config.script.content
    });
  }

  /** 格式化代码 */
  async format(): Promise<void> {
    this.logger.info('格式化代码');
    
    for (const [editorType, editor] of this.editors) {
      if (editor) {
        await editor.getAction('editor.action.formatDocument')?.run();
      }
    }
  }

  /** 销毁编辑器 */
  async destroy(): Promise<void> {
    this.logger.info('销毁编辑器管理器');
    
    for (const editor of this.editors.values()) {
      editor.dispose();
    }
    this.editors.clear();
    
    this.container.innerHTML = '';
  }

  /** 配置 Monaco Editor Workers */
  private configureWorkers(): void {
    // 基于 LiveCodes 的最佳实践配置 Workers
    (self as any).MonacoEnvironment = {
      getWorker: function (_workerId: string, label: string) {
        // 使用动态导入创建 Workers，避免路径问题
        const createWorker = (url: string) => {
          return new Worker(url, {
            type: 'module',
            name: label
          });
        };

        switch (label) {
          case 'json':
            return createWorker(
              new URL('monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url).href
            );
          case 'css':
          case 'scss':
          case 'less':
            return createWorker(
              new URL('monaco-editor/esm/vs/language/css/css.worker.js', import.meta.url).href
            );
          case 'html':
          case 'handlebars':
          case 'razor':
            return createWorker(
              new URL('monaco-editor/esm/vs/language/html/html.worker.js', import.meta.url).href
            );
          case 'typescript':
          case 'javascript':
            return createWorker(
              new URL('monaco-editor/esm/vs/language/typescript/ts.worker.js', import.meta.url).href
            );
          default:
            return createWorker(
              new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url).href
            );
        }
      }
    };
  }

  /** 配置 Monaco Editor */
  private configureMonaco(): void {
    // 设置主题
    monaco.editor.defineTheme('playground-dark', {
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

    monaco.editor.setTheme('playground-dark');

    // 配置语言服务
    this.configureLanguageServices();
  }

  /** 配置语言服务 */
  private configureLanguageServices(): void {
    // 基于 LiveCodes 的编译器选项配置
    const compilerOptions: monaco.languages.typescript.CompilerOptions = {
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      noEmit: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: false,
      skipLibCheck: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      allowJs: true,
      checkJs: false
    };

    // TypeScript 配置
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions);

    // JavaScript 配置
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      ...compilerOptions,
      allowJs: true,
      checkJs: false
    });

    // 基于 LiveCodes 的诊断选项配置
    const diagnosticsOptions: monaco.languages.typescript.DiagnosticsOptions = {
      noSemanticValidation: false,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: false,
      diagnosticCodesToIgnore: [
        2354, // tslib 未找到错误（LiveCodes 忽略的）
        1108, // 'return' statement outside function
        2304, // Cannot find name
        2580, // Cannot find name. Do you need to install type definitions
        7027, // Unreachable code detected
        6133  // Variable is declared but never used
      ]
    };

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(diagnosticsOptions);
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(diagnosticsOptions);

    // 添加常用的类型定义
    this.addCommonTypeDefinitions();
  }

  /** 添加常用类型定义 */
  private addCommonTypeDefinitions(): void {
    // 基于 LiveCodes 的简化类型定义
    const commonTypes = `
      // 全局变量和函数
      declare const console: Console;
      declare function setTimeout(callback: () => void, delay?: number): number;
      declare function setInterval(callback: () => void, delay?: number): number;
      declare function clearTimeout(id: number): void;
      declare function clearInterval(id: number): void;

      // DOM 基础类型
      declare const document: Document;
      declare const window: Window;

      // 常用工具类型
      type Partial<T> = { [P in keyof T]?: T[P] };
      type Required<T> = { [P in keyof T]-?: T[P] };
      type Pick<T, K extends keyof T> = { [P in K]: T[P] };
      type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
    `;

    // 添加类型定义到 TypeScript 和 JavaScript 服务
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      commonTypes,
      'file:///playground-types.d.ts'
    );

    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      commonTypes,
      'file:///playground-types.d.ts'
    );
  }

  /** 创建编辑器界面 */
  private createEditorInterface(): void {
    this.container.innerHTML = `
      <div class="monaco-editor-container">
        <div class="editor-panels">
          <div class="editor-panel" data-editor="markup">
            <div class="panel-header">
              <span class="panel-title">HTML</span>
              <button class="panel-toggle" data-editor="markup">−</button>
            </div>
            <div class="panel-content"></div>
          </div>
          <div class="editor-panel" data-editor="style">
            <div class="panel-header">
              <span class="panel-title">CSS</span>
              <button class="panel-toggle" data-editor="style">−</button>
            </div>
            <div class="panel-content"></div>
          </div>
          <div class="editor-panel" data-editor="script">
            <div class="panel-header">
              <span class="panel-title">JavaScript</span>
              <button class="panel-toggle" data-editor="script">−</button>
            </div>
            <div class="panel-content"></div>
          </div>
        </div>
      </div>
    `;

    this.createEditors();
    this.setupPanelToggling();
    this.applyStyles();
  }

  /** 创建 Monaco 编辑器实例 */
  private createEditors(): void {
    const editorConfigs = [
      { type: 'markup', language: 'html', placeholder: '输入 HTML 代码...' },
      { type: 'style', language: 'css', placeholder: '输入 CSS 代码...' },
      { type: 'script', language: 'javascript', placeholder: '输入 JavaScript 代码...' }
    ];

    editorConfigs.forEach(({ type, language, placeholder }) => {
      const panel = this.container.querySelector(`[data-editor="${type}"] .panel-content`) as HTMLElement;
      
      const editor = monaco.editor.create(panel, {
        value: '',
        language,
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
        glyphMargin: false
      });

      // 监听内容变化
      editor.onDidChangeModelContent(() => {
        this.eventEmitter.emit('code-update', {
          editor: type,
          code: editor.getValue()
        });
      });

      this.editors.set(type, editor);
    });
  }

  /** 设置面板切换 */
  private setupPanelToggling(): void {
    const toggleButtons = this.container.querySelectorAll('.panel-toggle');

    toggleButtons.forEach(button => {
      button.addEventListener('click', () => {
        const editorType = button.getAttribute('data-editor');
        const panel = this.container.querySelector(`[data-editor="${editorType}"]`) as HTMLElement;
        const content = panel.querySelector('.panel-content') as HTMLElement;

        if (panel.classList.contains('collapsed')) {
          // 展开面板
          panel.classList.remove('collapsed');
          button.textContent = '−';
          content.style.display = 'block';
        } else {
          // 折叠面板
          panel.classList.add('collapsed');
          button.textContent = '+';
          content.style.display = 'none';
        }

        // 重新布局所有可见的编辑器
        setTimeout(() => {
          this.editors.forEach(editor => {
            if (editor) {
              editor.layout();
            }
          });
        }, 100);
      });
    });
  }

  /** 获取编辑器值 */
  private getEditorValue(editorType: string): string {
    const editor = this.editors.get(editorType);
    return editor ? editor.getValue() : '';
  }

  /** 设置编辑器值 */
  private setEditorValue(editorType: string, value: string): void {
    const editor = this.editors.get(editorType);
    if (editor) {
      editor.setValue(value);
    }
  }

  /** 应用样式 */
  private applyStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .monaco-editor-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: #1e1e1e;
      }

      .editor-panels {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .editor-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        border-bottom: 1px solid #3e3e3e;
        min-height: 100px;
      }

      .editor-panel:last-child {
        border-bottom: none;
      }

      .editor-panel.collapsed {
        flex: 0 0 auto;
      }

      .panel-header {
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        background: #2d2d30;
        border-bottom: 1px solid #3e3e3e;
        flex-shrink: 0;
      }

      .panel-title {
        font-size: 13px;
        color: #cccccc;
        font-weight: 500;
      }

      .panel-toggle {
        background: none;
        border: none;
        color: #cccccc;
        cursor: pointer;
        font-size: 16px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 2px;
        transition: background 0.2s;
      }

      .panel-toggle:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .panel-content {
        flex: 1;
        min-height: 0;
      }
    `;

    document.head.appendChild(style);
  }
}
