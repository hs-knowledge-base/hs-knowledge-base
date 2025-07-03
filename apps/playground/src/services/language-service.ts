import { vendorService } from './vendors';
import { CompilerFactory } from '../compiler/compiler-factory';
import {Language, LanguageSpecs, VendorCategory} from '@/types';
import { Logger } from '@/utils/logger';

/**
 * 语言注册表 - 统一的语言配置定义
 * 所有语言的配置都在这里定义，避免重复
 */
const languageRegistry: Record<Language, LanguageSpecs> = {
  // 脚本语言
  javascript: {
    name: 'javascript',
    title: 'JS',
    longTitle: 'JavaScript',
    extensions: ['js', 'mjs'],
    editorType: 'script',
    monacoLanguage: 'javascript',
    // JavaScript 由 Monaco Editor 原生支持，无需额外资源
    aliases: ['js']
  },
  typescript: {
    name: 'typescript',
    title: 'TS',
    longTitle: 'TypeScript',
    extensions: ['ts'],
    editorType: 'script',
    monacoLanguage: 'typescript',
    // TypeScript 需要编译器进行类型检查和转译
    compiler: {
      category: VendorCategory.COMPILER,
      vendorKey: 'typescript'
    },
    aliases: ['ts']
  },
  // 标记语言
  html: {
    name: 'html',
    title: 'HTML',
    longTitle: 'HTML',
    extensions: ['html', 'htm'],
    editorType: 'markup',
    monacoLanguage: 'html',
    // HTML 由 Monaco Editor 原生支持
    aliases: ['htm']
  },
  markdown: {
    name: 'markdown',
    title: 'MD',
    longTitle: 'Markdown',
    extensions: ['md', 'markdown'],
    editorType: 'markup',
    monacoLanguage: 'markdown',
    // Markdown 需要编译器来渲染为 HTML
    compiler: {
      category: VendorCategory.COMPILER,
      vendorKey: 'markdownIt'
    },
    aliases: ['md']
  },

  // 样式语言
  css: {
    name: 'css',
    title: 'CSS',
    longTitle: 'CSS',
    extensions: ['css'],
    editorType: 'style',
    monacoLanguage: 'css'
  },

  scss: {
    name: 'scss',
    title: 'SCSS',
    longTitle: 'SCSS',
    extensions: ['scss'],
    editorType: 'style',
    monacoLanguage: 'scss',
    compiler: {
      category: VendorCategory.STYLE,
      vendorKey: 'sass'
    }
  },

  less: {
    name: 'less',
    title: 'Less',
    longTitle: 'Less',
    extensions: ['less'],
    editorType: 'style',
    monacoLanguage: 'less',
    compiler: {
      category: VendorCategory.STYLE,
      vendorKey: 'less'
    }
  },

  // 其他语言
  json: {
    name: 'json',
    title: 'JSON',
    longTitle: 'JSON',
    extensions: ['json'],
    editorType: 'script',
    monacoLanguage: 'json'
  },

  xml: {
    name: 'xml',
    title: 'XML',
    longTitle: 'XML',
    extensions: ['xml'],
    editorType: 'markup',
    monacoLanguage: 'xml'
  },

  yaml: {
    name: 'yaml',
    title: 'YAML',
    longTitle: 'YAML',
    extensions: ['yml', 'yaml'],
    editorType: 'script',
    monacoLanguage: 'yaml',
    aliases: ['yml']
  }
};

/** 语言服务类 */
class LanguageService {
  private readonly logger = new Logger('LanguageService');
  private readonly loadedLanguages = new Set<string>();
  private readonly compilerFactory = new CompilerFactory();
  private readonly languageCache = new Map<string, LanguageSpecs>();
  private readonly supportedLanguagesCache = new Set<Language>();

  constructor() {
    this.initializeCache();
    this.validateLanguageCompilerConsistency();
  }

  /** 初始化缓存 */
  private initializeCache(): void {
    // 缓存所有语言配置
    Object.entries(languageRegistry).forEach(([lang, config]) => {
      this.languageCache.set(lang, config);
      this.supportedLanguagesCache.add(lang as Language);
    });

    this.logger.info(`语言服务初始化完成，支持 ${this.supportedLanguagesCache.size} 种语言`);
  }

  /** 获取语言配置（带缓存） */
  getLanguageConfig(language: Language): LanguageSpecs | null {
    return this.languageCache.get(language) || null;
  }

  /** 注册新语言（语言插件机制） */
  registerLanguage(language: Language, config: LanguageSpecs): void {
    this.logger.info(`注册新语言: ${language}`);

    // 更新注册表和缓存
    languageRegistry[language] = config;
    this.languageCache.set(language, config);
    this.supportedLanguagesCache.add(language);

    // 触发重新验证
    this.validateLanguageCompilerConsistency();
  }

  /** 注销语言 */
  unregisterLanguage(language: Language): void {
    this.logger.info(`注销语言: ${language}`);

    delete languageRegistry[language];
    this.languageCache.delete(language);
    this.supportedLanguagesCache.delete(language);
    this.loadedLanguages.delete(language);
  }

  /** 批量注册语言 */
  registerLanguages(languages: Record<Language, LanguageSpecs>): void {
    Object.entries(languages).forEach(([lang, config]) => {
      this.registerLanguage(lang as Language, config);
    });

    this.logger.info(`批量注册了 ${Object.keys(languages).length} 种语言`);
  }

  /** 验证语言配置与编译器的一致性 */
  private validateLanguageCompilerConsistency(): void {
    const configuredLanguages = Object.keys(languageRegistry) as Language[];
    const compilableLanguages = this.compilerFactory.getSupportedLanguages();

    this.logger.info('语言配置验证:');
    this.logger.info(`- 配置的语言: ${configuredLanguages.join(', ')}`);
    this.logger.info(`- 有编译器的语言: ${compilableLanguages.join(', ')}`);

    // 检查配置的语言是否都有对应的编译器
    const missingCompilers = configuredLanguages.filter(lang =>
      !compilableLanguages.includes(lang)
    );

    if (missingCompilers.length > 0) {
      this.logger.warn(`以下语言缺少编译器: ${missingCompilers.join(', ')}`);
    }

    // 检查是否有编译器但没有语言配置
    const missingConfigs = compilableLanguages.filter(lang =>
      !configuredLanguages.includes(lang)
    );

    if (missingConfigs.length > 0) {
      this.logger.warn(`以下编译器缺少语言配置: ${missingConfigs.join(', ')}`);
    }

    if (missingCompilers.length === 0 && missingConfigs.length === 0) {
      this.logger.info('✅ 语言配置与编译器完全一致');
    }
  }

  /** 获取所有支持的语言（使用缓存） */
  getSupportedLanguages(): Language[] {
    return Array.from(this.supportedLanguagesCache);
  }

  /** 获取所有已注册的语言（包括没有编译器的） */
  getAllRegisteredLanguages(): Language[] {
    return Object.keys(languageRegistry) as Language[];
  }

  /** 获取无需额外资源的语言（Monaco Editor 原生支持） */
  getNativeLanguages(): Language[] {
    return this.getSupportedLanguages().filter(lang => {
      const config = languageRegistry[lang];
      return !config.compiler && !config.runtime;
    });
  }

  /** 根据编辑器类型获取语言 */
  getLanguagesByEditorType(editorType: 'markup' | 'style' | 'script'): Language[] {
    return this.getSupportedLanguages().filter(lang => 
      languageRegistry[lang].editorType === editorType
    );
  }

  /** 获取语言显示名称 */
  getLanguageDisplayName(language: Language): string {
    const config = this.getLanguageConfig(language);
    return config?.longTitle || config?.title || language;
  }

  /** 标准化语言名称（处理别名） */
  normalizeLanguage(language: string): Language {
    const lowerLang = language.toLowerCase();
    
    // 查找别名
    for (const [lang, config] of Object.entries(languageRegistry)) {
      if (config.aliases?.includes(lowerLang)) {
        return lang as Language;
      }
    }
    
    return lowerLang as Language;
  }

  /** 检查语言是否需要编译器 */
  needsCompiler(language: Language): boolean {
    const config = this.getLanguageConfig(language);
    return !!config?.compiler;
  }

  /** 检查语言是否需要运行时 */
  needsRuntime(language: Language): boolean {
    const config = this.getLanguageConfig(language);
    return !!config?.runtime;
  }

  /** 获取语言编译器 URL */
  getCompilerUrl(language: Language): string | null {
    const config = this.getLanguageConfig(language);
    if (!config?.compiler) return null;
    
    try {
      return vendorService.getVendorUrl(
        config.compiler.category,
        config.compiler.vendorKey
      );
    } catch {
      return null;
    }
  }

  /** 获取语言运行时 URL */
  getRuntimeUrl(language: Language): string | null {
    const config = this.getLanguageConfig(language);
    if (!config?.runtime) return null;
    
    try {
      return vendorService.getVendorUrl(
        config.runtime.category,
        config.runtime.vendorKey
      );
    } catch {
      return null;
    }
  }

  /** 检查语言是否已加载 */
  isLanguageLoaded(language: Language): boolean {
    const normalizedLang = this.normalizeLanguage(language);
    return this.loadedLanguages.has(normalizedLang);
  }

  /** 标记语言为已加载 */
  markLanguageLoaded(language: Language): void {
    const normalizedLang = this.normalizeLanguage(language);
    this.loadedLanguages.add(normalizedLang);
  }

  /** 获取 Monaco Editor 语言名称 */
  getMonacoLanguage(language: Language): string {
    const config = this.getLanguageConfig(language);
    return config?.monacoLanguage || language;
  }

  /** 根据文件扩展名获取语言 */
  getLanguageByExtension(extension: string): Language | null {
    const cleanExt = extension.replace(/^\./, '').toLowerCase();
    
    for (const [lang, config] of Object.entries(languageRegistry)) {
      if (config.extensions.includes(cleanExt)) {
        return lang as Language;
      }
    }
    
    return null;
  }

  /** 获取编译器 */
  getCompiler(language: Language) {
    return this.compilerFactory.getCompiler(language);
  }

  /** 编译代码 */
  async compile(code: string, language: Language, options: any = {}) {
    return this.compilerFactory.compileWithCache(code, language, options);
  }

  /** 检查语言是否支持编译 */
  supports(language: Language): boolean {
    return this.compilerFactory.supports(language);
  }

  /** 清除编译缓存 */
  clearCache(): void {
    this.compilerFactory.clearCache();
    this.logger.info('编译缓存已清除');
  }

  /** 获取统计信息 */
  getStats() {
    const supportedLanguages = this.getSupportedLanguages();
    const languagesByType = {
      markup: this.getLanguagesByEditorType('markup'),
      style: this.getLanguagesByEditorType('style'),
      script: this.getLanguagesByEditorType('script')
    };

    return {
      totalLanguages: supportedLanguages.length,
      supportedLanguages,
      languagesByType,
      compilerCacheSize: (this.compilerFactory as any).cache?.size || 0
    };
  }

  /** 添加自定义语言配置（已废弃，使用 registerLanguage） */
  addLanguage(language: Language, config: LanguageSpecs): void {
    this.logger.warn('addLanguage 已废弃，请使用 registerLanguage');
    this.registerLanguage(language, config);
  }

  /** 更新语言配置（热更新） */
  updateLanguage(language: Language, updates: Partial<LanguageSpecs>): void {
    const existing = this.getLanguageConfig(language);
    if (existing) {
      const newConfig = { ...existing, ...updates };
      this.registerLanguage(language, newConfig);
      this.logger.info(`语言配置已热更新: ${language}`);
    } else {
      this.logger.warn(`尝试更新不存在的语言: ${language}`);
    }
  }

  /** 预加载常用语言资源 */
  async preloadCommonLanguages(): Promise<void> {
    const commonLanguages: Language[] = ['javascript', 'typescript', 'html', 'css', 'markdown'];

    this.logger.info('开始预加载常用语言资源...');

    const loadPromises = commonLanguages.map(async (lang) => {
      try {
        if (this.needsCompiler(lang)) {
          const compilerUrl = this.getCompilerUrl(lang);
          if (compilerUrl) {
            // 这里可以预加载编译器资源
            this.logger.debug(`预加载编译器: ${lang}`);
          }
        }
        this.markLanguageLoaded(lang);
      } catch (error) {
        this.logger.warn(`预加载语言 ${lang} 失败`, error);
      }
    });

    await Promise.all(loadPromises);
    this.logger.info('常用语言资源预加载完成');
  }

  /** 获取语言加载性能统计 */
  getPerformanceStats() {
    return {
      totalRegistered: this.supportedLanguagesCache.size,
      totalLoaded: this.loadedLanguages.size,
      cacheHitRate: this.languageCache.size > 0 ? (this.loadedLanguages.size / this.languageCache.size) : 0,
      loadedLanguages: Array.from(this.loadedLanguages),
      registeredLanguages: Array.from(this.supportedLanguagesCache)
    };
  }

  /** 清除所有缓存 */
  clearAllCaches(): void {
    this.loadedLanguages.clear();
    this.compilerFactory.clearCache();
    this.compilerFactory.clearCompilerInstances();
    this.logger.info('所有缓存已清除');
  }
}

/** 语言服务实例 */
export const languageService = new LanguageService();

/** 便捷导出 */
export const getSupportedLanguages = () => languageService.getSupportedLanguages();
export const getNativeLanguages = () => languageService.getNativeLanguages();
export const getLanguagesByEditorType = (editorType: 'markup' | 'style' | 'script') =>
  languageService.getLanguagesByEditorType(editorType);
export const getLanguageDisplayName = (language: Language) =>
  languageService.getLanguageDisplayName(language);
export const normalizeLanguage = (language: string) =>
  languageService.normalizeLanguage(language);
export const getLanguageConfig = (language: Language) =>
  languageService.getLanguageConfig(language);
export const needsCompiler = (language: Language) =>
  languageService.needsCompiler(language);
export const needsRuntime = (language: Language) =>
  languageService.needsRuntime(language);
export const getCompilerUrl = (language: Language) =>
  languageService.getCompilerUrl(language);
export const getRuntimeUrl = (language: Language) =>
  languageService.getRuntimeUrl(language);
export const isLanguageLoaded = (language: Language) =>
  languageService.isLanguageLoaded(language);
export const markLanguageLoaded = (language: Language) =>
  languageService.markLanguageLoaded(language);
export const getMonacoLanguage = (language: Language) =>
  languageService.getMonacoLanguage(language);
export const getLanguageByExtension = (extension: string) =>
  languageService.getLanguageByExtension(extension);
