import type { Language, CompileResult } from '@/types';
import { BaseCompiler } from '../base-compiler';
import {CompileOptions, ExecutionResult, ConsoleMessage} from "@/lib/compiler/compiler-factory";

/**
 * TypeScript 编译器
 * 将 TypeScript 代码编译为 JavaScript
 */
export class TypeScriptCompiler extends BaseCompiler {
  readonly name = 'TypeScript Compiler';
  readonly language: Language = 'typescript';
  readonly targetLanguage: Language = 'javascript';

  needsVendor(): boolean {
    return true;
  }

  getVendorKey(): string {
    return 'typescript';
  }

  async compile(code: string, options: CompileOptions = {}): Promise<CompileResult> {
    this.validateCode(code);

    try {
      console.log('[TypeScriptCompiler] 开始编译 TypeScript 代码:', code.substring(0, 100));

      // 更严格的 TypeScript 检查
      await this.ensureTypeScriptLoaded();

      const ts = window.ts;
      console.log('[TypeScriptCompiler] TypeScript 版本:', ts.version);

      // 编译选项
      const compilerOptions = {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ES2020,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        allowJs: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: false,
        skipLibCheck: true,
        isolatedModules: true,
        noEmit: false,
        ...options
      };

      console.log('[TypeScriptCompiler] 编译选项:', compilerOptions);

      // 编译 TypeScript 代码
      const result = ts.transpile(code, compilerOptions);

      console.log('[TypeScriptCompiler] 编译结果:', result);

      return this.createSuccessResult(result);
    } catch (error) {
      console.error('[TypeScriptCompiler] 编译失败:', error);
      return this.handleCompileError(error);
    }
  }

  /** 确保 TypeScript 已加载 */
  private async ensureTypeScriptLoaded(): Promise<void> {
    // 检查 TypeScript 是否已加载
    if (typeof window !== 'undefined' && window.ts && typeof window.ts.transpile === 'function') {
      return;
    }

    console.warn('[TypeScriptCompiler] TypeScript 编译器未加载，尝试等待加载...');
    
    // 等待一段时间后重试
    let retries = 30; // 最多等待 3 秒
    while (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (typeof window !== 'undefined' && window.ts && typeof window.ts.transpile === 'function') {
        console.log('[TypeScriptCompiler] TypeScript 编译器加载成功');
        return;
      }
      
      retries--;
    }

    throw new Error('TypeScript 编译器加载超时，请确保 TypeScript 库已正确加载');
  }

  /** 处理TypeScript特有的执行结果 */
  processExecutionResult(result: any): ExecutionResult {
    if (result.success) {
      const consoleMessages: ConsoleMessage[] = [];
      
      // 添加编译成功消息
      consoleMessages.push({
        type: 'info',
        message: '✅ TypeScript 编译成功，代码已转换为 JavaScript'
      });
      
      // 处理控制台输出
      if (result.consoleOutput && result.consoleOutput.trim()) {
        const outputLines = result.consoleOutput.split('\n').filter((line: string) => line.trim());
        outputLines.forEach((line: string) => {
          if (line.startsWith('[ERROR]')) {
            consoleMessages.push({
              type: 'error',
              message: line.substring(7).trim()
            });
          } else if (line.startsWith('[WARN]')) {
            consoleMessages.push({
              type: 'warn',
              message: line.substring(6).trim()
            });
          } else if (line.startsWith('[INFO]')) {
            consoleMessages.push({
              type: 'info',
              message: line.substring(6).trim()
            });
          } else {
            consoleMessages.push({
              type: 'log',
              message: line
            });
          }
        });
      }

      return {
        success: true,
        previewCode: result.output || '',
        consoleMessages,
        duration: result.duration
      };
    } else {
      return {
        success: false,
        previewCode: `// TypeScript 编译失败\nconsole.error('❌ TypeScript 编译失败: ${result.error || '未知错误'}');`,
        consoleMessages: [{
          type: 'error',
          message: `TypeScript 编译失败: ${result.error || '未知错误'}`
        }],
        error: result.error
      };
    }
  }

  /** 重写getPreviewCode方法 */
  protected getPreviewCode(result: any): string {
    // TypeScript直接返回编译后的JavaScript
    return result.output || '';
  }
}

// 扩展 Window 接口
declare global {
  interface Window {
    ts: any;
  }
}
