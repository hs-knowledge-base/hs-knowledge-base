import { useRef, useEffect } from 'react';
import type { Language, EditorType } from '@/types';
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES, LANGUAGE_EXTENSIONS } from '@/constants';

/**
 * 语言规格配置
 */
export interface LanguageSpecs {
  name: Language;
  title: string;
  longTitle: string;
  extensions: string[];
  editorType: EditorType;
  monacoLanguage: string;
  aliases?: string[];
  compiler?: {
    vendorKey: string;
    url?: string;
  };
  runtime?: {
    vendorKey: string;
    url?: string;
  };
}

/**
 * 语言注册表 - 统一的语言配置定义
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
    aliases: ['js']
  },
  typescript: {
    name: 'typescript',
    title: 'TS',
    longTitle: 'TypeScript',
    extensions: ['ts'],
    editorType: 'script',
    monacoLanguage: 'typescript',
    compiler: {
      vendorKey: 'typescript',
      url: 'https://unpkg.com/typescript@5.0.4/lib/typescript.js'
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
    aliases: ['htm']
  },
  markdown: {
    name: 'markdown',
    title: 'MD',
    longTitle: 'Markdown',
    extensions: ['md', 'markdown'],
    editorType: 'markup',
    monacoLanguage: 'markdown',
    compiler: {
      vendorKey: 'marked',
      url: 'https://cdn.jsdelivr.net/npm/marked@9.1.6/marked.min.js'
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
      vendorKey: 'sass',
      url: 'https://cdn.jsdelivr.net/npm/sass@1.69.5/sass.js'
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
      vendorKey: 'less',
      url: 'https://cdn.jsdelivr.net/npm/less@4.2.0/dist/less.min.js'
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

/**
 * 语言服务类 - React 适配版本
 */
export class LanguageService {
  private readonly loadedLanguages = new Set<string>();
  private readonly languageCache = new Map<string, LanguageSpecs>();
  private readonly supportedLanguagesCache = new Set<Language>();

  constructor() {
    this.initializeCache();
    console.info('[LanguageService] 语言服务初始化完成');
  }

  /** 初始化缓存 */
  private initializeCache(): void {
    // 缓存所有语言配置
    Object.entries(languageRegistry).forEach(([lang, config]) => {
      this.languageCache.set(lang, config);
      this.supportedLanguagesCache.add(lang as Language);
    });

    console.info(`[LanguageService] 支持 ${this.supportedLanguagesCache.size} 种语言`);
  }

  /** 获取语言配置（带缓存） */
  getLanguageConfig(language: Language): LanguageSpecs | null {
    return this.languageCache.get(language) || null;
  }

  /** 注册新语言（语言插件机制） */
  registerLanguage(language: Language, config: LanguageSpecs): void {
    console.info(`[LanguageService] 注册新语言: ${language}`);

    // 更新注册表和缓存
    languageRegistry[language] = config;
    this.languageCache.set(language, config);
    this.supportedLanguagesCache.add(language);
  }

  /** 注销语言 */
  unregisterLanguage(language: Language): void {
    console.info(`[LanguageService] 注销语言: ${language}`);

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

    console.info(`[LanguageService] 批量注册了 ${Object.keys(languages).length} 种语言`);
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
  getLanguagesByEditorType(editorType: EditorType): Language[] {
    return this.getSupportedLanguages().filter(lang => 
      languageRegistry[lang].editorType === editorType
    );
  }

  /** 获取语言显示名称 */
  getLanguageDisplayName(language: Language): string {
    const config = this.getLanguageConfig(language);
    return config?.longTitle || config?.title || LANGUAGE_NAMES[language] || language;
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
    return config?.compiler?.url || null;
  }

  /** 获取语言运行时 URL */
  getRuntimeUrl(language: Language): string | null {
    const config = this.getLanguageConfig(language);
    return config?.runtime?.url || null;
  }

  /** 获取语言文件扩展名 */
  getLanguageExtension(language: Language): string {
    const config = this.getLanguageConfig(language);
    return config?.extensions[0] || LANGUAGE_EXTENSIONS[language] || `.${language}`;
  }

  /** 根据文件扩展名推断语言 */
  detectLanguageFromExtension(extension: string): Language | null {
    const cleanExt = extension.replace('.', '').toLowerCase();
    
    for (const [lang, config] of Object.entries(languageRegistry)) {
      if (config.extensions.includes(cleanExt)) {
        return lang as Language;
      }
    }
    
    return null;
  }

  /** 检查语言是否已加载 */
  isLanguageLoaded(language: Language): boolean {
    return this.loadedLanguages.has(language);
  }

  /** 标记语言为已加载 */
  markLanguageAsLoaded(language: Language): void {
    this.loadedLanguages.add(language);
    console.debug(`[LanguageService] 语言已加载: ${language}`);
  }

  /** 获取语言统计信息 */
  getStats() {
    return {
      totalLanguages: this.supportedLanguagesCache.size,
      loadedLanguages: this.loadedLanguages.size,
      nativeLanguages: this.getNativeLanguages().length,
      compilableLanguages: this.getSupportedLanguages().filter(lang => this.needsCompiler(lang)).length,
      runtimeLanguages: this.getSupportedLanguages().filter(lang => this.needsRuntime(lang)).length
    };
  }

  /** 销毁语言服务 */
  destroy(): void {
    this.loadedLanguages.clear();
    this.languageCache.clear();
    this.supportedLanguagesCache.clear();
    console.info('[LanguageService] 语言服务已销毁');
  }
}

// 全局语言服务实例
let globalLanguageService: LanguageService | null = null;

/** 获取全局语言服务 */
export function getGlobalLanguageService(): LanguageService {
  if (!globalLanguageService) {
    globalLanguageService = new LanguageService();
  }
  return globalLanguageService;
}

/** 销毁全局语言服务 */
export function destroyGlobalLanguageService(): void {
  if (globalLanguageService) {
    globalLanguageService.destroy();
    globalLanguageService = null;
  }
}

/**
 * React Hook: 使用语言服务
 */
export function useLanguageService(): LanguageService {
  const serviceRef = useRef<LanguageService | null>(null);

  if (!serviceRef.current) {
    serviceRef.current = new LanguageService();
  }

  useEffect(() => {
    return () => {
      if (serviceRef.current) {
        serviceRef.current.destroy();
        serviceRef.current = null;
      }
    };
  }, []);

  return serviceRef.current;
}

/**
 * React Hook: 使用全局语言服务
 */
export function useGlobalLanguageService(): LanguageService {
  return getGlobalLanguageService();
}
