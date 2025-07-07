import type { Language, CompileResult } from '@/types';
import { BaseCompiler } from '../base-compiler';
import { CompileOptions } from "@/lib/compiler/compiler-factory";

/** CSS 编译器 */
export class CssCompiler extends BaseCompiler {
  readonly name = 'CSS Compiler';
  readonly language: Language = 'css';
  readonly targetLanguage: Language = 'css';

  constructor() {
    super();
  }

  async compile(code: string, options: CompileOptions = {}): Promise<CompileResult> {
    this.validateCode(code);
    
    try {
      // CSS 不需要编译，直接返回处理后的代码
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

  /** 预处理 CSS 代码 */
  private preprocess(code: string): string {
    // 基本的 CSS 预处理
    return code.trim();
  }
}
