import { BaseCompiler } from '../base-compiler';
import type { CompilerOptions, CompileResult } from '@/types';
import { resourceLoader } from '../../services/resource-loader';

/** TypeScript 编译器 */
export class TypeScriptCompiler extends BaseCompiler {
  private ts: any = null;

  constructor() {
    super('typescript');
  }

  async compile(code: string, options: CompilerOptions): Promise<CompileResult> {
    try {
      this.validate(code);

      // 确保 TypeScript 已加载
      await this.ensureTypeScriptLoaded();

      if (!this.ts || typeof this.ts.transpile !== 'function') {
        throw new Error('TypeScript 编译器未正确加载');
      }

      const processedCode = this.preprocess(code);

      // 使用 TypeScript 编译器
      const result = this.ts.transpile(processedCode, this.getCompilerOptions());

      return this.createSuccessResult(result);

    } catch (error) {
      return this.handleError(error);
    }
  }

  /** 确保 TypeScript 已加载 */
  private async ensureTypeScriptLoaded(): Promise<void> {
    if (this.ts) {
      return;
    }

    try {
      this.logger.info('开始加载 TypeScript 编译器...');

      // 使用统一的资源加载器加载 TypeScript
      await resourceLoader.loadCompiler('typescript');



      // 获取全局 TypeScript 对象
      this.ts = (window as any).ts;

      if (!this.ts || typeof this.ts.transpile !== 'function') {
        throw new Error('TypeScript 编译器对象无效或缺少 transpile 方法');
      }

      this.logger.info('TypeScript 编译器加载成功');
    } catch (error) {
      this.logger.error('TypeScript 编译器加载失败', error);
      throw new Error(`TypeScript 编译器加载失败: ${error.message}`);
    }
  }

  /** 获取 TypeScript 编译选项 */
  private getCompilerOptions(): any {
    return {
      target: this.ts.ScriptTarget.ES2020,
      module: this.ts.ModuleKind.ESNext,
      moduleResolution: this.ts.ModuleResolutionKind.Bundler,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      strict: false,
      skipLibCheck: true,
      jsx: this.ts.JsxEmit.React,
      isolatedModules: true,
    };
  }
}
