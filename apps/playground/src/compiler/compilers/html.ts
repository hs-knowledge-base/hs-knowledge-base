// HTML 编译器
import { BaseCompiler } from '../base-compiler';
import type { CompilerOptions, CompileResult } from '../../types';

/** HTML 编译器 */
export class HtmlCompiler extends BaseCompiler {
  constructor() {
    super('html');
  }

  async compile(code: string, options: CompilerOptions): Promise<CompileResult> {
    try {
      this.validate(code);

      // HTML 不需要编译，直接返回处理后的代码
      const processedCode = this.preprocess(code);

      return this.createSuccessResult(processedCode);

    } catch (error) {
      return this.handleError(error);
    }
  }
}
