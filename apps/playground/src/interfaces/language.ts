import type { Language, LanguageSpecs } from '@/types';

/**
 * 语言服务接口
 */
export interface ILanguageService {
  /** 获取语言配置 */
  getLanguageConfig(language: Language): LanguageSpecs | null;
  
  /** 获取所有支持的语言 */
  getSupportedLanguages(): Language[];
  
  /** 根据编辑器类型获取语言 */
  getLanguagesByEditorType(editorType: 'markup' | 'style' | 'script'): Language[];
  
  /** 获取语言显示名称 */
  getLanguageDisplayName(language: Language): string;
  
  /** 标准化语言名称 */
  normalizeLanguage(language: string): Language;
  
  /** 检查语言是否需要编译器 */
  needsCompiler(language: Language): boolean;
  
  /** 检查语言是否需要运行时 */
  needsRuntime(language: Language): boolean;
  
  /** 获取语言编译器 URL */
  getCompilerUrl(language: Language): string | null;
  
  /** 获取语言运行时 URL */
  getRuntimeUrl(language: Language): string | null;
  
  /** 检查语言是否已加载 */
  isLanguageLoaded(language: Language): boolean;
  
  /** 标记语言为已加载 */
  markLanguageLoaded(language: Language): void;
  
  /** 根据文件扩展名获取语言 */
  getLanguageByExtension(extension: string): Language | null;
  
  /** 注册语言 */
  registerLanguage(language: Language, config: LanguageSpecs): void;
  
  /** 注销语言 */
  unregisterLanguage(language: Language): void;
}

/**
 * 语言加载器接口
 */
export interface ILanguageLoader {
  /** 加载语言资源 */
  loadLanguage(language: Language): Promise<void>;
  
  /** 预加载常用语言 */
  preloadCommonLanguages(): Promise<void>;
  
  /** 检查语言是否已加载 */
  isLoaded(language: Language): boolean;
  
  /** 获取加载进度 */
  getLoadingProgress(language: Language): number;
}

/**
 * 语言注册表接口
 */
export interface ILanguageRegistry {
  /** 注册语言 */
  register(language: Language, config: LanguageSpecs): void;
  
  /** 获取语言配置 */
  get(language: Language): LanguageSpecs | undefined;
  
  /** 检查语言是否存在 */
  has(language: Language): boolean;
  
  /** 获取所有语言 */
  getAll(): Record<Language, LanguageSpecs>;
  
  /** 移除语言 */
  remove(language: Language): void;
  
  /** 清空注册表 */
  clear(): void;
}
