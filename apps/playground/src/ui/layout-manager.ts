import type { Config } from '@/types';
import { EventEmitter } from '@/core/events';
import { Logger } from '@/utils/logger';

/** 布局管理器 */
export class LayoutManager {
  private readonly logger = new Logger('LayoutManager');
  private editorContainer!: HTMLElement;
  private resultContainer!: HTMLElement;
  private toolbarContainer!: HTMLElement;

  constructor(
    private container: HTMLElement,
    private eventEmitter: EventEmitter
  ) {}

  async initialize(): Promise<void> {
    this.logger.info('初始化布局管理器');
    this.createLayout();
    this.setupEventHandlers();

    // 初始化时设置为只显示控制台（因为默认没有模板内容）
    this.updateLayoutByMarkup(false);
  }

  async updateConfig(config: Config): Promise<void> {
    this.applyTheme(config.theme || 'dark');
    this.applyLayout(config.layout?.direction || 'horizontal');
    this.updateResultDisplay(config);
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

  async destroy(): Promise<void> {
    this.logger.info('销毁布局管理器');
    this.container.innerHTML = '';
  }

  private createLayout(): void {
    this.container.innerHTML = `
      <div class="playground-layout">
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
            <button class="settings-btn" title="设置">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="main-container">
          <div class="editor-container"></div>
          <div class="result-container">
            <div class="preview-area">
              <div class="preview-toolbar">
                <span class="preview-title">预览</span>
                <button class="refresh-btn" title="刷新">🔄</button>
              </div>
              <div class="preview-content"></div>
            </div>
            <div class="console-area">
              <div class="console-tabs">
                <button class="console-tab active" data-tab="console">控制台</button>
                <button class="console-tab" data-tab="compiled">编译结果</button>
              </div>
              <div class="console-content">
                <div class="console-panel active" data-content="console"></div>
                <div class="compiled-panel" data-content="compiled"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // 获取容器引用
    this.toolbarContainer = this.container.querySelector('.toolbar-container')!;
    this.editorContainer = this.container.querySelector('.editor-container')!;
    this.resultContainer = this.container.querySelector('.result-container')!;

    // 应用基础样式
    this.applyBaseStyles();
    this.setupConsoleTabs();
    this.setupToolbarEvents();
  }

  private applyBaseStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .playground-layout {
        height: 100vh;
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

  private applyTheme(theme: 'light' | 'dark'): void {
    this.container.querySelector('.playground-layout')?.classList.remove('light', 'dark');
    this.container.querySelector('.playground-layout')?.classList.add(theme);
  }

  private applyLayout(layout: 'horizontal' | 'vertical'): void {
    this.container.querySelector('.playground-layout')?.classList.remove('horizontal', 'vertical');
    this.container.querySelector('.playground-layout')?.classList.add(layout);
  }

  private setupEventHandlers(): void {
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      this.eventEmitter.emit('layout-resize', {});
    });
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

    // 设置按钮
    const settingsBtn = this.container.querySelector('.settings-btn');
    settingsBtn?.addEventListener('click', () => {
      this.eventEmitter.emit('settings-requested', {});
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
}
