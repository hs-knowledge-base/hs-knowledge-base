import { Logger } from '../utils/logger';
import { EventEmitter } from '../core/events';

/**
 * 用户交互管理器
 * 负责管理加载状态、错误提示、快捷键等用户交互功能
 */
export class InteractionManager {
  private readonly logger = new Logger('InteractionManager');
  private loadingOverlay?: HTMLElement;
  private notificationContainer?: HTMLElement;

  constructor(
    private container: HTMLElement,
    private eventEmitter: EventEmitter
  ) {}

  /** 初始化交互管理器 */
  initialize(): void {
    this.createLoadingOverlay();
    this.createNotificationContainer();
    this.setupKeyboardShortcuts();
    this.setupEventHandlers();
    this.logger.info('用户交互管理器初始化完成');
  }

  /** 创建加载遮罩 */
  private createLoadingOverlay(): void {
    this.loadingOverlay = document.createElement('div');
    this.loadingOverlay.className = 'loading-overlay';
    this.loadingOverlay.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载中...</div>
      </div>
    `;
    this.loadingOverlay.style.display = 'none';
    this.container.appendChild(this.loadingOverlay);
  }

  /** 创建通知容器 */
  private createNotificationContainer(): void {
    this.notificationContainer = document.createElement('div');
    this.notificationContainer.className = 'notification-container';
    this.container.appendChild(this.notificationContainer);
  }

  /** 显示加载状态 */
  showLoading(text: string = '加载中...'): void {
    if (this.loadingOverlay) {
      const textElement = this.loadingOverlay.querySelector('.loading-text');
      if (textElement) {
        textElement.textContent = text;
      }
      this.loadingOverlay.style.display = 'flex';
    }
  }

  /** 隐藏加载状态 */
  hideLoading(): void {
    if (this.loadingOverlay) {
      this.loadingOverlay.style.display = 'none';
    }
  }

  /** 显示通知 */
  showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 3000): void {
    if (!this.notificationContainer) return;

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${this.getNotificationIcon(type)}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;

    // 添加关闭事件
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn?.addEventListener('click', () => {
      this.removeNotification(notification);
    });

    // 添加到容器
    this.notificationContainer.appendChild(notification);

    // 自动移除
    if (duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification);
      }, duration);
    }

    this.logger.debug(`显示通知: ${type} - ${message}`);
  }

  /** 移除通知 */
  private removeNotification(notification: HTMLElement): void {
    notification.style.animation = 'slideOut 0.3s ease-in-out';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  /** 获取通知图标 */
  private getNotificationIcon(type: string): string {
    const icons = {
      success: '✓',
      error: '✗',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type as keyof typeof icons] || icons.info;
  }

  /** 设置键盘快捷键 */
  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Enter: 运行代码
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.eventEmitter.emit('run-requested', {});
        this.showNotification('正在运行代码...', 'info', 1000);
      }

      // Ctrl/Cmd + S: 格式化代码
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.eventEmitter.emit('format-requested', {});
        this.showNotification('正在格式化代码...', 'info', 1000);
      }

      // F11: 切换全屏
      if (e.key === 'F11') {
        e.preventDefault();
        this.toggleFullscreen();
      }

      // Escape: 退出全屏
      if (e.key === 'Escape' && document.fullscreenElement) {
        document.exitFullscreen();
      }
    });
  }

  /** 设置事件处理器 */
  private setupEventHandlers(): void {
    // 监听运行状态
    this.eventEmitter.on('run', () => {
      this.hideLoading();
      this.showNotification('代码运行成功', 'success');
    });

    // 监听错误
    this.eventEmitter.on('error', (event) => {
      this.hideLoading();
      const error = event.payload?.error;
      const message = error?.message || '发生未知错误';
      this.showNotification(`错误: ${message}`, 'error', 5000);
    });

    // 监听语言变化
    this.eventEmitter.on('language-change', (event) => {
      const { editorType, language } = event.payload || {};
      if (editorType && language) {
        this.showNotification(`${editorType} 语言已切换到 ${language}`, 'info', 2000);
      }
    });

    // 监听配置更新
    this.eventEmitter.on('config-update', () => {
      this.showNotification('配置已更新', 'success', 1500);
    });
  }

  /** 切换全屏模式 */
  private toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      this.container.requestFullscreen().then(() => {
        this.showNotification('已进入全屏模式，按 ESC 退出', 'info', 2000);
      }).catch(() => {
        this.showNotification('无法进入全屏模式', 'error');
      });
    } else {
      document.exitFullscreen();
    }
  }

  /** 显示快捷键帮助 */
  showShortcutHelp(): void {
    const shortcuts = [
      'Ctrl/Cmd + Enter: 运行代码',
      'Ctrl/Cmd + S: 格式化代码',
      'F11: 切换全屏',
      'ESC: 退出全屏'
    ];

    const helpText = shortcuts.join('\n');
    this.showNotification(`快捷键:\n${helpText}`, 'info', 8000);
  }

  /** 更新运行按钮状态 */
  updateRunButtonState(state: 'idle' | 'running' | 'success' | 'error'): void {
    const runBtn = this.container.querySelector('.run-btn') as HTMLButtonElement;
    if (!runBtn) return;

    // 移除所有状态类
    runBtn.classList.remove('running', 'success', 'error');
    runBtn.disabled = false;

    switch (state) {
      case 'running':
        runBtn.classList.add('running');
        runBtn.disabled = true;
        runBtn.innerHTML = `
          <div class="spinner"></div>
          <span>运行中...</span>
        `;
        break;
      case 'success':
        runBtn.classList.add('success');
        setTimeout(() => {
          runBtn.classList.remove('success');
          this.resetRunButton(runBtn);
        }, 1000);
        break;
      case 'error':
        runBtn.classList.add('error');
        setTimeout(() => {
          runBtn.classList.remove('error');
          this.resetRunButton(runBtn);
        }, 2000);
        break;
      default:
        this.resetRunButton(runBtn);
        break;
    }
  }

  /** 重置运行按钮 */
  private resetRunButton(runBtn: HTMLButtonElement): void {
    runBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z"/>
      </svg>
      <span>运行</span>
    `;
  }

  /** 应用交互样式 */
  applyStyles(): void {
    const style = document.createElement('style');
    style.id = 'interaction-styles';
    
    // 移除旧样式
    const oldStyle = document.getElementById('interaction-styles');
    if (oldStyle) {
      oldStyle.remove();
    }

    style.textContent = `
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }

      .loading-content {
        background: #2d2d30;
        padding: 24px;
        border-radius: 8px;
        text-align: center;
        color: #d4d4d4;
      }

      .loading-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid #3e3e3e;
        border-top: 3px solid #007acc;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 12px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        max-width: 400px;
      }

      .notification {
        background: #2d2d30;
        border-radius: 6px;
        margin-bottom: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease-out;
      }

      .notification-success { border-left: 4px solid #28a745; }
      .notification-error { border-left: 4px solid #dc3545; }
      .notification-warning { border-left: 4px solid #ffc107; }
      .notification-info { border-left: 4px solid #007acc; }

      .notification-content {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        color: #d4d4d4;
      }

      .notification-icon {
        margin-right: 8px;
        font-weight: bold;
      }

      .notification-message {
        flex: 1;
        white-space: pre-line;
      }

      .notification-close {
        background: none;
        border: none;
        color: #888;
        cursor: pointer;
        font-size: 18px;
        margin-left: 8px;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      .run-btn.running {
        background: #6c757d;
        cursor: not-allowed;
      }

      .run-btn.success {
        background: #28a745;
      }

      .run-btn.error {
        background: #dc3545;
      }

      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    `;

    document.head.appendChild(style);
  }

  /** 销毁交互管理器 */
  destroy(): void {
    // 移除样式
    const style = document.getElementById('interaction-styles');
    if (style) {
      style.remove();
    }

    // 移除 DOM 元素
    if (this.loadingOverlay) {
      this.loadingOverlay.remove();
    }
    if (this.notificationContainer) {
      this.notificationContainer.remove();
    }

    this.logger.info('用户交互管理器已销毁');
  }
}
