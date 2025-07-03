import type { Config, PlaygroundOptions, PlaygroundAPI, EventHandler } from '@/types';
import { EventEmitter } from './events';
import { CompilerFactory } from '../compiler/compiler-factory';
import { EditorManager } from '../editor/monaco-manager.ts';
import { CodeRunner } from '../runner/code-runner';
import { LayoutManager } from '../ui/layout-manager';
import { Logger } from '../utils/logger';

/** 主要的 Playground 类 */
export class Playground implements PlaygroundAPI {
  private readonly logger = new Logger('Playground');
  private readonly eventEmitter = new EventEmitter();
  private readonly compilerFactory = new CompilerFactory();
  private readonly editorManager: EditorManager;
  private readonly codeRunner: CodeRunner;
  private readonly layoutManager: LayoutManager;
  
  private config: Config;
  private isDestroyed = false;

  constructor(private options: PlaygroundOptions) {
    this.logger.info('初始化 Playground');

    // 初始化配置 - 合并默认配置和用户配置
    const defaultConfig = this.getDefaultConfig();
    this.config = {
      ...defaultConfig,
      ...this.options.config
    };
    
    // 初始化各个管理器（依赖注入）
    this.layoutManager = new LayoutManager(this.getContainer(), this.eventEmitter);
    this.editorManager = new EditorManager(this.eventEmitter);
    this.codeRunner = new CodeRunner(this.compilerFactory, this.eventEmitter);
    
    this.setupEventHandlers();
  }

  /** 初始化 Playground */
  async initialize(): Promise<void> {
    if (this.isDestroyed) {
      throw new Error('Playground 已被销毁');
    }

    try {
      this.logger.info('开始初始化各个子系统');

      // 1. 初始化编译器工厂
      await this.compilerFactory.initializeBuiltinCompilers();

      // 2. 初始化布局
      await this.layoutManager.initialize();

      // 3. 初始化编辑器
      await this.editorManager.initialize(this.layoutManager.getEditorContainer());

      // 4. 初始化代码运行器
      await this.codeRunner.initialize(this.layoutManager.getResultContainer());

      // 5. 设置初始代码
      await this.setConfig(this.config);

      // 6. 触发就绪事件
      this.eventEmitter.emit('ready', {});

      this.logger.info('Playground 初始化完成');
      
    } catch (error) {
      this.logger.error('初始化失败:', error);
      this.eventEmitter.emit('error', { error });
      throw error;
    }
  }

  /** 运行代码 */
  async run(): Promise<void> {
    if (this.isDestroyed) return;

    try {
      this.logger.info('开始运行代码');

      // 更新运行按钮状态
      this.updateRunButtonState('running');

      const code = await this.getCode();
      await this.codeRunner.run(code, this.config);

      this.eventEmitter.emit('run', { code });
      this.updateRunButtonState('success');

    } catch (error) {
      this.logger.error('运行代码失败:', error);
      this.eventEmitter.emit('error', { error });
      this.updateRunButtonState('error');
      throw error;
    }
  }

  private updateRunButtonState(state: 'idle' | 'running' | 'success' | 'error'): void {
    const runBtn = document.querySelector('.run-btn') as HTMLButtonElement;
    if (!runBtn) return;

    // 移除所有状态类
    runBtn.classList.remove('running', 'success', 'error');

    const icon = runBtn.querySelector('svg');
    const text = runBtn.querySelector('span');

    switch (state) {
      case 'running':
        runBtn.classList.add('running');
        runBtn.disabled = true;
        if (text) text.textContent = '运行中...';
        break;
      case 'success':
        runBtn.classList.add('success');
        runBtn.disabled = false;
        if (text) text.textContent = '运行';
        setTimeout(() => {
          runBtn.classList.remove('success');
        }, 1000);
        break;
      case 'error':
        runBtn.classList.add('error');
        runBtn.disabled = false;
        if (text) text.textContent = '运行';
        setTimeout(() => {
          runBtn.classList.remove('error');
        }, 2000);
        break;
      default:
        runBtn.disabled = false;
        if (text) text.textContent = '运行';
    }
  }

  /**
   * 获取代码
   */
  async getCode(): Promise<{ markup: string; style: string; script: string }> {
    return this.editorManager.getCode();
  }

  /**
   * 设置代码
   */
  async setCode(code: Partial<{ markup: string; style: string; script: string }>): Promise<void> {
    await this.editorManager.setCode(code);
    this.eventEmitter.emit('code-update', { code });
  }

  /**
   * 获取配置
   */
  async getConfig(): Promise<Config> {
    return { ...this.config };
  }

  /**
   * 设置配置
   */
  async setConfig(config: Partial<Config>): Promise<void> {
    this.config = { ...this.config, ...config };
    
    // 更新各个子系统
    await this.editorManager.updateConfig(this.config);
    await this.layoutManager.updateConfig(this.config);
    
    this.eventEmitter.emit('config-update', { config: this.config });
  }

  /**
   * 格式化代码
   */
  async format(): Promise<void> {
    await this.editorManager.format();
  }

  /**
   * 监听事件
   */
  on(event: string, handler: EventHandler): void {
    this.eventEmitter.on(event, handler);
  }

  /**
   * 移除事件监听
   */
  off(event: string, handler: EventHandler): void {
    this.eventEmitter.off(event, handler);
  }

  /**
   * 销毁 Playground
   */
  async destroy(): Promise<void> {
    if (this.isDestroyed) return;
    
    this.logger.info('销毁 Playground');
    
    this.isDestroyed = true;
    
    // 销毁各个子系统
    await this.editorManager.destroy();
    await this.codeRunner.destroy();
    await this.layoutManager.destroy();
    
    // 清理事件监听器
    this.eventEmitter.removeAllListeners();
    
    this.logger.info('Playground 已销毁');
  }

  private getContainer(): HTMLElement {
    const { container } = this.options;
    
    if (typeof container === 'string') {
      const element = document.querySelector(container);
      if (!element) {
        throw new Error(`找不到容器元素: ${container}`);
      }
      return element as HTMLElement;
    }
    
    return container;
  }

  private setupEventHandlers(): void {
    // 代码更新时只更新布局，不自动运行
    this.eventEmitter.on('code-update', async (event) => {
      this.logger.info('收到代码更新事件:', event);

      // 更新结果显示模式
      const code = await this.getCode();
      this.logger.info('当前代码状态:', {
        markupLength: code.markup.length,
        styleLength: code.style.length,
        scriptLength: code.script.length
      });

      // 调用布局管理器的方法
      if (this.layoutManager && typeof (this.layoutManager as any).updateResultDisplayByCode === 'function') {
        (this.layoutManager as any).updateResultDisplayByCode(code);
      }
    });

    // 监听运行请求
    this.eventEmitter.on('run-requested', () => {
      this.logger.info('用户请求运行代码');
      this.run().catch(error => {
        this.logger.error('运行失败:', error);
      });
    });

    // 监听格式化请求
    this.eventEmitter.on('format-requested', () => {
      this.logger.info('用户请求格式化代码');
      this.format().catch(error => {
        this.logger.error('格式化失败:', error);
      });
    });

    // 监听设置请求
    this.eventEmitter.on('settings-requested', () => {
      this.logger.info('用户请求打开设置');
      // TODO: 实现设置面板
    });

    // 监听语言变化
    this.eventEmitter.on('language-change', (event) => {
      this.logger.info('收到语言变化事件:', event);

      // 处理事件数据结构（可能有 payload 包装）
      const eventData = event.payload || event;
      const { editorType, language } = eventData;

      if (!editorType || !language) {
        this.logger.warn('语言变化事件数据不完整:', eventData);
        return;
      }

      // 更新配置中的语言设置
      if (editorType === 'markup') {
        this.config.markup.language = language;
        this.logger.info(`Markup 语言已更新: ${language}`);
      } else if (editorType === 'style') {
        this.config.style.language = language;
        this.logger.info(`Style 语言已更新: ${language}`);
      } else if (editorType === 'script') {
        this.config.script.language = language;
        this.logger.info(`Script 语言已更新: ${language}`);
      }

      this.logger.info(`当前配置:`, {
        markup: this.config.markup.language,
        style: this.config.style.language,
        script: this.config.script.language
      });
    });
  }

  private getDefaultConfig(): Config {
    return {
      title: '火山知识库 - 代码演练场',
      markup: { language: 'html', content: '' },
      style: { language: 'css', content: '' },
      script: { language: 'javascript', content: '' },
      theme: 'dark',
      layout: 'horizontal',
      autoupdate: false,
      delay: 1500
    };
  }
}

/** 创建 Playground 实例的工厂函数 */
export async function createPlayground(options: PlaygroundOptions): Promise<Playground> {
  const playground = new Playground(options);
  await playground.initialize();
  return playground;
}
