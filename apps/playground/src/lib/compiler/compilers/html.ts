import type { Language, CompileResult } from '@/types';
import { BaseCompiler } from '../base-compiler';
import { CompileOptions } from "@/lib/compiler/compiler-factory";

/** HTML 编译器 */
export class HtmlCompiler extends BaseCompiler {
  readonly name = 'HTML Compiler';
  readonly language: Language = 'html';
  readonly targetLanguage: Language = 'html';

  constructor() {
    super();
  }

  async compile(code: string, options: CompileOptions = {}): Promise<CompileResult> {
    this.validateCode(code);
    
    try {
      // HTML 不需要编译，直接返回处理后的代码
      const processedCode = this.preprocess(code);
      
      return this.createSuccessResult(processedCode);
    } catch (error) {
      return this.handleCompileError(error);
    }
  }

  needsVendor(): boolean {
    return false;
  }

  getVendorKey(): string | null {
    return null;
  }

  /** 预处理 HTML 代码 */
  private preprocess(code: string): string {
    // 基本的 HTML 预处理
    return code.trim();
  }
}
