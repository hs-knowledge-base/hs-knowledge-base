import { BaseCompiler } from '../base-compiler';
import type { CompilerOptions, CompileResult } from '../../types';

/** TypeScript 编译器 */
export class TypeScriptCompiler extends BaseCompiler {
  constructor() {
    super('typescript');
  }

  async compile(code: string, options: CompilerOptions): Promise<CompileResult> {
    try {
      this.validate(code);

      // 动态导入 TypeScript
      const ts = await import('typescript');

      const processedCode = this.preprocess(code);

      // 使用 TypeScript 编译器
      const result = ts.transpile(processedCode, this.getCompilerOptions(ts));

      return this.createSuccessResult(result);

    } catch (error) {
      return this.handleError(error);
    }
  }

  /** 获取 TypeScript 编译选项 */
  private getCompilerOptions(ts: any): any {
    return {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      strict: false,
      skipLibCheck: true,
      jsx: ts.JsxEmit.React,
      isolatedModules: true,
    };
  }
}
