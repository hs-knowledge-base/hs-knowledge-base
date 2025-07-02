import { BaseCompiler } from '../base-compiler';
import type { CompilerOptions, CompileResult } from '@/types';

/** CSS 编译器 */
export class CssCompiler extends BaseCompiler {
  constructor() {
    super('css');
  }

  async compile(code: string, options: CompilerOptions): Promise<CompileResult> {
    try {
      this.validate(code);

      // CSS 不需要编译，直接返回处理后的代码
      const processedCode = this.preprocess(code);

      return this.createSuccessResult(processedCode);

    } catch (error) {
      return this.handleError(error);
    }
  }
}
