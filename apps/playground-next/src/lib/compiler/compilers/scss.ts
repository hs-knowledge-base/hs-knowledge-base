import type { Language, CompileResult } from '@/types';
import { BaseCompiler, type CompileOptions } from '../base-compiler';

/**
 * SCSS 编译器
 * 将 SCSS 代码编译为 CSS
 */
export class ScssCompiler extends BaseCompiler {
  readonly name = 'SCSS Compiler';
  readonly language: Language = 'scss';

  needsVendor(): boolean {
    return true;
  }

  getVendorKey(): string {
    return 'sass';
  }

  async compile(code: string, options: CompileOptions = {}): Promise<CompileResult> {
    this.validateCode(code);

    try {
      // 检查 Sass 是否已加载
      if (typeof window === 'undefined' || !window.Sass) {
        throw new Error('Sass 编译器未加载');
      }

      const sass = window.Sass;
      
      // 编译 SCSS
      return new Promise((resolve) => {
        sass.compile(code, {
          style: sass.style.expanded,
          ...options
        }, (result: any) => {
          if (result.status === 0) {
            resolve(this.createSuccessResult(result.text));
          } else {
            resolve(this.createErrorResult(result.formatted || result.message || 'SCSS 编译失败'));
          }
        });
      });
    } catch (error) {
      return this.handleCompileError(error);
    }
  }
}

// 扩展 Window 接口
declare global {
  interface Window {
    Sass: any;
  }
}
