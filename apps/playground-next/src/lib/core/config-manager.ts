import { useEffect, useCallback, useRef } from 'react';
import type { CompilerConfig, CodeContent } from '@/types';
import { DEFAULT_CODE, DEFAULT_EDITOR_CONFIG } from '@/constants';

/**
 * 配置接口 - 适配新的类型系统
 */
export interface PlaygroundConfig {
  code: CodeContent;
  compiler: CompilerConfig;
  autoRun: boolean;
  delay: number;
}

/**
 * 配置管理器 - React 适配版本
 * 统一管理 Playground 的配置，支持验证、热更新等功能
 */
export class ConfigManager {
  private config: PlaygroundConfig;
  private readonly changeListeners = new Set<(config: PlaygroundConfig) => void>();

  constructor(initialConfig?: Partial<PlaygroundConfig>) {
    this.config = this.mergeWithDefaults(initialConfig || {});
    this.validateConfig();
    console.info('[ConfigManager] 配置管理器初始化完成');
  }

  /** 获取默认配置 */
  private getDefaultConfig(): PlaygroundConfig {
    return {
      code: DEFAULT_CODE,
      compiler: {
        markup: { ...DEFAULT_EDITOR_CONFIG, language: 'html' },
        style: { ...DEFAULT_EDITOR_CONFIG, language: 'css' },
        script: { ...DEFAULT_EDITOR_CONFIG, language: 'javascript' }
      },
      autoRun: false,
      delay: 1000
    };
  }

  /** 合并用户配置和默认配置 */
  private mergeWithDefaults(userConfig: Partial<PlaygroundConfig>): PlaygroundConfig {
    const defaultConfig = this.getDefaultConfig();
    
    return {
      ...defaultConfig,
      ...userConfig,
      code: { ...defaultConfig.code, ...userConfig.code },
      compiler: {
        markup: { ...defaultConfig.compiler.markup, ...userConfig.compiler?.markup },
        style: { ...defaultConfig.compiler.style, ...userConfig.compiler?.style },
        script: { ...defaultConfig.compiler.script, ...userConfig.compiler?.script }
      }
    };
  }

  /** 验证配置 */
  private validateConfig(): void {
    const errors: string[] = [];

    // 验证编译器配置
    if (!this.config.compiler?.markup?.language) {
      errors.push('compiler.markup.language 是必需的');
    }
    if (!this.config.compiler?.style?.language) {
      errors.push('compiler.style.language 是必需的');
    }
    if (!this.config.compiler?.script?.language) {
      errors.push('compiler.script.language 是必需的');
    }

    // 验证编辑器配置
    const { markup, style, script } = this.config.compiler;
    [markup, style, script].forEach((editorConfig, index) => {
      const type = ['markup', 'style', 'script'][index];
      
      if (editorConfig.fontSize && (editorConfig.fontSize < 8 || editorConfig.fontSize > 72)) {
        errors.push(`compiler.${type}.fontSize 必须在 8-72 之间`);
      }
      
      if (typeof editorConfig.wordWrap !== 'boolean') {
        errors.push(`compiler.${type}.wordWrap 必须是布尔值`);
      }
    });

    // 验证延迟设置
    if (this.config.delay && (this.config.delay < 0 || this.config.delay > 10000)) {
      errors.push('delay 必须在 0-10000ms 之间');
    }

    // 验证自动运行设置
    if (typeof this.config.autoRun !== 'boolean') {
      errors.push('autoRun 必须是布尔值');
    }

    if (errors.length > 0) {
      console.error('[ConfigManager] 配置验证失败:', errors);
      throw new Error(`配置验证失败: ${errors.join(', ')}`);
    }

    console.debug('[ConfigManager] 配置验证通过');
  }

  /** 获取当前配置 */
  getConfig(): PlaygroundConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  /** 更新配置 */
  updateConfig(updates: Partial<PlaygroundConfig>): void {
    const oldConfig = { ...this.config };
    
    try {
      // 合并新配置
      this.config = this.mergeWithDefaults({ ...this.config, ...updates });
      
      // 验证新配置
      this.validateConfig();
      
      // 通知监听器
      this.notifyConfigChange();
      
      console.info('[ConfigManager] 配置已更新');
    } catch (error) {
      // 恢复旧配置
      this.config = oldConfig;
      console.error('[ConfigManager] 配置更新失败，已恢复旧配置', error);
      throw error;
    }
  }

  /** 更新代码内容 */
  updateCode(code: Partial<CodeContent>): void {
    this.updateConfig({
      code: { ...this.config.code, ...code }
    });
  }

  /** 更新编译器配置 */
  updateCompilerConfig(compiler: Partial<CompilerConfig>): void {
    this.updateConfig({
      compiler: { ...this.config.compiler, ...compiler }
    });
  }

  /** 重置为默认配置 */
  resetToDefault(): void {
    this.config = this.getDefaultConfig();
    this.notifyConfigChange();
    console.info('[ConfigManager] 配置已重置为默认值');
  }

  /** 监听配置变化 */
  onConfigChange(callback: (config: PlaygroundConfig) => void): () => void {
    this.changeListeners.add(callback);
    
    // 返回取消监听的函数
    return () => {
      this.changeListeners.delete(callback);
    };
  }

  /** 移除配置变化监听器 */
  offConfigChange(callback: (config: PlaygroundConfig) => void): void {
    this.changeListeners.delete(callback);
  }

  /** 通知配置变化 */
  private notifyConfigChange(): void {
    const config = this.getConfig();
    this.changeListeners.forEach(callback => {
      try {
        callback(config);
      } catch (error) {
        console.warn('[ConfigManager] 配置变化回调执行失败', error);
      }
    });
  }

  /** 从 URL 参数加载配置 */
  loadFromURL(): Partial<PlaygroundConfig> {
    if (typeof window === 'undefined') return {};
    
    try {
      const params = new URLSearchParams(window.location.search);
      const configParam = params.get('config');
      
      if (configParam) {
        const decodedConfig = JSON.parse(decodeURIComponent(configParam));
        console.debug('[ConfigManager] 从 URL 加载配置成功');
        return decodedConfig;
      }
    } catch (error) {
      console.warn('[ConfigManager] 从 URL 加载配置失败', error);
    }
    
    return {};
  }

  /** 保存配置到 URL */
  saveToURL(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const configStr = encodeURIComponent(JSON.stringify(this.config));
      const url = new URL(window.location.href);
      url.searchParams.set('config', configStr);
      
      window.history.replaceState({}, '', url.toString());
      console.debug('[ConfigManager] 配置已保存到 URL');
    } catch (error) {
      console.warn('[ConfigManager] 保存配置到 URL 失败', error);
    }
  }

  /** 从本地存储加载配置 */
  loadFromStorage(key: string = 'playground-config'): Partial<PlaygroundConfig> {
    if (typeof window === 'undefined') return {};
    
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const config = JSON.parse(stored);
        console.debug('[ConfigManager] 从本地存储加载配置成功');
        return config;
      }
    } catch (error) {
      console.warn('[ConfigManager] 从本地存储加载配置失败', error);
    }
    
    return {};
  }

  /** 保存配置到本地存储 */
  saveToStorage(key: string = 'playground-config'): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(this.config));
      console.debug('[ConfigManager] 配置已保存到本地存储');
    } catch (error) {
      console.warn('[ConfigManager] 保存配置到本地存储失败', error);
    }
  }

  /** 导出配置 */
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /** 导入配置 */
  importConfig(configJson: string): void {
    try {
      const config = JSON.parse(configJson);
      this.updateConfig(config);
      console.info('[ConfigManager] 配置导入成功');
    } catch (error) {
      console.error('[ConfigManager] 配置导入失败', error);
      throw new Error('配置格式无效');
    }
  }

  /** 获取配置统计信息 */
  getStats() {
    const hasUrlConfig = typeof window !== 'undefined' && 
      new URLSearchParams(window.location.search).has('config');
    const hasStorageConfig = typeof window !== 'undefined' && 
      !!localStorage.getItem('playground-config');

    return {
      listenersCount: this.changeListeners.size,
      configSize: JSON.stringify(this.config).length,
      hasUrlConfig,
      hasStorageConfig
    };
  }

  /** 销毁配置管理器 */
  destroy(): void {
    this.changeListeners.clear();
    console.info('[ConfigManager] 配置管理器已销毁');
  }
}

/**
 * React Hook: 使用配置管理器
 */
export function useConfigManager(initialConfig?: Partial<PlaygroundConfig>): ConfigManager {
  const managerRef = useRef<ConfigManager | null>(null);

  if (!managerRef.current) {
    managerRef.current = new ConfigManager(initialConfig);
  }

  useEffect(() => {
    return () => {
      if (managerRef.current) {
        managerRef.current.destroy();
        managerRef.current = null;
      }
    };
  }, []);

  return managerRef.current;
}

/**
 * React Hook: 监听配置变化
 */
export function useConfigChange(
  manager: ConfigManager,
  callback: (config: PlaygroundConfig) => void
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const unsubscribe = manager.onConfigChange((config) => {
      callbackRef.current(config);
    });

    return unsubscribe;
  }, [manager]);
}
