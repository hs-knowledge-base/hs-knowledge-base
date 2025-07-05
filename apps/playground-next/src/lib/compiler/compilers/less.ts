import type { Language, CompileResult } from '@/types';
import { BaseCompiler } from '../base-compiler';
import { CompileOptions } from "@/lib/compiler/compiler-factory";

/**
 * Less 编译器
 * 将 Less 代码编译为 CSS
 */
export class LessCompiler extends BaseCompiler {
  readonly name = 'Less Compiler';
  readonly language: Language = 'less';

  needsVendor(): boolean {
    return true;
  }

  getVendorKey(): string {
    return 'less';
  }

  async compile(code: string, options: CompileOptions = {}): Promise<CompileResult> {
    this.validateCode(code);

    try {
      // 检查 Less 是否已加载
      if (typeof window === 'undefined' || !window.less) {
        throw new Error('Less 编译器未加载');
      }

      const less = window.less;
      
      // 编译 Less
      const result = await less.render(code, {
        compress: false,
        ...options
      });
      
      return this.createSuccessResult(result.css);
    } catch (error) {
      return this.handleCompileError(error);
    }
  }
}

// 扩展 Window 接口
declare global {
  interface Window {
    less: any;
  }
}
