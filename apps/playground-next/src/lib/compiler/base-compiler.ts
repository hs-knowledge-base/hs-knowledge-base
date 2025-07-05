import type { Language, CompileResult } from '@/types';
import type { ICompiler, CompileOptions, ExecutionResult, ConsoleMessage } from './compiler-factory';

/**
 * 基础编译器抽象类
 * 提供编译器的通用功能和接口
 */
export abstract class BaseCompiler implements ICompiler {
  /** 编译器名称 */
  abstract readonly name: string;
  
  /** 支持的语言 */
  abstract readonly language: Language;

  /** 编译目标语言 */
  abstract readonly targetLanguage: Language;

  /** 编译代码 */
  abstract compile(code: string, options?: CompileOptions): Promise<CompileResult>;

  /** 是否需要外部依赖 */
  needsVendor(): boolean {
    return false;
  }

  /** 获取依赖的 vendor 键名 */
  getVendorKey(): string | null {
    return null;
  }

  /** 验证代码 */
  protected validateCode(code: string): void {
    if (typeof code !== 'string') {
      throw new Error('代码必须是字符串类型');
    }
  }

  /** 处理编译错误 */
  protected handleCompileError(error: any): CompileResult {
    const errorMessage = error instanceof Error ? error.message : '编译失败';
    console.error(`[${this.name}] 编译错误:`, error);
    
    return {
      code: '',
      error: errorMessage
    };
  }

  /** 创建成功的编译结果 */
  protected createSuccessResult(code: string, sourceMap?: string): CompileResult {
    return {
      code,
      sourceMap,
      error: undefined
    };
  }

  /** 处理执行结果 */
  processExecutionResult(result: any): ExecutionResult {
    // 默认实现：简单地处理运行时结果
    if (result.success) {
      const consoleMessages: ConsoleMessage[] = [];
      
      // 如果有输出，将其作为控制台消息
      if (result.output && result.output.trim()) {
        const outputLines = result.output.split('\n').filter((line: string) => line.trim());
        outputLines.forEach((line: string) => {
          consoleMessages.push({
            type: 'log',
            message: line
          });
        });
      }

      return {
        success: true,
        previewCode: this.getPreviewCode(result),
        consoleMessages,
        duration: result.duration
      };
    } else {
      return {
        success: false,
        previewCode: this.getErrorPreviewCode(result.error),
        consoleMessages: [{
          type: 'error',
          message: result.error || '执行失败'
        }],
        error: result.error
      };
    }
  }

  /** 获取预览代码（子类可以重写） */
  protected getPreviewCode(result: any): string {
    // 默认实现：对于脚本语言，返回原始代码或编译后的代码
    if (['javascript', 'typescript'].includes(this.language)) {
      return result.output || '';
    }
    
    // 对于其他语言，返回提示信息
    return `// ${this.language} 代码已执行\nconsole.log('✅ ${this.language} 代码执行完成');`;
  }

  /** 获取错误时的预览代码 */
  protected getErrorPreviewCode(error?: string): string {
    return `// ${this.language} 代码执行失败\nconsole.error('❌ ${this.language} 执行失败: ${error || '未知错误'}');`;
  }

  /** 获取编译器信息 */
  getInfo() {
    return {
      name: this.name,
      language: this.language,
      needsVendor: this.needsVendor(),
      vendorKey: this.getVendorKey()
    };
  }
}

// 扩展 Window 接口以包含编译器全局变量
declare global {
  interface Window {
    ts: any;
    marked: any;
    Sass: any;
    less: any;
    brython: any;
    __BRYTHON__: any;
    Go: any;
    uniter: any;
    Doppio: any;
  }
}
