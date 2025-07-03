import type { Language, CompilerOptions, CompileResult } from '@/types';

/**
 * 编译器接口
 */
export interface ICompiler {
  /** 获取支持的语言 */
  getLanguage(): Language;
  
  /** 检查是否支持该语言 */
  supports(language: Language): boolean;
  
  /** 编译代码 */
  compile(code: string, options: CompilerOptions): Promise<CompileResult>;
  
  /** 初始化编译器（可选） */
  initialize?(): Promise<void>;
  
  /** 销毁编译器（可选） */
  destroy?(): Promise<void>;
}

/**
 * 编译器工厂接口
 */
export interface ICompilerFactory {
  /** 获取编译器实例 */
  getCompiler(language: Language): ICompiler;
  
  /** 检查是否支持该语言 */
  supports(language: Language): boolean;
  
  /** 获取所有支持的语言 */
  getSupportedLanguages(): Language[];
  
  /** 注册编译器 */
  registerCompiler(language: Language, compilerClass: new () => ICompiler): void;
  
  /** 注销编译器 */
  unregisterCompiler(language: Language): void;
  
  /** 编译代码（带缓存） */
  compileWithCache(code: string, language: Language, options: CompilerOptions): Promise<CompileResult>;
  
  /** 清除缓存 */
  clearCache(): void;
}

/**
 * 编译器插件接口
 */
export interface ICompilerPlugin {
  /** 插件名称 */
  readonly name: string;
  
  /** 支持的语言 */
  readonly supportedLanguages: Language[];
  
  /** 初始化插件 */
  initialize(): Promise<void>;
  
  /** 创建编译器实例 */
  createCompiler(language: Language): ICompiler;
  
  /** 销毁插件 */
  destroy(): Promise<void>;
}
