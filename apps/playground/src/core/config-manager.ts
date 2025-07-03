import type { Config } from '@/types';
import { Logger } from '../utils/logger';

/**
 * 配置管理器
 * 统一管理 Playground 的配置，支持验证、热更新等功能
 */
export class ConfigManager {
  private readonly logger = new Logger('ConfigManager');
  private config: Config;
  private readonly changeListeners = new Set<(config: Config) => void>();

  constructor(initialConfig?: Partial<Config>) {
    this.config = this.mergeWithDefaults(initialConfig || {});
    this.validateConfig();
    this.logger.info('配置管理器初始化完成');
  }

  /** 获取默认配置 */
  private getDefaultConfig(): Config {
    return {
      markup: {
        language: 'html',
        content: `<div class="container">
  <h1>Hello Playground!</h1>
  <p>开始编写你的代码吧！</p>
</div>`
      },
      style: {
        language: 'css',
        content: `.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  color: #333;
  text-align: center;
}

p {
  color: #666;
  line-height: 1.6;
}`
      },
      script: {
        language: 'javascript',
        content: `// 欢迎使用 Playground
console.log('Hello, Playground!');

// 你可以在这里编写 JavaScript 代码
const message = 'Playground 已准备就绪！';
document.querySelector('h1').addEventListener('click', () => {
  alert(message);
});`
      },
      editor: {
        theme: 'playground-dark',
        fontSize: 14,
        tabSize: 2,
        wordWrap: true,
        minimap: false,
        lineNumbers: true
      },
      layout: {
        direction: 'horizontal',
        showPreview: true,
        showConsole: true
      },
      autoRun: true,
      delay: 1000
    };
  }

  /** 合并用户配置和默认配置 */
  private mergeWithDefaults(userConfig: Partial<Config>): Config {
    const defaultConfig = this.getDefaultConfig();
    
    return {
      ...defaultConfig,
      ...userConfig,
      markup: { ...defaultConfig.markup, ...userConfig.markup },
      style: { ...defaultConfig.style, ...userConfig.style },
      script: { ...defaultConfig.script, ...userConfig.script },
      editor: { ...defaultConfig.editor, ...userConfig.editor },
      layout: { ...defaultConfig.layout, ...userConfig.layout }
    };
  }

  /** 验证配置 */
  private validateConfig(): void {
    const errors: string[] = [];

    // 验证必需字段
    if (!this.config.markup?.language) {
      errors.push('markup.language 是必需的');
    }
    if (!this.config.style?.language) {
      errors.push('style.language 是必需的');
    }
    if (!this.config.script?.language) {
      errors.push('script.language 是必需的');
    }

    // 验证编辑器配置
    if (this.config.editor?.fontSize && (this.config.editor.fontSize < 8 || this.config.editor.fontSize > 72)) {
      errors.push('editor.fontSize 必须在 8-72 之间');
    }
    if (this.config.editor?.tabSize && (this.config.editor.tabSize < 1 || this.config.editor.tabSize > 8)) {
      errors.push('editor.tabSize 必须在 1-8 之间');
    }

    // 验证延迟设置
    if (this.config.delay && (this.config.delay < 0 || this.config.delay > 10000)) {
      errors.push('delay 必须在 0-10000ms 之间');
    }

    if (errors.length > 0) {
      this.logger.error('配置验证失败:', errors);
      throw new Error(`配置验证失败: ${errors.join(', ')}`);
    }

    this.logger.debug('配置验证通过');
  }

  /** 获取当前配置 */
  getConfig(): Config {
    return { ...this.config };
  }

  /** 更新配置 */
  updateConfig(updates: Partial<Config>): void {
    const oldConfig = { ...this.config };
    
    try {
      // 合并新配置
      this.config = this.mergeWithDefaults({ ...this.config, ...updates });
      
      // 验证新配置
      this.validateConfig();
      
      // 通知监听器
      this.notifyConfigChange();
      
      this.logger.info('配置已更新');
    } catch (error) {
      // 恢复旧配置
      this.config = oldConfig;
      this.logger.error('配置更新失败，已恢复旧配置', error);
      throw error;
    }
  }

  /** 重置为默认配置 */
  resetToDefault(): void {
    this.config = this.getDefaultConfig();
    this.notifyConfigChange();
    this.logger.info('配置已重置为默认值');
  }

  /** 监听配置变化 */
  onConfigChange(callback: (config: Config) => void): void {
    this.changeListeners.add(callback);
  }

  /** 移除配置变化监听器 */
  offConfigChange(callback: (config: Config) => void): void {
    this.changeListeners.delete(callback);
  }

  /** 通知配置变化 */
  private notifyConfigChange(): void {
    const config = this.getConfig();
    this.changeListeners.forEach(callback => {
      try {
        callback(config);
      } catch (error) {
        this.logger.warn('配置变化回调执行失败', error);
      }
    });
  }

  /** 从 URL 参数加载配置 */
  loadFromURL(): Partial<Config> {
    try {
      const params = new URLSearchParams(window.location.search);
      const configParam = params.get('config');
      
      if (configParam) {
        const decodedConfig = JSON.parse(decodeURIComponent(configParam));
        this.logger.debug('从 URL 加载配置成功');
        return decodedConfig;
      }
    } catch (error) {
      this.logger.warn('从 URL 加载配置失败', error);
    }
    
    return {};
  }

  /** 保存配置到 URL */
  saveToURL(): void {
    try {
      const configStr = encodeURIComponent(JSON.stringify(this.config));
      const url = new URL(window.location.href);
      url.searchParams.set('config', configStr);
      
      window.history.replaceState({}, '', url.toString());
      this.logger.debug('配置已保存到 URL');
    } catch (error) {
      this.logger.warn('保存配置到 URL 失败', error);
    }
  }

  /** 从本地存储加载配置 */
  loadFromStorage(): Partial<Config> {
    try {
      const stored = localStorage.getItem('playground-config');
      if (stored) {
        const config = JSON.parse(stored);
        this.logger.debug('从本地存储加载配置成功');
        return config;
      }
    } catch (error) {
      this.logger.warn('从本地存储加载配置失败', error);
    }
    
    return {};
  }

  /** 保存配置到本地存储 */
  saveToStorage(): void {
    try {
      localStorage.setItem('playground-config', JSON.stringify(this.config));
      this.logger.debug('配置已保存到本地存储');
    } catch (error) {
      this.logger.warn('保存配置到本地存储失败', error);
    }
  }

  /** 获取配置统计信息 */
  getStats() {
    return {
      listenersCount: this.changeListeners.size,
      configSize: JSON.stringify(this.config).length,
      hasUrlConfig: new URLSearchParams(window.location.search).has('config'),
      hasStorageConfig: !!localStorage.getItem('playground-config')
    };
  }

  /** 销毁配置管理器 */
  destroy(): void {
    this.changeListeners.clear();
    this.logger.info('配置管理器已销毁');
  }
}
