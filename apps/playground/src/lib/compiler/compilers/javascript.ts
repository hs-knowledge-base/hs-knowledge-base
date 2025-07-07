import type { Language, CompileResult } from '@/types';
import { BaseCompiler } from '../base-compiler';
import { CompileOptions, ExecutionResult, ConsoleMessage } from "@/lib/compiler/compiler-factory";

/** JavaScript 编译器 */
export class JavaScriptCompiler extends BaseCompiler {
  readonly name = 'JavaScript Compiler';
  readonly language: Language = 'javascript';
  readonly targetLanguage: Language = 'javascript';

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

  /** 处理 JavaScript 执行结果 */
  processExecutionResult(result: any): ExecutionResult {
    if (result.success) {
      const consoleMessages: ConsoleMessage[] = [];

      // JavaScript 代码直接在浏览器中执行
      // 控制台输出会通过 iframe 的 postMessage 机制传递
      // 这里我们返回原始代码作为预览代码

      return {
        success: true,
        previewCode: result.output || '', // 返回原始的 JavaScript 代码
        consoleMessages,
        duration: result.duration
      };
    } else {
      return {
        success: false,
        previewCode: `// JavaScript 执行失败\nconsole.error('❌ JavaScript 执行失败: ${result.error || '未知错误'}');`,
        consoleMessages: [{
          type: 'error',
          message: result.error || 'JavaScript 执行失败'
        }],
        error: result.error
      };
    }
  }

  /** 预处理 JavaScript 代码 */
  private preprocess(code: string): string {
    // 基本的 JavaScript 预处理
    return code.trim();
  }
}
