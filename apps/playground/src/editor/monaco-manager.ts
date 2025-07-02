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
    // 配置 Monaco Editor 的 worker
    (self as any).MonacoEnvironment = {
      getWorkerUrl: function (moduleId: string, label: string) {
        if (label === 'json') {
          return './monaco-editor/esm/vs/language/json/json.worker.js';
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
          return './monaco-editor/esm/vs/language/css/css.worker.js';
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
          return './monaco-editor/esm/vs/language/html/html.worker.js';
        }
        if (label === 'typescript' || label === 'javascript') {
          return './monaco-editor/esm/vs/language/typescript/ts.worker.js';
        }
        return './monaco-editor/esm/vs/editor/editor.worker.js';
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
    // TypeScript 配置
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      allowJs: true,
      typeRoots: ['node_modules/@types']
    });

    // JavaScript 配置
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      allowJs: true
    });

    // 禁用一些不需要的诊断
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: true
    });
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
