import type { Config, PlaygroundOptions, PlaygroundAPI, EventHandler } from '@/types';
import { EventEmitter } from './events';
import { CompilerFactory } from '../compiler/compiler-factory';
import { EditorManager } from '../editor/monaco-manager';
import { CodeRunner } from '../runner/code-runner';
import { LayoutManager } from '../ui/layout-manager';
import { Logger } from '../utils/logger';
import { ConfigManager } from './config-manager';
import { ServiceContainer } from './service-container';

/**
 * 主要的 Playground 类 - 重构后的版本
 * 职责：协调各个服务，提供统一的 API 接口
 */
export class Playground implements PlaygroundAPI {
  private readonly logger = new Logger('Playground');
  private readonly serviceContainer: ServiceContainer;
  private readonly configManager: ConfigManager;

  private isDestroyed = false;
  private isInitialized = false;

  constructor(private options: PlaygroundOptions) {
    this.logger.info('初始化 Playground');

    // 创建服务容器
    this.serviceContainer = new ServiceContainer();

    // 创建配置管理器
    this.configManager = new ConfigManager(this.options.config);

    // 注册核心服务
    this.registerCoreServices();

    // 设置事件处理
    this.setupEventHandlers();
  }

  /** 注册核心服务到容器 */
  private registerCoreServices(): void {
    const eventEmitter = new EventEmitter();
    const compilerFactory = new CompilerFactory();

    // 注册服务
    this.serviceContainer.register('eventEmitter', eventEmitter);
    this.serviceContainer.register('compilerFactory', compilerFactory);
    this.serviceContainer.register('configManager', this.configManager);

    // 注册管理器（延迟创建）
    this.serviceContainer.registerFactory('layoutManager', () =>
      new LayoutManager(this.getContainer(), eventEmitter)
    );
    this.serviceContainer.registerFactory('editorManager', () =>
      new EditorManager(eventEmitter)
    );
    this.serviceContainer.registerFactory('codeRunner', () =>
      new CodeRunner(compilerFactory, eventEmitter)
    );
  }

  /** 初始化 Playground */
  async initialize(): Promise<void> {
    if (this.isDestroyed) {
      throw new Error('Playground 已被销毁');
    }

    if (this.isInitialized) {
      this.logger.warn('Playground 已经初始化过了');
      return;
    }

    try {
      this.logger.info('开始初始化 Playground');

      // 1. 初始化编译器工厂
      const compilerFactory = this.serviceContainer.resolve<CompilerFactory>('compilerFactory');
      await compilerFactory.initializeBuiltinCompilers();

      // 2. 初始化布局管理器
      const layoutManager = this.serviceContainer.resolve<LayoutManager>('layoutManager');
      await layoutManager.initialize();

      // 3. 初始化编辑器管理器
      const editorManager = this.serviceContainer.resolve<EditorManager>('editorManager');
      await editorManager.initialize(layoutManager.getEditorContainer());

      // 4. 初始化代码运行器
      const codeRunner = this.serviceContainer.resolve<CodeRunner>('codeRunner');
      await codeRunner.initialize(layoutManager.getResultContainer());

      // 5. 设置初始配置
      await this.setConfig(this.configManager.getConfig());

      // 6. 标记为已初始化
      this.isInitialized = true;

      // 7. 触发就绪事件
      const eventEmitter = this.serviceContainer.resolve<EventEmitter>('eventEmitter');
      eventEmitter.emit('ready', {});

      this.logger.info('Playground 初始化完成');
      
    } catch (error) {
      this.logger.error('初始化失败:', error);
      const eventEmitter = this.serviceContainer.resolve<EventEmitter>('eventEmitter');
      eventEmitter.emit('error', { error });
      throw error;
    }
  }

  /** 运行代码 */
  async run(): Promise<void> {
    if (this.isDestroyed || !this.isInitialized) {
      this.logger.warn('Playground 未初始化或已销毁');
      return;
    }

    try {
      this.logger.info('开始运行代码');

      // 更新运行按钮状态
      this.updateRunButtonState('running');

      const code = await this.getCode();
      const codeRunner = this.serviceContainer.resolve<CodeRunner>('codeRunner');
      await codeRunner.run(code, this.configManager.getConfig());

      const eventEmitter = this.serviceContainer.resolve<EventEmitter>('eventEmitter');
      eventEmitter.emit('run', { code });
      this.updateRunButtonState('success');

    } catch (error) {
      this.logger.error('运行代码失败:', error);
      const eventEmitter = this.serviceContainer.resolve<EventEmitter>('eventEmitter');
      eventEmitter.emit('error', { error });
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

  /** 获取代码 */
  async getCode(): Promise<{ markup: string; style: string; script: string }> {
    const editorManager = this.serviceContainer.resolve<EditorManager>('editorManager');
    return editorManager.getCode();
  }

  /** 设置代码 */
  async setCode(code: Partial<{ markup: string; style: string; script: string }>): Promise<void> {
    const editorManager = this.serviceContainer.resolve<EditorManager>('editorManager');
    await editorManager.setCode(code);

    const eventEmitter = this.serviceContainer.resolve<EventEmitter>('eventEmitter');
    eventEmitter.emit('code-update', { code });
  }

  /** 获取配置 */
  async getConfig(): Promise<Config> {
    return this.configManager.getConfig();
  }

  /** 设置配置 */
  async setConfig(config: Partial<Config>): Promise<void> {
    // 使用配置管理器更新配置
    this.configManager.updateConfig(config);
    const newConfig = this.configManager.getConfig();

    // 更新各个子系统
    const editorManager = this.serviceContainer.resolve<EditorManager>('editorManager');
    const layoutManager = this.serviceContainer.resolve<LayoutManager>('layoutManager');

    await editorManager.updateConfig(newConfig);
    await layoutManager.updateConfig(newConfig);

    const eventEmitter = this.serviceContainer.resolve<EventEmitter>('eventEmitter');
    eventEmitter.emit('config-update', { config: newConfig });
  }

  /** 格式化代码 */
  async format(): Promise<void> {
    const editorManager = this.serviceContainer.resolve<EditorManager>('editorManager');
    await editorManager.format();
  }

  /** 监听事件 */
  on(event: string, handler: EventHandler): void {
    const eventEmitter = this.serviceContainer.resolve<EventEmitter>('eventEmitter');
    eventEmitter.on(event, handler);
  }

  /** 移除事件监听 */
  off(event: string, handler: EventHandler): void {
    const eventEmitter = this.serviceContainer.resolve<EventEmitter>('eventEmitter');
    eventEmitter.off(event, handler);
  }

  /** 销毁 Playground */
  async destroy(): Promise<void> {
    if (this.isDestroyed) return;

    this.logger.info('销毁 Playground');
    this.isDestroyed = true;

    try {
      // 销毁配置管理器
      this.configManager.destroy();

      // 销毁服务容器（会自动销毁所有服务）
      this.serviceContainer.destroy();

      this.logger.info('Playground 已销毁');
    } catch (error) {
      this.logger.error('销毁 Playground 时出错', error);
    }
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
    const eventEmitter = this.serviceContainer.resolve<EventEmitter>('eventEmitter');

    // 代码更新时的处理
    eventEmitter.on('code-update', async (event) => {
      this.logger.info('收到代码更新事件:', event);

      // 如果启用了自动运行，则自动运行代码
      const config = this.configManager.getConfig();
      if (config.autoRun && this.isInitialized) {
        // 延迟执行，避免频繁运行
        setTimeout(() => {
          this.run().catch(error => {
            this.logger.warn('自动运行失败', error);
          });
        }, config.delay || 1000);
      }
    });

    // 配置更新时的处理
    this.configManager.onConfigChange((config) => {
      this.logger.info('配置已更新');
      eventEmitter.emit('config-update', { config });
    });

    // 监听运行请求
    eventEmitter.on('run-requested', () => {
      this.logger.info('用户请求运行代码');
      this.run().catch(error => {
        this.logger.error('运行失败:', error);
      });
    });

    // 监听格式化请求
    eventEmitter.on('format-requested', () => {
      this.logger.info('用户请求格式化代码');
      this.format().catch(error => {
        this.logger.error('格式化失败:', error);
      });
    });

    // 监听语言变化
    eventEmitter.on('language-change', (event) => {
      this.logger.info('收到语言变化事件:', event);

      const { editorType, language } = event.payload || {};
      if (!editorType || !language) {
        this.logger.warn('语言变化事件数据不完整:', event);
        return;
      }

      // 更新配置中的语言设置
      const currentConfig = this.configManager.getConfig();
      const updates: Partial<Config> = {};

      if (editorType === 'markup') {
        updates.markup = { ...currentConfig.markup, language };
      } else if (editorType === 'style') {
        updates.style = { ...currentConfig.style, language };
      } else if (editorType === 'script') {
        updates.script = { ...currentConfig.script, language };
      }

      if (Object.keys(updates).length > 0) {
        this.configManager.updateConfig(updates);
        this.logger.info(`${editorType} 语言已更新: ${language}`);
      }
    });
  }

  /** 获取服务统计信息 */
  getStats() {
    return {
      isInitialized: this.isInitialized,
      isDestroyed: this.isDestroyed,
      serviceContainer: this.serviceContainer.getStats(),
      configManager: this.configManager.getStats()
    };
  }
}

/** 创建 Playground 实例的工厂函数 */
export async function createPlayground(options: PlaygroundOptions): Promise<Playground> {
  const playground = new Playground(options);
  await playground.initialize();
  return playground;
}
