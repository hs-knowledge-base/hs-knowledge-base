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

  constructor(vendorService?: any) {
    this.vendorService = vendorService;
    console.info('[CompilerFactory] 编译器工厂初始化完成');
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
  private async createCompiler(language: Language): Promise<ICompiler | null> {
    const compilerFactory = this.compilerClasses.get(language);

    if (!compilerFactory) {
      console.warn(`[CompilerFactory] 未找到编译器类: ${language}`);
      return null;
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
      return null;
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

  /** 销毁工厂 */
  destroy(): void {
    this.compilers.clear();
    this.compilerClasses.clear();
    this.cache.clear();
    console.info('[CompilerFactory] 编译器工厂已销毁');
  }
}

// 全局编译器工厂实例
let globalCompilerFactory: CompilerFactory | null = null;

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
    globalCompilerFactory = null;
  }
}

/**
 * React Hook: 使用编译器工厂
 */
export function useCompilerFactory(): CompilerFactory {
  const factoryRef = useRef<CompilerFactory | null>(null);
  const vendorService = useGlobalVendorService();

  if (!factoryRef.current) {
    factoryRef.current = new CompilerFactory(vendorService);
  }

  useEffect(() => {
    return () => {
      if (factoryRef.current) {
        factoryRef.current.destroy();
        factoryRef.current = null;
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
