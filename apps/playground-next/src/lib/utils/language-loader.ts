import type { Language } from '@/types';

/**
 * 语言加载状态管理
 */
class LanguageLoadingState {
  private loadedLanguages = new Set<Language>();
  private loadingLanguages = new Set<Language>();
  private loadingPromises = new Map<Language, Promise<void>>();
  private loadErrors = new Map<Language, string>();

  /** 检查语言是否已加载 */
  isLoaded(language: Language): boolean {
    return this.loadedLanguages.has(language);
  }

  /** 检查语言是否正在加载 */
  isLoading(language: Language): boolean {
    return this.loadingLanguages.has(language);
  }

  /** 获取加载错误 */
  getError(language: Language): string | undefined {
    return this.loadErrors.get(language);
  }

  /** 标记语言为已加载 */
  markLoaded(language: Language): void {
    this.loadedLanguages.add(language);
    this.loadingLanguages.delete(language);
    this.loadingPromises.delete(language);
    this.loadErrors.delete(language);
  }

  /** 标记语言为加载中 */
  markLoading(language: Language, promise: Promise<void>): void {
    this.loadingLanguages.add(language);
    this.loadingPromises.set(language, promise);
    this.loadErrors.delete(language);
  }

  /** 标记语言加载失败 */
  markError(language: Language, error: string): void {
    this.loadingLanguages.delete(language);
    this.loadingPromises.delete(language);
    this.loadErrors.set(language, error);
  }

  /** 获取加载 Promise */
  getLoadingPromise(language: Language): Promise<void> | undefined {
    return this.loadingPromises.get(language);
  }

  /** 获取统计信息 */
  getStats() {
    return {
      loaded: Array.from(this.loadedLanguages),
      loading: Array.from(this.loadingLanguages),
      errors: Object.fromEntries(this.loadErrors)
    };
  }
}

// 全局语言加载状态
const globalLoadingState = new LanguageLoadingState();

/**
 * 语言加载器
 * 负责按需加载语言资源（编译器、运行时等）
 */
export class LanguageLoader {
  private languageService: any;
  private vendorService: any;
  private compilerFactory: any;

  constructor(languageService: any, vendorService: any, compilerFactory: any) {
    this.languageService = languageService;
    this.vendorService = vendorService;
    this.compilerFactory = compilerFactory;
  }

  /** 动态加载语言支持 */
  async loadLanguage(language: Language): Promise<void> {
    // 标准化语言名称
    const normalizedLang = this.languageService.normalizeLanguage(language);

    // 如果已经加载过，直接返回
    if (globalLoadingState.isLoaded(normalizedLang)) {
      return;
    }

    // 如果正在加载，等待加载完成
    if (globalLoadingState.isLoading(normalizedLang)) {
      const existingPromise = globalLoadingState.getLoadingPromise(normalizedLang);
      if (existingPromise) {
        return existingPromise;
      }
    }

    const languageConfig = this.languageService.getLanguageConfig(normalizedLang);
    if (!languageConfig) {
      const error = `不支持的语言: ${language}`;
      globalLoadingState.markError(normalizedLang, error);
      console.warn(`[LanguageLoader] ${error}`);
      return;
    }

    // 开始加载
    const loadPromise = this.doLoadLanguage(normalizedLang, languageConfig);
    globalLoadingState.markLoading(normalizedLang, loadPromise);

    try {
      await loadPromise;
      globalLoadingState.markLoaded(normalizedLang);
      console.log(`[LanguageLoader] 语言 ${language} 加载完成`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '加载失败';
      globalLoadingState.markError(normalizedLang, errorMessage);
      console.error(`[LanguageLoader] 语言 ${language} 加载失败:`, error);
      throw error;
    }
  }

  /** 执行语言加载 */
  private async doLoadLanguage(language: Language, config: any): Promise<void> {
    const promises: Promise<void>[] = [];

    // 加载编译器依赖（如果需要）
    if (config.compiler?.vendorKey) {
      console.log(`[LanguageLoader] 加载 ${language} 编译器依赖: ${config.compiler.vendorKey}`);
      promises.push(this.vendorService.loadVendor(config.compiler.vendorKey));
    }

    // 加载运行时依赖（如果需要）
    if (config.runtime?.vendorKey) {
      console.log(`[LanguageLoader] 加载 ${language} 运行时依赖: ${config.runtime.vendorKey}`);
      promises.push(this.vendorService.loadVendor(config.runtime.vendorKey));
    }

    // 如果没有额外资源需要加载，直接返回
    if (promises.length === 0) {
      console.log(`[LanguageLoader] 语言 ${language} 无需额外资源`);
      return;
    }

    // 并行加载所有资源
    await Promise.all(promises);
    console.log(`[LanguageLoader] 语言 ${language} 的 ${promises.length} 个资源加载完成`);
  }

  /** 预加载常用语言 */
  async preloadCommonLanguages(): Promise<void> {
    const commonLanguages: Language[] = ['javascript', 'typescript', 'html', 'css', 'markdown'];

    console.log('[LanguageLoader] 开始预加载常用语言...');

    const loadPromises = commonLanguages.map(async (lang) => {
      try {
        await this.loadLanguage(lang);
      } catch (error) {
        console.warn(`[LanguageLoader] 预加载语言 ${lang} 失败`, error);
      }
    });

    await Promise.all(loadPromises);
    console.log('[LanguageLoader] 常用语言预加载完成');
  }

  /** 批量加载语言 */
  async loadLanguages(languages: Language[]): Promise<void> {
    const loadPromises = languages.map(lang => this.loadLanguage(lang));
    await Promise.all(loadPromises);
  }

  /** 检查语言是否已加载 */
  isLanguageLoaded(language: Language): boolean {
    const normalizedLang = this.languageService.normalizeLanguage(language);
    return globalLoadingState.isLoaded(normalizedLang);
  }

  /** 检查语言是否正在加载 */
  isLanguageLoading(language: Language): boolean {
    const normalizedLang = this.languageService.normalizeLanguage(language);
    return globalLoadingState.isLoading(normalizedLang);
  }

  /** 获取加载错误 */
  getLanguageError(language: Language): string | undefined {
    const normalizedLang = this.languageService.normalizeLanguage(language);
    return globalLoadingState.getError(normalizedLang);
  }

  /** 获取加载统计信息 */
  getLoadingStats() {
    return globalLoadingState.getStats();
  }
}

// 全局语言加载器实例
let globalLanguageLoader: LanguageLoader | null = null;

/** 获取全局语言加载器 */
export function getGlobalLanguageLoader(): LanguageLoader {
  if (!globalLanguageLoader) {
    // 创建一个简单的代理对象，延迟获取服务实例
    const serviceProxy = {
      getLanguageService: () => {
        const { useGlobalLanguageService } = require('@/lib/services/language-service');
        return useGlobalLanguageService();
      },
      getVendorService: () => {
        const { useGlobalVendorService } = require('@/lib/services/vendors');
        return useGlobalVendorService();
      },
      getCompilerFactory: () => {
        const { useGlobalCompilerFactory } = require('@/lib/compiler/compiler-factory');
        return useGlobalCompilerFactory();
      }
    };

    globalLanguageLoader = new LanguageLoader(
      serviceProxy.getLanguageService(),
      serviceProxy.getVendorService(),
      serviceProxy.getCompilerFactory()
    );
  }
  return globalLanguageLoader;
}

/** 销毁全局语言加载器 */
export function destroyGlobalLanguageLoader(): void {
  globalLanguageLoader = null;
}

/**
 * React Hook: 使用语言加载器
 */
export function useLanguageLoader() {
  // 直接在 Hook 中获取服务，避免循环依赖
  const { useGlobalLanguageService } = require('@/lib/services/language-service');
  const { useGlobalVendorService } = require('@/lib/services/vendors');

  const languageService = useGlobalLanguageService();
  const vendorService = useGlobalVendorService();

  // 简化的加载函数，直接使用服务
  const loadLanguage = async (language: Language): Promise<void> => {
    const normalizedLang = languageService.normalizeLanguage(language);

    // 如果已经加载过，直接返回
    if (globalLoadingState.isLoaded(normalizedLang)) {
      return;
    }

    // 如果正在加载，等待加载完成
    if (globalLoadingState.isLoading(normalizedLang)) {
      const existingPromise = globalLoadingState.getLoadingPromise(normalizedLang);
      if (existingPromise) {
        return existingPromise;
      }
    }

    const languageConfig = languageService.getLanguageConfig(normalizedLang);
    if (!languageConfig) {
      const error = `不支持的语言: ${language}`;
      globalLoadingState.markError(normalizedLang, error);
      console.warn(`[LanguageLoader] ${error}`);
      return;
    }

    // 开始加载
    const loadPromise = (async () => {
      const promises: Promise<void>[] = [];

      // 加载编译器依赖（如果需要）
      if (languageConfig.compiler?.vendorKey) {
        console.log(`[LanguageLoader] 加载 ${language} 编译器依赖: ${languageConfig.compiler.vendorKey}`);
        promises.push(vendorService.loadVendor(languageConfig.compiler.vendorKey));
      }

      // 加载运行时依赖（如果需要）
      if (languageConfig.runtime?.vendorKey) {
        console.log(`[LanguageLoader] 加载 ${language} 运行时依赖: ${languageConfig.runtime.vendorKey}`);
        promises.push(vendorService.loadVendor(languageConfig.runtime.vendorKey));
      }

      // 如果没有额外资源需要加载，直接返回
      if (promises.length === 0) {
        console.log(`[LanguageLoader] 语言 ${language} 无需额外资源`);
        return;
      }

      // 并行加载所有资源
      await Promise.all(promises);
      console.log(`[LanguageLoader] 语言 ${language} 的 ${promises.length} 个资源加载完成`);
    })();

    globalLoadingState.markLoading(normalizedLang, loadPromise);

    try {
      await loadPromise;
      globalLoadingState.markLoaded(normalizedLang);
      console.log(`[LanguageLoader] 语言 ${language} 加载完成`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '加载失败';
      globalLoadingState.markError(normalizedLang, errorMessage);
      console.error(`[LanguageLoader] 语言 ${language} 加载失败:`, error);
      throw error;
    }
  };

  return {
    loadLanguage,
    loadLanguages: async (languages: Language[]) => {
      const loadPromises = languages.map(lang => loadLanguage(lang));
      await Promise.all(loadPromises);
    },
    preloadCommonLanguages: async () => {
      const commonLanguages: Language[] = ['javascript', 'typescript', 'html', 'css', 'markdown'];
      console.log('[LanguageLoader] 开始预加载常用语言...');
      const loadPromises = commonLanguages.map(async (lang) => {
        try {
          await loadLanguage(lang);
        } catch (error) {
          console.warn(`[LanguageLoader] 预加载语言 ${lang} 失败`, error);
        }
      });
      await Promise.all(loadPromises);
      console.log('[LanguageLoader] 常用语言预加载完成');
    },
    isLanguageLoaded: (language: Language) => {
      const normalizedLang = languageService.normalizeLanguage(language);
      return globalLoadingState.isLoaded(normalizedLang);
    },
    isLanguageLoading: (language: Language) => {
      const normalizedLang = languageService.normalizeLanguage(language);
      return globalLoadingState.isLoading(normalizedLang);
    },
    getLanguageError: (language: Language) => {
      const normalizedLang = languageService.normalizeLanguage(language);
      return globalLoadingState.getError(normalizedLang);
    },
    getLoadingStats: () => globalLoadingState.getStats()
  };
}

/**
 * React Hook: 语言加载状态
 */
export function useLanguageLoadingState(language: Language) {
  const { useGlobalLanguageService } = require('@/lib/services/language-service');
  const languageService = useGlobalLanguageService();
  const { loadLanguage } = useLanguageLoader();

  const normalizedLang = languageService.normalizeLanguage(language);

  return {
    isLoaded: globalLoadingState.isLoaded(normalizedLang),
    isLoading: globalLoadingState.isLoading(normalizedLang),
    error: globalLoadingState.getError(normalizedLang),
    load: () => loadLanguage(language)
  };
}
