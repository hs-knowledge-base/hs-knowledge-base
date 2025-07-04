import { useRef, useEffect } from 'react';
import type { Language, CompileResult } from '@/types';
import { useGlobalVendorService } from '@/lib/services/vendors';
import { useCompilerStore } from '@/stores/compiler-store';

/** 编译器接口 */
export interface ICompiler {
  /** 编译器名称 */
  name: string;
  /** 支持的语言 */
  language: Language;
  /** 编译代码 */
  compile(code: string, options?: any): Promise<CompileResult>;
  /** 是否需要外部依赖 */
  needsVendor(): boolean;
  /** 获取依赖的 vendor 键名 */
  getVendorKey(): string | null;
}

/** 编译选项 */
export interface CompileOptions {
  /** 是否压缩代码 */
  minify?: boolean;
  /** 是否生成 source map */
  sourceMap?: boolean;
  /** 目标版本 */
  target?: string;
  /** 模块格式 */
  module?: string;
  /** 自定义选项 */
  [key: string]: any;
}

/**
 * 编译器工厂 - React 适配版本
 * 管理各种语言的编译器，支持按需加载和缓存
 */
export class CompilerFactory {
  private readonly compilers = new Map<Language, ICompiler>();
  private readonly compilerClasses = new Map<Language, () => ICompiler>();
  private readonly cache = new Map<string, CompileResult>();
  private readonly vendorService: any;
  private initialized = false;

  constructor(vendorService?: any) {
    this.vendorService = vendorService;
    console.info('[CompilerFactory] 编译器工厂初始化完成');
  }

  /** 初始化所有编译器 */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // 注册直通编译器（原生支持的语言）
      this.registerPassthroughCompilers();

      // 注册需要编译的语言
      this.registerTranspileCompilers();

      this.initialized = true;
      console.info('[CompilerFactory] 编译器工厂初始化完成');
    } catch (error) {
      console.error('[CompilerFactory] 初始化失败:', error);
      throw error;
    }
  }

  /** 注册编译器类 */
  registerCompiler(language: Language, compilerClass: () => ICompiler): void {
    this.compilerClasses.set(language, compilerClass as any);
    // 清除缓存的实例，强制重新创建
    this.compilers.delete(language);
    console.info(`[CompilerFactory] 注册编译器: ${language}`);
  }

  /** 获取编译器实例 */
  async getCompiler(language: Language): Promise<ICompiler> {
    // 先尝试从缓存获取
    let compiler = this.compilers.get(language);

    if (!compiler) {
      // 创建新的编译器实例
      compiler = await this.createCompiler(language);
      if (compiler) {
        this.compilers.set(language, compiler);
      }
    }

    if (!compiler) {
      throw new Error(`不支持的语言: ${language}`);
    }

    return compiler;
  }

  /** 创建编译器实例 */
  private async createCompiler(language: Language): Promise<ICompiler | undefined> {
    const compilerFactory = this.compilerClasses.get(language);

    if (!compilerFactory) {
      console.warn(`[CompilerFactory] 未找到编译器类: ${language}`);
      return undefined;
    }

    try {
      const compiler = compilerFactory();

      // 如果编译器需要外部依赖，先加载
      if (compiler.needsVendor() && this.vendorService) {
        const vendorKey = compiler.getVendorKey();
        if (vendorKey) {
          await this.vendorService.loadVendor(vendorKey);
        }
      }

      return compiler;
    } catch (error) {
      console.error(`[CompilerFactory] 创建编译器失败 ${language}:`, error);
      return undefined;
    }
  }

  /** 编译代码 */
  async compile(code: string, language: Language, options: CompileOptions = {}): Promise<CompileResult> {
    try {
      const compiler = await this.getCompiler(language);
      const result = await compiler.compile(code, options);

      console.debug(`[CompilerFactory] 编译完成: ${language}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '编译失败';
      console.error(`[CompilerFactory] 编译失败 ${language}:`, error);

      return {
        code: '',
        error: errorMessage
      };
    }
  }

  /** 带缓存的编译 */
  async compileWithCache(code: string, language: Language, options: CompileOptions = {}): Promise<CompileResult> {
    const cacheKey = this.getCacheKey(code, language, options);

    // 检查缓存
    if (this.cache.has(cacheKey)) {
      console.debug(`[CompilerFactory] 缓存命中: ${language}`);
      return this.cache.get(cacheKey)!;
    }

    // 编译代码
    const result = await this.compile(code, language, options);

    // 缓存结果（只缓存成功的结果）
    if (!result.error) {
      this.cache.set(cacheKey, result);
      console.debug(`[CompilerFactory] 缓存结果: ${language}`);
    }

    return result;
  }

  /** 生成缓存键 */
  private getCacheKey(code: string, language: Language, options: CompileOptions): string {
    const optionsStr = JSON.stringify(options);
    return `${language}:${this.hashCode(code + optionsStr)}`;
  }

  /** 简单的哈希函数 */
  private hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash.toString();
  }

  /** 检查是否支持某种语言 */
  supports(language: Language): boolean {
    return this.compilerClasses.has(language);
  }

  /** 获取所有支持的语言 */
  getSupportedLanguages(): Language[] {
    return Array.from(this.compilerClasses.keys());
  }

  /** 清除编译结果缓存 */
  clearCache(): void {
    this.cache.clear();
    console.info('[CompilerFactory] 编译缓存已清除');
  }

  /** 清除编译器实例缓存 */
  clearCompilerInstances(): void {
    this.compilers.clear();
    console.info('[CompilerFactory] 编译器实例缓存已清除');
  }

  /** 获取统计信息 */
  getStats() {
    return {
      registeredCompilers: this.compilerClasses.size,
      loadedCompilers: this.compilers.size,
      cacheSize: this.cache.size,
      supportedLanguages: this.getSupportedLanguages()
    };
  }

  /** 注册直通编译器 */
  private registerPassthroughCompilers(): void {
    // 动态导入编译器类
    const {
      HtmlCompiler,
      CssCompiler,
      JavaScriptCompiler,
      JsonCompiler,
      XmlCompiler,
      YamlCompiler
    } = require('./compilers/passthrough-compiler');

    // 注册具体的编译器类
    this.registerCompiler('html', () => new HtmlCompiler());
    this.registerCompiler('css', () => new CssCompiler());
    this.registerCompiler('javascript', () => new JavaScriptCompiler());
    this.registerCompiler('json', () => new JsonCompiler());
    this.registerCompiler('xml', () => new XmlCompiler());
    this.registerCompiler('yaml', () => new YamlCompiler());

    console.info('[CompilerFactory] 注册了 6 个直通编译器');
  }

  /** 注册转译编译器 */
  private registerTranspileCompilers(): void {
    // 动态导入编译器类
    const { TypeScriptCompiler } = require('./compilers/typescript-compiler');
    const { MarkdownCompiler } = require('./compilers/markdown-compiler');
    const { ScssCompiler } = require('./compilers/scss-compiler');
    const { LessCompiler } = require('./compilers/less-compiler');

    // TypeScript 编译器
    this.registerCompiler('typescript', () => new TypeScriptCompiler());

    // Markdown 编译器
    this.registerCompiler('markdown', () => new MarkdownCompiler());

    // SCSS 编译器
    this.registerCompiler('scss', () => new ScssCompiler());

    // Less 编译器
    this.registerCompiler('less', () => new LessCompiler());

    console.info('[CompilerFactory] 注册了转译编译器');
  }

  /** 获取需要编译的语言 */
  getTranspileLanguages(): Language[] {
    return ['typescript', 'markdown', 'scss', 'less'];
  }

  /** 获取直通语言 */
  getPassthroughLanguages(): Language[] {
    return ['html', 'css', 'javascript', 'json', 'xml', 'yaml'];
  }

  /** 检查语言是否需要编译 */
  needsCompilation(language: Language): boolean {
    return this.getTranspileLanguages().includes(language);
  }

  /** 获取统计信息 */
  getStats() {
    const registeredLanguages = this.getSupportedLanguages();
    const transpileLanguages = this.getTranspileLanguages();
    const passthroughLanguages = this.getPassthroughLanguages();

    return {
      initialized: this.initialized,
      totalLanguages: registeredLanguages.length,
      transpileLanguages: transpileLanguages.length,
      passthroughLanguages: passthroughLanguages.length,
      registeredLanguages,
      transpileLanguages,
      passthroughLanguages
    };
  }

  /** 销毁工厂 */
  destroy(): void {
    this.compilers.clear();
    this.compilerClasses.clear();
    this.cache.clear();
    this.initialized = false;
    console.info('[CompilerFactory] 编译器工厂已销毁');
  }
}

// 全局编译器工厂实例
let globalCompilerFactory: CompilerFactory | undefined = undefined;

/** 获取全局编译器工厂 */
export function getGlobalCompilerFactory(): CompilerFactory {
  if (!globalCompilerFactory) {
    globalCompilerFactory = new CompilerFactory();
  }
  return globalCompilerFactory;
}

/** 销毁全局编译器工厂 */
export function destroyGlobalCompilerFactory(): void {
  if (globalCompilerFactory) {
    globalCompilerFactory.destroy();
    globalCompilerFactory = undefined;
  }
}

/**
 * React Hook: 使用编译器工厂
 */
export function useCompilerFactory(): CompilerFactory {
  const factoryRef = useRef<CompilerFactory | undefined>(undefined);
  const vendorService = useGlobalVendorService();

  if (!factoryRef.current) {
    factoryRef.current = new CompilerFactory(vendorService);
  }

  useEffect(() => {
    return () => {
      if (factoryRef.current) {
        factoryRef.current.destroy();
        factoryRef.current = undefined;
      }
    };
  }, []);

  return factoryRef.current;
}

/**
 * React Hook: 使用全局编译器工厂
 */
export function useGlobalCompilerFactory(): CompilerFactory {
  const vendorService = useGlobalVendorService();

  if (!globalCompilerFactory) {
    globalCompilerFactory = new CompilerFactory(vendorService);
  }

  useEffect(() => {
    // 自动初始化编译器
    globalCompilerFactory?.initialize().catch(error => {
      console.error('[useGlobalCompilerFactory] 初始化失败:', error);
    });
  }, []);

  return globalCompilerFactory;
}

/**
 * React Hook: 编译代码
 */
export function useCompile() {
  const factory = useGlobalCompilerFactory();
  const { setCompileResult, startCompile, finishCompile } = useCompilerStore();

  const compile = async (
    code: string, 
    language: Language, 
    editorType: 'markup' | 'style' | 'script',
    options: CompileOptions = {}
  ): Promise<CompileResult> => {
    startCompile(editorType);
    
    try {
      const result = await factory.compileWithCache(code, language, options);
      setCompileResult(editorType, result);
      finishCompile(editorType, result);
      return result;
    } catch (error) {
      const errorResult: CompileResult = {
        code: '',
        error: error instanceof Error ? error.message : '编译失败'
      };
      setCompileResult(editorType, errorResult);
      finishCompile(editorType, errorResult);
      return errorResult;
    }
  };

  return { compile, factory };
}
