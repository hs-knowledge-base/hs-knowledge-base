import type * as Monaco from 'monaco-editor';
import type { Config, Language } from '../types';
import { EventEmitter } from '../core/events';
import { Logger } from '../utils/logger';
import { loadMonaco } from '../utils/monaco-loader';
import { loadMonacoLanguage } from '../utils/monaco-language-loader';
import { LanguageSelector } from '../ui/language-selector';
import { getLanguageDisplayName, getLanguageConfig } from '../services/language-service';



/** 编辑器管理器 - 基于 Monaco Editor */
export class EditorManager {
  private readonly logger = new Logger('EditorManager');
  private editors = new Map<string, Monaco.editor.IStandaloneCodeEditor>();
  private languageSelectors = new Map<string, LanguageSelector>();
  private container!: HTMLElement;
  private monaco!: typeof Monaco;

  constructor(private eventEmitter: EventEmitter) {}

  /** 初始化 Monaco Editor */
  async initialize(container: HTMLElement): Promise<void> {
    this.logger.info('初始化编辑器管理器');
    this.container = container;

    try {
      // 动态加载 Monaco Editor (AMD 版本会自动配置 Workers)
      this.monaco = await loadMonaco();
      this.logger.info('Monaco Editor 加载成功');

      // 配置 Monaco Editor
      this.configureMonaco();

      // 创建编辑器界面
      this.createEditorInterface();
    } catch (error) {
      this.logger.error('Monaco Editor 初始化失败', error);
      throw error;
    }
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

    this.editors.forEach(async (editor, editorType) => {
      if (editor) {
        await editor.getAction('editor.action.formatDocument')?.run();
      }
    });
  }

  /** 更新面板标题 */
  private updatePanelTitle(editorType: string, language: Language): void {
    const panelTitle = this.container.querySelector(`[data-editor="${editorType}"] .panel-title`) as HTMLElement;
    if (panelTitle) {
      const displayName = getLanguageDisplayName(language);
      panelTitle.textContent = displayName;
      this.logger.info(`面板 ${editorType} 标题已更新为 ${displayName}`);
    }
  }

  /** 设置编辑器语言 */
  async setLanguage(editorType: string, language: Language): Promise<void> {
    this.logger.info(`开始设置编辑器语言: ${editorType} -> ${language}`);

    const editor = this.editors.get(editorType);
    if (!editor) {
      this.logger.warn(`编辑器 ${editorType} 不存在`);
      return;
    }

    try {
      // 动态加载语言支持
      await loadMonacoLanguage(language);

      // 设置编辑器语言
      const model = editor.getModel();
      if (model) {
        const oldLanguage = model.getLanguageId();
        this.logger.info(`编辑器 ${editorType} 当前语言: ${oldLanguage}, 目标语言: ${language}`);

        // 获取当前内容
        const currentValue = model.getValue();

        // 创建新的模型，使用正确的文件扩展名
        const extension = this.getFileExtension(language);
        const newUri = this.monaco.Uri.parse(`file:///playground/${editorType}.${extension}`);

        // 检查是否已存在相同 URI 的模型
        const existingModel = this.monaco.editor.getModel(newUri);
        if (existingModel && existingModel !== model) {
          existingModel.dispose();
        }

        // 创建新模型
        const newModel = this.monaco.editor.createModel(currentValue, language, newUri);

        // 设置新模型到编辑器
        editor.setModel(newModel);

        // 释放旧模型
        model.dispose();

        // 验证语言设置是否生效
        const finalLanguage = newModel.getLanguageId();
        this.logger.info(`编辑器 ${editorType} 语言设置完成: ${oldLanguage} -> ${finalLanguage}`);
        this.logger.info(`编辑器 ${editorType} URI 更新为: ${newUri.toString()}`);

        if (finalLanguage !== language) {
          this.logger.warn(`语言设置可能失败: 期望 ${language}, 实际 ${finalLanguage}`);
        }
      }

      // 更新面板标题
      this.updatePanelTitle(editorType, language);

      // 触发语言变化事件
      this.logger.info(`触发语言变化事件: ${editorType} -> ${language}`);
      this.eventEmitter.emit('language-change', {
        editorType,
        language
      });

    } catch (error) {
      this.logger.error(`设置编辑器 ${editorType} 语言 ${language} 失败`, error);
    }
  }

  /** 根据语言获取文件扩展名 */
  private getFileExtension(language: Language): string {
    const config = getLanguageConfig(language);
    return config?.extensions[0] || 'txt';
  }

  /** 销毁编辑器 */
  async destroy(): Promise<void> {
    this.logger.info('销毁编辑器管理器');

    // 销毁编辑器实例
    this.editors.forEach((editor) => {
      editor.dispose();
    });
    this.editors.clear();

    // 销毁语言选择器
    this.languageSelectors.forEach((selector) => {
      selector.destroy();
    });
    this.languageSelectors.clear();

    this.container.innerHTML = '';
  }



  /** 配置 Monaco Editor */
  private configureMonaco(): void {
    // 设置主题
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

    // 配置语言服务
    this.configureLanguageServices();
  }

  /** 配置 Monaco Editor 基础服务 */
  private configureLanguageServices(): void {
    // Monaco Editor 只需要配置基础的编辑器选项
    // 具体的语言编译和处理由 compilers 目录下的编译器负责

    this.configureBasicEditorOptions();

    this.logger.info('Monaco Editor 基础服务已配置');
  }

  /** 配置基础编辑器选项 */
  private configureBasicEditorOptions(): void {
    // 只配置 Monaco Editor 自身需要的基础选项
    // 不涉及具体语言的编译逻辑

    // TypeScript/JavaScript 的基础编辑器配置（仅用于语法高亮和智能提示）
    const basicCompilerOptions: Monaco.languages.typescript.CompilerOptions = {
      target: this.monaco.languages.typescript.ScriptTarget.ES2020,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      allowNonTsExtensions: true,
      moduleResolution: this.monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: this.monaco.languages.typescript.ModuleKind.ESNext,
      noEmit: true, // 重要：Monaco Editor 不负责编译输出
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: false,
      skipLibCheck: true,
      jsx: this.monaco.languages.typescript.JsxEmit.React,
      allowJs: true,
      checkJs: false
    };

    // 配置 TypeScript 编辑器服务（仅用于编辑器功能）
    this.monaco.languages.typescript.typescriptDefaults.setCompilerOptions(basicCompilerOptions);

    // 配置 JavaScript 编辑器服务（仅用于编辑器功能）
    this.monaco.languages.typescript.javascriptDefaults.setCompilerOptions(basicCompilerOptions);
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
    this.createLanguageSelectors();
    this.setupPanelToggling();
    this.applyStyles();
  }

  /** 创建 Monaco 编辑器实例 */
  private createEditors(): void {
    const editorConfigs = [
      { type: 'markup' as const, language: 'html' as const, placeholder: '输入 HTML 代码...', extension: 'html' as const },
      { type: 'style' as const, language: 'css' as const, placeholder: '输入 CSS 代码...', extension: 'css' as const },
      { type: 'script' as const, language: 'javascript' as const, placeholder: '输入 JavaScript 代码...', extension: 'js' as const }
    ];

    editorConfigs.forEach((config) => {
      const { type, language, placeholder, extension } = config;
      const panel = this.container.querySelector(`[data-editor="${type}"] .panel-content`) as HTMLElement;

      // 创建具有正确 URI 的模型
      const uri = this.monaco.Uri.parse(`file:///playground/${type}.${extension}`);
      const model = this.monaco.editor.createModel('', language, uri);

      const editor = this.monaco.editor.create(panel, {
        model,
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

      // 异步加载语言支持（不阻塞编辑器创建）
      loadMonacoLanguage(language).catch(error => {
        this.logger.warn(`加载语言 ${language} 失败`, error);
      });
    });
  }

  /** 创建语言选择器 */
  private createLanguageSelectors(): void {
    const editorConfigs = [
      { type: 'markup' as const, language: 'html' as const },
      { type: 'style' as const, language: 'css' as const },
      { type: 'script' as const, language: 'javascript' as const }
    ];

    editorConfigs.forEach((config) => {
      const { type, language } = config;
      const panelHeader = this.container.querySelector(`[data-editor="${type}"] .panel-header`) as HTMLElement;

      if (panelHeader) {
        const selector = new LanguageSelector({
          container: panelHeader,
          editorType: type,
          currentLanguage: language,
          onLanguageChange: (newLanguage) => {
            this.setLanguage(type, newLanguage);
          }
        });

        this.languageSelectors.set(type, selector);
      }
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
