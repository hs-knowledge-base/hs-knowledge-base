import type { Config, Language } from '@/types';
import { EventEmitter } from '../core/events';
import { Logger } from '../utils/logger';
import { MonacoService } from './monaco-service';
import { EditorUI } from './editor-ui';
import { loadMonacoLanguage } from '../utils/monaco-language-loader';
import { languageService } from '../services/language-service';

/** 编辑器管理器 - 协调 Monaco 服务和 UI */
export class EditorManager {
  private readonly logger = new Logger('EditorManager');
  private container!: HTMLElement;
  private monacoService = new MonacoService();
  private editorUI!: EditorUI;
  private editors = new Map<string, any>();

  constructor(private eventEmitter: EventEmitter) {
    this.editorUI = new EditorUI(this.handleLanguageChange.bind(this));
  }

  /** 初始化编辑器管理器 */
  async initialize(container: HTMLElement): Promise<void> {
    this.logger.info('初始化编辑器管理器');
    this.container = container;

    try {
      // 初始化 Monaco 服务
      await this.monacoService.initialize();

      // 创建编辑器界面
      this.editorUI.createEditorInterface(container);

      // 创建编辑器实例
      this.createEditors();

      this.logger.info('编辑器管理器初始化成功');
    } catch (error) {
      this.logger.error('编辑器管理器初始化失败', error);
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

    this.editors.forEach(async (editor) => {
      if (editor) {
        await editor.getAction('editor.action.formatDocument')?.run();
      }
    });
  }

  /** 创建编辑器实例 */
  private createEditors(): void {
    const editorConfigs = [
      { type: 'markup', language: 'html', extension: 'html' },
      { type: 'style', language: 'css', extension: 'css' },
      { type: 'script', language: 'javascript', extension: 'js' }
    ];

    editorConfigs.forEach((config) => {
      const { type, language, extension } = config;
      const container = this.editorUI.getEditorContainer(type);

      if (!container) {
        this.logger.error(`找不到编辑器容器: ${type}`);
        return;
      }

      // 创建模型
      const uri = this.monacoService.createUri(`file:///playground/${type}.${extension}`);
      const model = this.monacoService.createModel('', language, uri);

      // 创建编辑器
      const editor = this.monacoService.createEditor(container, { model });

      // 监听内容变化
      editor.onDidChangeModelContent(() => {
        this.eventEmitter.emit('code-update', {
          editor: type,
          code: editor.getValue()
        });
      });

      this.editors.set(type, editor);

      // 异步加载语言支持
      loadMonacoLanguage(language).catch(error => {
        this.logger.warn(`加载语言 ${language} 失败`, error);
      });
    });
  }

  /** 处理语言切换 */
  private async handleLanguageChange(editorType: string, language: Language): Promise<void> {
    this.logger.info(`处理语言切换: ${editorType} -> ${language}`);

    const editor = this.editors.get(editorType);
    if (!editor) {
      this.logger.warn(`编辑器 ${editorType} 不存在`);
      return;
    }

    try {
      // 动态加载语言支持
      await loadMonacoLanguage(language);

      // 获取当前内容
      const currentValue = editor.getValue();

      // 创建新模型
      const extension = this.monacoService.getFileExtension(language);
      const newUri = this.monacoService.createUri(`file:///playground/${editorType}.${extension}`);

      // 检查是否已存在相同 URI 的模型
      const existingModel = this.monacoService.getMonaco().editor.getModel(newUri);
      if (existingModel && existingModel !== editor.getModel()) {
        existingModel.dispose();
      }

      // 创建新模型并设置到编辑器
      const newModel = this.monacoService.createModel(currentValue, language, newUri);
      const oldModel = editor.getModel();
      editor.setModel(newModel);

      // 释放旧模型
      if (oldModel) {
        oldModel.dispose();
      }

      // 更新 UI
      this.editorUI.updatePanelTitle(editorType, language);

      // 触发事件
      this.eventEmitter.emit('language-change', {
        editorType,
        language
      });

      this.logger.info(`语言切换完成: ${editorType} -> ${language}`);
    } catch (error) {
      this.logger.error(`语言切换失败: ${editorType} -> ${language}`, error);
    }
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

  /** 销毁编辑器 */
  async destroy(): Promise<void> {
    this.editors.forEach(editor => {
      if (editor) {
        editor.dispose();
      }
    });
    this.editors.clear();
    this.logger.info('编辑器管理器已销毁');
  }
}
