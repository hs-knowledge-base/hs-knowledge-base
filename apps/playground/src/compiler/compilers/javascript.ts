import { BaseCompiler } from '../base-compiler';
import type { CompilerOptions, CompileResult } from '@/types';

/** JavaScript 编译器 */
export class JavaScriptCompiler extends BaseCompiler {
  constructor() {
    super('javascript');
  }

  async compile(code: string, options: CompilerOptions): Promise<CompileResult> {
    try {
      this.validate(code);

      // JavaScript 不需要编译，直接返回处理后的代码
      const processedCode = this.preprocess(code);

      return this.createSuccessResult(processedCode);

    } catch (error) {
      return this.handleError(error);
    }
  }
}
