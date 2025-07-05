import { useEffect, useCallback, useRef, useState } from 'react';
import type { CompilerConfig, CodeContent } from '@/types';
import { DEFAULT_CODE, DEFAULT_EDITOR_CONFIG } from '@/constants';
import { Logger } from './logger';
import { ConfigValidator } from './config-validator';
import { createErrorHandler } from './error-handler';

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
 * 配置管理器
 * 统一管理 Playground 的配置，支持验证、热更新等功能
 */
export class ConfigManager {
  private readonly logger = new Logger(ConfigManager.name);
  private readonly validator = new ConfigValidator();
  private readonly errorHandler = createErrorHandler(ConfigManager.name);
  private config: PlaygroundConfig;
  private readonly changeListeners = new Set<(config: PlaygroundConfig) => void>();

  constructor(initialConfig?: Partial<PlaygroundConfig>) {
    this.config = this.mergeWithDefaults(initialConfig || {});
    this.validator.validate(this.config);
    this.logger.info('配置管理器初始化完成');
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
      this.validator.validate(this.config);
      
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
    this.logger.info('配置已重置为默认值');
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
      this.errorHandler.safeExecuteSync(
        () => callback(config),
        '配置变化回调执行失败'
      );
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
    if (typeof window === 'undefined') return;
    
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
  loadFromStorage(key: string = 'playground-config'): Partial<PlaygroundConfig> {
    if (typeof window === 'undefined') return {};
    
    try {
      const stored = localStorage.getItem(key);
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
  saveToStorage(key: string = 'playground-config'): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(this.config));
      this.logger.debug('配置已保存到本地存储');
    } catch (error) {
      this.logger.warn('保存配置到本地存储失败', error);
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
      this.logger.info('配置导入成功');
    } catch (error) {
      this.logger.error('配置导入失败', error);
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
    this.logger.info('配置管理器已销毁');
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

/**
 * React Hook: 获取配置值
 */
export function useConfigValue<T>(
  manager: ConfigManager,
  selector: (config: PlaygroundConfig) => T
): T {
  const [value, setValue] = useState(() => selector(manager.getConfig()));

  useEffect(() => {
    const unsubscribe = manager.onConfigChange((config) => {
      setValue(selector(config));
    });
    return unsubscribe;
  }, [manager, selector]);

  return value;
}

/**
 * React Hook: 配置更新器
 */
export function useConfigUpdater(manager: ConfigManager) {
  return useCallback((updates: Partial<PlaygroundConfig>) => {
    manager.updateConfig(updates);
  }, [manager]);
}
