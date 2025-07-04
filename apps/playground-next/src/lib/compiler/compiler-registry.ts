import { useEffect } from 'react';
import type { Language } from '@/types';
import { CompilerFactory, getGlobalCompilerFactory } from './compiler-factory';
import {
  HtmlCompiler,
  CssCompiler,
  JavaScriptCompiler,
  JsonCompiler,
  XmlCompiler,
  YamlCompiler
} from './compilers/passthrough-compiler';
import { TypeScriptCompiler } from './compilers/typescript-compiler';
import { MarkdownCompiler } from './compilers/markdown-compiler';
import { ScssCompiler } from './compilers/scss-compiler';
import { LessCompiler } from './compilers/less-compiler';

/**
 * 编译器注册表
 * 管理所有可用的编译器
 */
export class CompilerRegistry {
  private readonly factory: CompilerFactory;
  private initialized = false;

  constructor(factory: CompilerFactory) {
    this.factory = factory;
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
      console.info('[CompilerRegistry] 编译器注册表初始化完成');
    } catch (error) {
      console.error('[CompilerRegistry] 初始化失败:', error);
      throw error;
    }
  }

  /** 注册直通编译器 */
  private registerPassthroughCompilers(): void {
    // 注册具体的编译器类
    this.factory.registerCompiler('html', () => new HtmlCompiler());
    this.factory.registerCompiler('css', () => new CssCompiler());
    this.factory.registerCompiler('javascript', () => new JavaScriptCompiler());
    this.factory.registerCompiler('json', () => new JsonCompiler());
    this.factory.registerCompiler('xml', () => new XmlCompiler());
    this.factory.registerCompiler('yaml', () => new YamlCompiler());

    console.info('[CompilerRegistry] 注册了 6 个直通编译器');
  }

  /** 注册转译编译器 */
  private registerTranspileCompilers(): void {
    // TypeScript 编译器
    this.factory.registerCompiler('typescript', () => new TypeScriptCompiler());

    // Markdown 编译器
    this.factory.registerCompiler('markdown', () => new MarkdownCompiler());

    // SCSS 编译器
    this.factory.registerCompiler('scss', () => new ScssCompiler());

    // Less 编译器
    this.factory.registerCompiler('less', () => new LessCompiler());

    console.info('[CompilerRegistry] 注册了转译编译器');
  }

  /** 检查编译器是否已注册 */
  isRegistered(language: Language): boolean {
    return this.factory.supports(language);
  }

  /** 获取所有已注册的语言 */
  getRegisteredLanguages(): Language[] {
    return this.factory.getSupportedLanguages();
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
    const registeredLanguages = this.getRegisteredLanguages();
    const transpileLanguages = this.getTranspileLanguages();
    const passthroughLanguages = this.getPassthroughLanguages();

    return {
      initialized: this.initialized,
      totalLanguages: registeredLanguages.length,
      transpileLanguages: transpileLanguages.length,
      passthroughLanguages: passthroughLanguages.length,
      registeredLanguages,
    };
  }

  /** 销毁注册表 */
  destroy(): void {
    this.initialized = false;
    console.info('[CompilerRegistry] 编译器注册表已销毁');
  }
}

// 全局编译器注册表实例
let globalCompilerRegistry: CompilerRegistry | null = null;

/** 获取全局编译器注册表 */
export function getGlobalCompilerRegistry(): CompilerRegistry {
  if (!globalCompilerRegistry) {
    const factory = getGlobalCompilerFactory();
    globalCompilerRegistry = new CompilerRegistry(factory);
  }
  return globalCompilerRegistry;
}

/** 销毁全局编译器注册表 */
export function destroyGlobalCompilerRegistry(): void {
  if (globalCompilerRegistry) {
    globalCompilerRegistry.destroy();
    globalCompilerRegistry = null;
  }
}

/**
 * React Hook: 使用编译器注册表
 */
export function useCompilerRegistry(): CompilerRegistry {
  const registry = getGlobalCompilerRegistry();

  useEffect(() => {
    // 自动初始化编译器
    registry.initialize().catch(error => {
      console.error('[useCompilerRegistry] 初始化失败:', error);
    });
  }, [registry]);

  return registry;
}

/**
 * React Hook: 编译器初始化状态
 */
export function useCompilerInitialization() {
  const registry = useCompilerRegistry();
  
  const stats = registry.getStats();
  
  return {
    initialized: stats.initialized,
    totalLanguages: stats.totalLanguages,
    transpileLanguages: stats.transpileLanguages,
    passthroughLanguages: stats.passthroughLanguages,
    registeredLanguages: stats.registeredLanguages,
    needsCompilation: (language: Language) => registry.needsCompilation(language),
    isRegistered: (language: Language) => registry.isRegistered(language)
  };
}

/**
 * 编译器服务提供者
 * 用于在应用启动时初始化编译器系统
 */
export class CompilerServiceProvider {
  private registry: CompilerRegistry;

  constructor() {
    this.registry = getGlobalCompilerRegistry();
  }

  /** 启动编译器服务 */
  async start(): Promise<void> {
    try {
      await this.registry.initialize();
      console.info('[CompilerServiceProvider] 编译器服务启动成功');
    } catch (error) {
      console.error('[CompilerServiceProvider] 编译器服务启动失败:', error);
      throw error;
    }
  }

  /** 停止编译器服务 */
  stop(): void {
    this.registry.destroy();
    destroyGlobalCompilerRegistry();
    console.info('[CompilerServiceProvider] 编译器服务已停止');
  }

  /** 获取服务状态 */
  getStatus() {
    return this.registry.getStats();
  }
}

/**
 * React Hook: 使用编译器服务提供者
 */
export function useCompilerServiceProvider(): CompilerServiceProvider {
  const provider = new CompilerServiceProvider();

  useEffect(() => {
    // 启动编译器服务
    provider.start().catch(error => {
      console.error('[useCompilerServiceProvider] 服务启动失败:', error);
    });

    // 清理函数
    return () => {
      provider.stop();
    };
  }, []);

  return provider;
}
