import { BaseCompiler } from '../base-compiler';
import type { CompilerOptions, CompileResult } from '@/types';

/** Python 编译器 */
export class PythonCompiler extends BaseCompiler {
  constructor() {
    super('python');
  }

  async compile(code: string, options: CompilerOptions): Promise<CompileResult> {
    try {
      this.validate(code);

      // Python 不需要编译，直接返回处理后的代码
      // 运行时环境由语言加载器通过 CDN 管理
      const processedCode = this.preprocess(code);

      return this.createSuccessResult(processedCode);

    } catch (error) {
      return this.handleError(error);
    }
  }
}
