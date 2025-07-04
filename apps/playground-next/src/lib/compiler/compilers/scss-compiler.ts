import type { Language, CompileResult } from '@/types';
import { BaseCompiler } from '../base-compiler';
import {CompileOptions} from "@/lib/compiler/compiler-factory";

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

      const Sass = window.Sass;
      
      return new Promise((resolve) => {
        Sass.compile(code, {
          style: options.minify ? Sass.style.compressed : Sass.style.expanded,
          includePaths: [],
          ...options
        }, (result: any) => {
          if (result.status === 0) {
            resolve(this.createSuccessResult(result.text));
          } else {
            resolve(this.handleCompileError(new Error(result.message || result.formatted)));
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
