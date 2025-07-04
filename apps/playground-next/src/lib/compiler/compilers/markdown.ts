import type { Language, CompileResult } from '@/types';
import { BaseCompiler, type CompileOptions } from '../base-compiler';

/**
 * Markdown 编译器
 * 将 Markdown 代码编译为 HTML
 */
export class MarkdownCompiler extends BaseCompiler {
  readonly name = 'Markdown Compiler';
  readonly language: Language = 'markdown';

  needsVendor(): boolean {
    return true;
  }

  getVendorKey(): string {
    return 'marked';
  }

  async compile(code: string, options: CompileOptions = {}): Promise<CompileResult> {
    this.validateCode(code);

    try {
      // 检查 Marked 是否已加载
      if (typeof window === 'undefined' || !window.marked) {
        throw new Error('Marked 编译器未加载');
      }

      const marked = window.marked;
      
      // 配置 marked
      marked.setOptions({
        highlight: function(code: string, lang: string) {
          // 这里可以集成语法高亮库
          return code;
        },
        breaks: true,
        gfm: true,
        headerIds: false,
        mangle: false,
        ...options
      });

      // 编译 Markdown
      const html = marked.parse(code);
      
      return this.createSuccessResult(html);
    } catch (error) {
      return this.handleCompileError(error);
    }
  }
}

// 扩展 Window 接口
declare global {
  interface Window {
    marked: any;
  }
}
