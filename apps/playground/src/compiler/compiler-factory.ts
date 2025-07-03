import type { Language } from '@/types';
import { BaseCompiler } from './base-compiler';
import { Logger } from '@/utils/logger';

/** 编译器工厂 */
export class CompilerFactory {
  private readonly logger = new Logger('CompilerFactory');
  private readonly compilers = new Map<Language, BaseCompiler>();
  private readonly compilerClasses = new Map<Language, new () => BaseCompiler>();
  private readonly cache = new Map<string, any>();

  constructor() {
    // 不再自动注册编译器，改为按需注册
  }

  /** 获取编译器实例 */
  getCompiler(language: Language): BaseCompiler {
    // 先尝试从缓存获取
    let compiler = this.compilers.get(language);

    if (!compiler) {
      // 创建新的编译器实例
      compiler = this.createCompiler(language);
      if (compiler) {
        this.compilers.set(language, compiler);
      }
    }

    if (!compiler) {
      throw new Error(`不支持的语言: ${language}`);
    }

    return compiler;
  }

  /** 编译代码（带缓存） */
  async compileWithCache(code: string, language: Language, options: any): Promise<any> {
    const cacheKey = this.getCacheKey(code, language, options);

    // 检查缓存
    if (this.cache.has(cacheKey)) {
      this.logger.debug(`缓存命中: ${language}`);
      return this.cache.get(cacheKey);
    }

    // 编译代码
    const compiler = this.getCompiler(language);
    const result = await compiler.compile(code, options);

    // 缓存结果
    this.cache.set(cacheKey, result);
    this.logger.debug(`缓存结果: ${language}`);

    return result;
  }

  /** 生成缓存键 */
  private getCacheKey(code: string, language: Language, options: any): string {
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

  /** 清除编译结果缓存 */
  clearCache(): void {
    this.cache.clear();
    this.logger.info('编译缓存已清除');
  }

  /** 清除编译器实例缓存 */
  clearCompilerInstances(): void {
    this.compilers.clear();
    this.logger.info('编译器实例缓存已清除');
  }

  /**
   * 注册编译器类
   */
  registerCompiler(language: Language, compilerClass: new () => BaseCompiler): void {
    this.logger.info(`注册编译器: ${language}`);
    this.compilerClasses.set(language, compilerClass);

    // 清除缓存的实例，强制重新创建
    this.compilers.delete(language);
  }

  /**
   * 注销编译器
   */
  unregisterCompiler(language: Language): void {
    this.logger.info(`注销编译器: ${language}`);
    this.compilerClasses.delete(language);
    this.compilers.delete(language);
  }

  /**
   * 检查是否支持某种语言
   */
  supports(language: Language): boolean {
    return this.compilerClasses.has(language);
  }

  /**
   * 获取所有支持的语言
   */
  getSupportedLanguages(): Language[] {
    return Array.from(this.compilerClasses.keys());
  }



  /**
   * 动态加载编译器（用于按需加载）
   * 暂时禁用动态加载，所有编译器都在启动时注册
   */
  async loadCompiler(language: Language): Promise<BaseCompiler> {
    if (this.supports(language)) {
      return this.getCompiler(language);
    }

    // 暂时不支持动态加载，所有编译器都在构造函数中注册
    this.logger.warn(`不支持的语言: ${language}`);
    throw new Error(`无法加载编译器: ${language}`);
  }

  private createCompiler(language: Language): BaseCompiler | null {
    const CompilerClass = this.compilerClasses.get(language);
    
    if (!CompilerClass) {
      this.logger.warn(`未找到编译器类: ${language}`);
      return null;
    }

    try {
      return new CompilerClass();
    } catch (error) {
      this.logger.error(`创建编译器失败 ${language}:`, error);
      return null;
    }
  }

  /**
   * 初始化内置编译器
   * 这个方法需要在应用启动时调用
   */
  async initializeBuiltinCompilers(): Promise<void> {
    // 动态导入编译器类，避免循环依赖
    const { JavaScriptCompiler } = await import('./compilers/javascript');
    const { TypeScriptCompiler } = await import('./compilers/typescript');
    const { HtmlCompiler } = await import('./compilers/html');
    const { CssCompiler } = await import('./compilers/css');
    const { MarkdownCompiler } = await import('./compilers/markdown');

    // 注册内置编译器
    this.registerCompiler('javascript', JavaScriptCompiler);
    this.registerCompiler('typescript', TypeScriptCompiler);
    this.registerCompiler('html', HtmlCompiler);
    this.registerCompiler('css', CssCompiler);
    this.registerCompiler('markdown', MarkdownCompiler);

    this.logger.info(`初始化了 ${this.compilerClasses.size} 个内置编译器`);
  }
}
