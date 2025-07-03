import type { Config, LayoutConfig } from '@/types';
import { EventEmitter } from '@/core/events';
import { Logger } from '@/utils/logger';

/**
 * 布局管理器 - 重构版本
 * 负责管理 Playground 的整体布局，支持响应式设计
 */
export class LayoutManager {
  private readonly logger = new Logger('LayoutManager');
  private editorContainer!: HTMLElement;
  private resultContainer!: HTMLElement;
  private toolbarContainer!: HTMLElement;
  private currentLayout: LayoutConfig = {
    direction: 'horizontal',
    showPreview: true,
    showConsole: true
  };
  private resizeObserver?: ResizeObserver;

  constructor(
    private container: HTMLElement,
    private eventEmitter: EventEmitter
  ) {}

  async initialize(): Promise<void> {
    this.logger.info('初始化布局管理器');
    this.createLayout();
    this.setupEventHandlers();
    this.setupResizeObserver();
    this.applyResponsiveLayout();
  }

  async updateConfig(config: Config): Promise<void> {
    this.applyTheme(config.theme || 'dark');
    this.updateLayout(config.layout);
  }

  /** 更新布局配置 */
  updateLayout(layout: Partial<LayoutConfig>): void {
    this.currentLayout = { ...this.currentLayout, ...layout };
    this.applyLayout();
    this.logger.info('布局已更新', this.currentLayout);
  }

  getEditorContainer(): HTMLElement {
    return this.editorContainer;
  }

  getResultContainer(): HTMLElement {
    return this.resultContainer;
  }

  getToolbarContainer(): HTMLElement {
    return this.toolbarContainer;
  }

  /** 创建布局结构 */
  private createLayout(): void {
    this.container.innerHTML = `
      <div class="playground-layout" data-layout="${this.currentLayout.direction}">
        ${this.createToolbar()}
        <div class="main-container">
          <div class="editor-container"></div>
          <div class="result-container">
            ${this.createResultArea()}
          </div>
        </div>
      </div>
    `;

    // 获取容器引用
    this.toolbarContainer = this.container.querySelector('.toolbar-container')!;
    this.editorContainer = this.container.querySelector('.editor-container')!;
    this.resultContainer = this.container.querySelector('.result-container')!;

    // 应用样式
    this.applyLayoutStyles();
  }

  /** 创建工具栏 */
  private createToolbar(): string {
    return `
      <div class="toolbar-container">
        <div class="toolbar-left">
          <span class="app-title">🔥 火山知识库 - 代码演练场</span>
        </div>
        <div class="toolbar-center">
          <button class="run-btn" title="运行代码 (Ctrl+Enter)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <span>运行</span>
          </button>
        </div>
        <div class="toolbar-right">
          <button class="format-btn" title="格式化代码">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </button>
          <button class="layout-toggle-btn" title="切换布局">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  /** 创建结果区域 */
  private createResultArea(): string {
    return `
      <div class="preview-area" ${!this.currentLayout.showPreview ? 'style="display: none;"' : ''}>
        <div class="preview-toolbar">
          <span class="preview-title">预览</span>
          <button class="refresh-btn" title="刷新">🔄</button>
        </div>
        <div class="preview-content"></div>
      </div>
      <div class="console-area" ${!this.currentLayout.showConsole ? 'style="display: none;"' : ''}>
        <div class="console-tabs">
          <button class="console-tab active" data-tab="console">控制台</button>
          <button class="console-tab" data-tab="compiled">编译结果</button>
        </div>
        <div class="console-content">
          <div class="console-panel active" data-content="console"></div>
          <div class="compiled-panel" data-content="compiled"></div>
        </div>
      </div>
    `;
  }

  /** 应用布局 */
  private applyLayout(): void {
    const layout = this.container.querySelector('.playground-layout') as HTMLElement;
    if (layout) {
      layout.setAttribute('data-layout', this.currentLayout.direction);
    }

    // 更新结果区域显示
    this.updateResultAreaVisibility();

    // 触发布局变化事件
    this.eventEmitter.emit('layout-change', { layout: this.currentLayout });
  }

  /** 更新结果区域可见性 */
  private updateResultAreaVisibility(): void {
    const previewArea = this.container.querySelector('.preview-area') as HTMLElement;
    const consoleArea = this.container.querySelector('.console-area') as HTMLElement;

    if (previewArea) {
      previewArea.style.display = this.currentLayout.showPreview ? 'flex' : 'none';
    }
    if (consoleArea) {
      consoleArea.style.display = this.currentLayout.showConsole ? 'flex' : 'none';
    }
  }

  /** 设置响应式观察器 */
  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          this.handleResize(entry.contentRect);
        }
      });
      this.resizeObserver.observe(this.container);
    }
  }

  /** 处理容器大小变化 */
  private handleResize(rect: DOMRectReadOnly): void {
    const isSmallScreen = rect.width < 768;

    // 在小屏幕上自动切换到垂直布局
    if (isSmallScreen && this.currentLayout.direction === 'horizontal') {
      this.updateLayout({ direction: 'vertical' });
    }
  }

  /** 应用响应式布局 */
  private applyResponsiveLayout(): void {
    const rect = this.container.getBoundingClientRect();
    this.handleResize(rect);
  }

  private setupEventHandlers(): void {
    this.setupConsoleTabs();
    this.setupToolbarEvents();
  }

  /** 应用布局样式 */
  private applyLayoutStyles(): void {
    const style = document.createElement('style');
    style.id = 'playground-layout-styles';

    // 移除旧样式
    const oldStyle = document.getElementById('playground-layout-styles');
    if (oldStyle) {
      oldStyle.remove();
    }

    style.textContent = `
      .playground-layout {
        height: 100vh;
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: hidden;
      }

      /* 响应式布局 */
      .playground-layout[data-layout="horizontal"] .main-container {
        flex-direction: row;
      }

      .playground-layout[data-layout="vertical"] .main-container {
        flex-direction: column;
      }

      /* 移动端适配 */
      @media (max-width: 768px) {
        .playground-layout .main-container {
          flex-direction: column !important;
        }

        .toolbar-left .app-title {
          display: none;
        }

        .toolbar-center .run-btn span {
          display: none;
        }
      }

      .toolbar-container {
        height: 50px;
        border-bottom: 1px solid var(--border-color);
        background: var(--toolbar-bg);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        flex-shrink: 0;
      }

      .toolbar-left,
      .toolbar-center,
      .toolbar-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .app-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-color);
      }

      .run-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: #28a745;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2);
      }

      .run-btn:hover {
        background: #218838;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
      }

      .run-btn:active {
        transform: translateY(0);
      }

      .run-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none !important;
      }

      .run-btn.running {
        background: #ffc107;
        color: #212529;
      }

      .run-btn.success {
        background: #28a745;
        animation: pulse-success 0.5s ease;
      }

      .run-btn.error {
        background: #dc3545;
        animation: pulse-error 0.5s ease;
      }

      @keyframes pulse-success {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }

      @keyframes pulse-error {
        0% { transform: scale(1); }
        25% { transform: scale(1.02); }
        50% { transform: scale(1); }
        75% { transform: scale(1.02); }
        100% { transform: scale(1); }
      }

      .format-btn,
      .settings-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: transparent;
        color: var(--text-color);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .format-btn:hover,
      .settings-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: #007acc;
      }

      .main-container {
        flex: 1;
        display: flex;
        overflow: hidden;
        height: calc(100vh - 50px);
      }

      .editor-container {
        flex: 1.2;
        border-right: 1px solid var(--border-color);
        overflow: hidden;
        min-width: 400px;
      }

      .result-container {
        flex: 0.8;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        min-width: 300px;
      }

      /* 有预览时的布局 */
      .result-container.has-preview {
        flex-direction: column;
      }

      .result-container.has-preview .preview-area {
        flex: 2; /* 预览区域占 2/3 */
      }

      .result-container.has-preview .console-area {
        flex: 1; /* 控制台区域占 1/3 */
        border-top: 1px solid var(--border-color);
      }

      /* 只有控制台时的布局 */
      .result-container.console-only .console-area {
        flex: 1;
      }

      /* 预览区域 */
      .preview-area {
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .preview-toolbar {
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        background: var(--toolbar-bg);
        border-bottom: 1px solid var(--border-color);
        flex-shrink: 0;
      }

      .preview-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-color);
      }

      .refresh-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background 0.2s;
        font-size: 14px;
      }

      .refresh-btn:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .preview-content {
        flex: 1;
        overflow: hidden;
      }

      /* 控制台区域 */
      .console-area {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-height: 200px;
      }

      .console-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-height: 0;
      }

      .console-tabs {
        display: flex;
        background: var(--toolbar-bg);
        border-bottom: 1px solid var(--border-color);
        flex-shrink: 0;
      }

      .console-tab {
        padding: 8px 16px;
        border: none;
        background: transparent;
        color: var(--text-color);
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: all 0.2s;
        font-size: 13px;
      }

      .console-tab:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .console-tab.active {
        border-bottom-color: #007acc;
        background: rgba(0, 122, 204, 0.1);
      }

      .console-content {
        flex: 1;
        position: relative;
        overflow: hidden;
      }

      .console-panel,
      .compiled-panel {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: none;
      }

      .console-panel.active,
      .compiled-panel.active {
        display: block;
      }

      /* 垂直布局 */
      .playground-layout.vertical .main-container {
        flex-direction: column;
      }

      .playground-layout.vertical .editor-container {
        border-right: none;
        border-bottom: 1px solid var(--border-color);
      }

      /* 主题变量 */
      .playground-layout.dark {
        --bg-color: #1e1e1e;
        --text-color: #d4d4d4;
        --border-color: #3e3e3e;
        --toolbar-bg: #2d2d30;
      }

      .playground-layout.light {
        --bg-color: #ffffff;
        --text-color: #333333;
        --border-color: #e1e4e8;
        --toolbar-bg: #f6f8fa;
      }

      .playground-layout {
        background: var(--bg-color);
        color: var(--text-color);
      }
    `;

    document.head.appendChild(style);
  }

  /** 应用主题 */
  applyTheme(theme: 'light' | 'dark'): void {
    const layout = this.container.querySelector('.playground-layout') as HTMLElement;
    if (layout) {
      layout.classList.remove('light', 'dark');
      layout.classList.add(theme);
      this.logger.debug(`主题已切换到: ${theme}`);
    }
  }

  private setupToolbarEvents(): void {
    // 运行按钮
    const runBtn = this.container.querySelector('.run-btn');
    runBtn?.addEventListener('click', () => {
      this.eventEmitter.emit('run-requested', {});
    });

    // 格式化按钮
    const formatBtn = this.container.querySelector('.format-btn');
    formatBtn?.addEventListener('click', () => {
      this.eventEmitter.emit('format-requested', {});
    });

    // 布局切换按钮
    const layoutToggleBtn = this.container.querySelector('.layout-toggle-btn');
    layoutToggleBtn?.addEventListener('click', () => {
      const newDirection = this.currentLayout.direction === 'horizontal' ? 'vertical' : 'horizontal';
      this.updateLayout({ direction: newDirection });
    });

    // 刷新按钮
    const refreshBtn = this.container.querySelector('.refresh-btn');
    refreshBtn?.addEventListener('click', () => {
      this.eventEmitter.emit('refresh-requested', {});
    });

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.eventEmitter.emit('run-requested', {});
      }
    });
  }

  private setupConsoleTabs(): void {
    const tabs = this.container.querySelectorAll('.console-tab');
    const contents = this.container.querySelectorAll('[data-content]');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabType = tab.getAttribute('data-tab');

        // 更新标签状态
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // 更新内容显示
        contents.forEach(c => c.classList.remove('active'));
        this.container.querySelector(`[data-content="${tabType}"]`)?.classList.add('active');
      });
    });
  }

  private updateResultDisplay(config: Config): void {
    const hasMarkup = config.markup && config.markup.content.trim() !== '';
    this.updateLayoutByMarkup(hasMarkup);
  }

  /**
   * 外部调用：根据代码内容更新结果显示
   */
  updateResultDisplayByCode(code: { markup: string; style: string; script: string }): void {
    const hasMarkup = code.markup && code.markup.trim() !== '';
    this.updateLayoutByMarkup(hasMarkup);
  }

  private updateLayoutByMarkup(hasMarkup: boolean): void {
    const previewArea = this.container.querySelector('.preview-area') as HTMLElement;
    const consoleArea = this.container.querySelector('.console-area') as HTMLElement;
    const resultContainer = this.container.querySelector('.result-container') as HTMLElement;

    this.logger.info(`更新布局: hasMarkup=${hasMarkup}`);

    if (hasMarkup) {
      // 有模板内容：显示预览区域 + 控制台区域（垂直分割）
      previewArea.style.display = 'flex';
      consoleArea.style.display = 'flex';
      resultContainer.classList.add('has-preview');
      resultContainer.classList.remove('console-only');
      this.logger.info('显示预览区域 + 控制台区域');
    } else {
      // 没有模板内容：只显示控制台区域
      previewArea.style.display = 'none';
      consoleArea.style.display = 'flex';
      resultContainer.classList.remove('has-preview');
      resultContainer.classList.add('console-only');
      this.logger.info('只显示控制台区域');
    }
  }

  /** 获取布局统计信息 */
  getLayoutStats() {
    return {
      currentLayout: this.currentLayout,
      containerSize: {
        width: this.container.clientWidth,
        height: this.container.clientHeight
      },
      hasResizeObserver: !!this.resizeObserver
    };
  }

  /** 销毁布局管理器 */
  async destroy(): Promise<void> {
    // 断开 ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }

    // 移除样式
    const style = document.getElementById('playground-layout-styles');
    if (style) {
      style.remove();
    }

    // 清空容器
    this.container.innerHTML = '';

    this.logger.info('布局管理器已销毁');
  }
}
