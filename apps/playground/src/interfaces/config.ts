import type { Language, Config, EditorConfig } from '@/types';

/**
 * 配置管理器接口
 */
export interface IConfigManager {
  /** 获取当前配置 */
  getConfig(): Config;
  
  /** 更新配置 */
  updateConfig(updates: Partial<Config>): void;
  
  /** 重置为默认配置 */
  resetToDefault(): void;
  
  /** 验证配置 */
  validateConfig(config: Partial<Config>): boolean;
  
  /** 监听配置变化 */
  onConfigChange(callback: (config: Config) => void): void;
  
  /** 移除配置变化监听器 */
  offConfigChange(callback: (config: Config) => void): void;
  
  /** 从 URL 加载配置 */
  loadFromURL(): Partial<Config>;
  
  /** 保存配置到 URL */
  saveToURL(): void;
  
  /** 从本地存储加载配置 */
  loadFromStorage(): Partial<Config>;
  
  /** 保存配置到本地存储 */
  saveToStorage(): void;
}

/**
 * 配置验证器接口
 */
export interface IConfigValidator {
  /** 验证完整配置 */
  validate(config: Config): ValidationResult;
  
  /** 验证编辑器配置 */
  validateEditorConfig(config: EditorConfig): ValidationResult;
  
  /** 验证语言配置 */
  validateLanguage(language: Language): ValidationResult;
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean;
  
  /** 错误信息 */
  errors: string[];
  
  /** 警告信息 */
  warnings: string[];
}

/**
 * 配置提供者接口
 */
export interface IConfigProvider {
  /** 提供者名称 */
  readonly name: string;
  
  /** 加载配置 */
  load(): Promise<Partial<Config>>;
  
  /** 保存配置 */
  save(config: Config): Promise<void>;
  
  /** 检查是否支持 */
  isSupported(): boolean;
}
