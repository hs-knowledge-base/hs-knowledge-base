import type { Language, CompileResult } from '@/types';
import type { ICompiler, CompileOptions } from './compiler-factory';

/**
 * 基础编译器抽象类
 * 提供编译器的通用功能和接口
 */
export abstract class BaseCompiler implements ICompiler {
  /** 编译器名称 */
  abstract readonly name: string;
  
  /** 支持的语言 */
  abstract readonly language: Language;

  /** 编译代码 */
  abstract compile(code: string, options?: CompileOptions): Promise<CompileResult>;

  /** 是否需要外部依赖 */
  needsVendor(): boolean {
    return false;
  }

  /** 获取依赖的 vendor 键名 */
  getVendorKey(): string | null {
    return null;
  }

  /** 验证代码 */
  protected validateCode(code: string): void {
    if (typeof code !== 'string') {
      throw new Error('代码必须是字符串类型');
    }
  }

  /** 处理编译错误 */
  protected handleCompileError(error: any): CompileResult {
    const errorMessage = error instanceof Error ? error.message : '编译失败';
    console.error(`[${this.name}] 编译错误:`, error);
    
    return {
      code: '',
      error: errorMessage
    };
  }

  /** 创建成功的编译结果 */
  protected createSuccessResult(code: string, sourceMap?: string): CompileResult {
    return {
      code,
      sourceMap,
      error: undefined
    };
  }

  /** 获取编译器信息 */
  getInfo() {
    return {
      name: this.name,
      language: this.language,
      needsVendor: this.needsVendor(),
      vendorKey: this.getVendorKey()
    };
  }
}

// 扩展 Window 接口以包含编译器全局变量
declare global {
  interface Window {
    ts: any;
    marked: any;
    Sass: any;
    less: any;
  }
}
