import type { Language, CompileResult } from '@/types';
import { BaseCompiler } from '../base-compiler';
import { CompileOptions } from "@/lib/compiler/compiler-factory";

/** JavaScript 编译器 */
export class JavaScriptCompiler extends BaseCompiler {
  readonly name = 'JavaScript Compiler';
  readonly language: Language = 'javascript';

  constructor() {
    super();
  }

  async compile(code: string, options: CompileOptions = {}): Promise<CompileResult> {
    this.validateCode(code);
    
    try {
      // JavaScript 不需要编译，直接返回处理后的代码
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

  /** 预处理 JavaScript 代码 */
  private preprocess(code: string): string {
    // 基本的 JavaScript 预处理
    return code.trim();
  }
}
