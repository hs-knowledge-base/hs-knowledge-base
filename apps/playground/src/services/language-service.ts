import { vendorService, VendorCategory } from './vendors';
import { modulesService } from './modules';
import type { Language } from '../types';

/** 语言配置接口 */
export interface LanguageConfig {
  name: Language;
  title: string;
  longTitle?: string;
  extensions: string[];
  editorType: 'markup' | 'style' | 'script';
  monacoLanguage?: string;
  compiler?: {
    category: VendorCategory;
    vendorKey: string;
    needsRuntime?: boolean;
  };
  runtime?: {
    category: VendorCategory;
    vendorKey: string;
  };
  isBuiltin?: boolean;
  aliases?: string[];
}

/** 语言注册表 */
const languageRegistry: Record<Language, LanguageConfig> = {
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
  python: {
    name: 'python',
    title: 'Python',
    longTitle: 'Python',
    extensions: ['py'],
    editorType: 'script',
    monacoLanguage: 'python',
    // Python 需要 Pyodide 运行时来执行代码
    runtime: {
      category: VendorCategory.COMPILER,
      vendorKey: 'pyodide'
    },
    aliases: ['py']
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
    // CSS 由 Monaco Editor 原生支持
  },
  
  // 数据格式
  json: {
    name: 'json',
    title: 'JSON',
    longTitle: 'JSON',
    extensions: ['json'],
    editorType: 'script',
    monacoLanguage: 'json'
    // JSON 由 Monaco Editor 原生支持
  },
  yaml: {
    name: 'yaml',
    title: 'YAML',
    longTitle: 'YAML',
    extensions: ['yaml', 'yml'],
    editorType: 'script',
    monacoLanguage: 'yaml',
    // YAML 由 Monaco Editor 原生支持
    aliases: ['yml']
  },

  // JSX/TSX
  jsx: {
    name: 'jsx',
    title: 'JSX',
    longTitle: 'React JSX',
    extensions: ['jsx'],
    editorType: 'script',
    monacoLanguage: 'javascript',
    // JSX 需要 Babel 编译器来转译
    compiler: {
      category: VendorCategory.COMPILER,
      vendorKey: 'babel'
    }
  },
  tsx: {
    name: 'tsx',
    title: 'TSX',
    longTitle: 'React TSX',
    extensions: ['tsx'],
    editorType: 'script',
    monacoLanguage: 'typescript',
    // TSX 需要 TypeScript 编译器来转译
    compiler: {
      category: VendorCategory.COMPILER,
      vendorKey: 'typescript'
    }
  },
  
  // 框架
  vue: {
    name: 'vue',
    title: 'Vue',
    longTitle: 'Vue.js',
    extensions: ['vue'],
    editorType: 'script',
    monacoLanguage: 'html',
    // Vue 单文件组件需要专门的编译器
    compiler: {
      category: VendorCategory.FRAMEWORK,
      vendorKey: 'vueCompilerSfc'
    }
  },
  svelte: {
    name: 'svelte',
    title: 'Svelte',
    longTitle: 'Svelte',
    extensions: ['svelte'],
    editorType: 'script',
    monacoLanguage: 'html',
    // Svelte 组件需要专门的编译器
    compiler: {
      category: VendorCategory.FRAMEWORK,
      vendorKey: 'svelte'
    }
  },

  // 系统语言（仅语法高亮，暂不支持运行）
  go: {
    name: 'go',
    title: 'Go',
    longTitle: 'Go',
    extensions: ['go'],
    editorType: 'script',
    monacoLanguage: 'go'
    // Go 仅提供语法高亮，无运行时支持
  },
  rust: {
    name: 'rust',
    title: 'Rust',
    longTitle: 'Rust',
    extensions: ['rs'],
    editorType: 'script',
    monacoLanguage: 'rust'
    // Rust 仅提供语法高亮，无运行时支持
  },
  java: {
    name: 'java',
    title: 'Java',
    longTitle: 'Java',
    extensions: ['java'],
    editorType: 'script',
    monacoLanguage: 'java'
    // Java 仅提供语法高亮，无运行时支持
  }
};

/** 语言服务类 */
class LanguageService {
  private readonly loadedLanguages = new Set<string>();

  /** 获取语言配置 */
  getLanguageConfig(language: Language): LanguageConfig | null {
    return languageRegistry[language] || null;
  }

  /** 获取所有支持的语言 */
  getSupportedLanguages(): Language[] {
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

  /** 添加自定义语言配置 */
  addLanguage(language: Language, config: LanguageConfig): void {
    languageRegistry[language] = config;
  }

  /** 更新语言配置 */
  updateLanguage(language: Language, updates: Partial<LanguageConfig>): void {
    const existing = languageRegistry[language];
    if (existing) {
      languageRegistry[language] = { ...existing, ...updates };
    }
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
