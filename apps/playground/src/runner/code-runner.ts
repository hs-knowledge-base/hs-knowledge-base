import type { Config } from '@/types';
import { EventEmitter } from '@/core/events';
import { CompilerFactory } from '@/compiler/compiler-factory';
import { Logger } from '@/utils/logger';

/** 代码运行器 */
export class CodeRunner {
  private readonly logger = new Logger('CodeRunner');
  private container!: HTMLElement;
  private iframe!: HTMLIFrameElement;
  private currentHtmlDocument: string = '';

  constructor(
    private compilerFactory: CompilerFactory,
    private eventEmitter: EventEmitter
  ) {}

  async initialize(container: HTMLElement): Promise<void> {
    this.logger.info('初始化代码运行器');
    this.container = container;
    this.createResultDisplay();
  }

  async run(
    code: { markup: string; style: string; script: string },
    config: Config
  ): Promise<void> {
    try {
      this.logger.info('开始运行代码');

      // 编译各部分代码
      const markupCompiler = this.compilerFactory.getCompiler(config.markup.language);
      const styleCompiler = this.compilerFactory.getCompiler(config.style.language);
      const scriptCompiler = this.compilerFactory.getCompiler(config.script.language);

      const [markupResult, styleResult, scriptResult] = await Promise.all([
        markupCompiler.compile(code.markup, { config, language: config.markup.language }),
        styleCompiler.compile(code.style, { config, language: config.style.language }),
        scriptCompiler.compile(code.script, { config, language: config.script.language })
      ]);

      // 调试日志
      this.logger.info('编译结果:', {
        markup: { language: config.markup.language, codeLength: markupResult.code.length, hasError: !!markupResult.error },
        style: { language: config.style.language, codeLength: styleResult.code.length, hasError: !!styleResult.error },
        script: { language: config.script.language, codeLength: scriptResult.code.length, hasError: !!scriptResult.error }
      });

      // 检查编译错误
      const errors = [markupResult, styleResult, scriptResult]
        .filter(result => result.error)
        .map(result => result.error);

      if (errors.length > 0) {
        this.showError(errors.join('\n'));
        return;
      }

      // 生成完整的 HTML 文档
      const htmlDocument = this.generateHtmlDocument(
        markupResult.code,
        styleResult.code,
        scriptResult.code
      );

      // 保存当前文档内容
      this.currentHtmlDocument = htmlDocument;

      // 在 iframe 中运行
      this.runInIframe(htmlDocument);

      this.eventEmitter.emit('run-success', { code, results: { markupResult, styleResult, scriptResult } });

    } catch (error) {
      this.logger.error('运行代码失败:', error);
      this.showError((error as Error).message);
      this.eventEmitter.emit('run-error', { error });
    }
  }

  async destroy(): Promise<void> {
    this.logger.info('销毁代码运行器');

    // 清理 blob URL
    if (this.iframe && this.iframe.src && this.iframe.src.startsWith('blob:')) {
      URL.revokeObjectURL(this.iframe.src);
    }

    this.container.innerHTML = '';
  }

  private createResultDisplay(): void {
    // 预览区域
    const previewContent = this.container.querySelector('.preview-content');
    if (previewContent) {
      previewContent.innerHTML = `
        <iframe class="result-iframe" sandbox="allow-scripts allow-same-origin"></iframe>
      `;
    }

    // 控制台面板
    const consolePanel = this.container.querySelector('.console-panel');
    if (consolePanel) {
      consolePanel.innerHTML = `
        <div class="console-toolbar">
          <span class="console-title">控制台输出</span>
          <button class="clear-console-btn" title="清空控制台">🗑️</button>
        </div>
        <div class="console-messages"></div>
      `;
    }

    // 编译结果面板
    const compiledPanel = this.container.querySelector('.compiled-panel');
    if (compiledPanel) {
      compiledPanel.innerHTML = `
        <div class="compiled-toolbar">
          <span class="compiled-title">编译结果</span>
        </div>
        <div class="compiled-content"></div>
      `;
    }

    this.iframe = this.container.querySelector('.result-iframe') as HTMLIFrameElement;
    this.setupResultStyles();
    this.setupEventHandlers();
    this.setupConsoleCapture();
  }

  private setupResultStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      /* 预览区域样式 */
      .result-iframe {
        width: 100%;
        height: 100%;
        border: none;
        background: white;
      }

      /* 控制台和编译结果工具栏 */
      .console-toolbar,
      .compiled-toolbar {
        height: 35px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        background: var(--toolbar-bg);
        border-bottom: 1px solid var(--border-color);
        flex-shrink: 0;
      }

      .console-title,
      .compiled-title {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-color);
      }

      .clear-console-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background 0.2s;
        font-size: 14px;
        color: var(--text-color);
      }

      .clear-console-btn:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      /* 控制台消息区域 */
      .console-messages {
        height: calc(100% - 35px);
        padding: 8px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 12px;
        color: #d4d4d4;
        background: #1e1e1e;
        overflow-y: auto;
      }

      .console-message {
        display: flex;
        gap: 8px;
        padding: 3px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        line-height: 1.4;
      }

      .console-timestamp {
        color: #666;
        font-size: 11px;
        min-width: 70px;
        flex-shrink: 0;
      }

      .console-text {
        flex: 1;
        word-break: break-word;
      }

      .console-log {
        color: #d4d4d4;
      }

      .console-error {
        color: #f48771;
      }

      .console-warn {
        color: #dcdcaa;
      }

      /* 编译结果区域 */
      .compiled-content {
        height: calc(100% - 35px);
        padding: 12px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 12px;
        color: var(--text-color);
        background: var(--bg-color);
        overflow-y: auto;
      }

      .compiled-code {
        white-space: pre-wrap;
        line-height: 1.5;
      }

      /* 错误显示 */
      .error-display {
        padding: 16px;
        background: rgba(244, 135, 113, 0.1);
        color: #f48771;
        border: 1px solid rgba(244, 135, 113, 0.3);
        margin: 8px;
        border-radius: 4px;
        font-family: monospace;
        white-space: pre-wrap;
        font-size: 12px;
        line-height: 1.4;
      }
    `;

    document.head.appendChild(style);
  }

  private setupEventHandlers(): void {
    const refreshBtn = this.container.querySelector('.refresh-btn');
    refreshBtn?.addEventListener('click', () => {
      this.refreshPreview();
    });

    const clearConsoleBtn = this.container.querySelector('.clear-console-btn');
    clearConsoleBtn?.addEventListener('click', () => {
      this.clearConsole();
    });
  }

  private setupConsoleCapture(): void {
    // 监听来自 iframe 的控制台消息
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'console-log') {
        this.addConsoleMessage(event.data.level, event.data.args);
      } else if (event.data && event.data.type === 'console-clear') {
        this.clearConsole();
      }
    });
  }

  private addConsoleMessage(level: string, args: string[]): void {
    const consoleMessages = this.container.querySelector('.console-messages');
    if (!consoleMessages) return;

    const messageElement = document.createElement('div');
    messageElement.className = `console-message console-${level}`;

    const timestamp = new Date().toLocaleTimeString();
    messageElement.innerHTML = `
      <span class="console-timestamp">${timestamp}</span>
      <span class="console-text">${args.join(' ')}</span>
    `;

    consoleMessages.appendChild(messageElement);
    consoleMessages.scrollTop = consoleMessages.scrollHeight;
  }

  private clearConsole(): void {
    const consoleMessages = this.container.querySelector('.console-messages');
    if (consoleMessages) {
      consoleMessages.innerHTML = '';
    }
  }

  private refreshPreview(): void {
    if (this.currentHtmlDocument && this.iframe) {
      this.logger.info('刷新预览');

      // 清空控制台
      this.clearConsole();

      // 重新运行当前文档
      this.runInIframe(this.currentHtmlDocument);
    } else {
      this.logger.warn('没有可刷新的内容');
    }
  }

  private generateHtmlDocument(markup: string, style: string, script: string): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>代码运行结果</title>
  <style>
    ${style}
  </style>
</head>
<body>
  ${markup}
  <script>
    // 重写 console 方法以捕获输出
    (function() {
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;
      
      window.parent.postMessage({
        type: 'console-clear'
      }, '*');
      
      console.log = function(...args) {
        originalLog.apply(console, args);
        window.parent.postMessage({
          type: 'console-log',
          level: 'log',
          args: args.map(arg => String(arg))
        }, '*');
      };
      
      console.error = function(...args) {
        originalError.apply(console, args);
        window.parent.postMessage({
          type: 'console-log',
          level: 'error',
          args: args.map(arg => String(arg))
        }, '*');
      };
      
      console.warn = function(...args) {
        originalWarn.apply(console, args);
        window.parent.postMessage({
          type: 'console-log',
          level: 'warn',
          args: args.map(arg => String(arg))
        }, '*');
      };
      
      // 捕获未处理的错误
      window.addEventListener('error', function(e) {
        console.error('运行时错误:', e.message);
      });
    })();
    
    ${script}
  </script>
</body>
</html>`;
  }

  private runInIframe(htmlDocument: string): void {
    // 如果 iframe 已经有内容，先清理旧的 URL
    const oldSrc = this.iframe.src;
    if (oldSrc && oldSrc.startsWith('blob:')) {
      URL.revokeObjectURL(oldSrc);
    }

    const blob = new Blob([htmlDocument], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    this.iframe.onload = () => {
      // 延迟清理 URL，确保内容已加载
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
    };

    this.iframe.src = url;
  }

  private showError(message: string): void {
    this.container.querySelector('.result-content')!.innerHTML = `
      <div class="error-display">
        <strong>编译/运行错误:</strong>
        ${message}
      </div>
    `;
  }
}
