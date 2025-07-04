import type { Language, CompileResult } from '@/types';
import { BaseCompiler } from '../base-compiler';
import {CompileOptions} from "@/lib/compiler/compiler-factory";

/**
 * TypeScript 编译器
 * 将 TypeScript 代码编译为 JavaScript
 */
export class TypeScriptCompiler extends BaseCompiler {
  readonly name = 'TypeScript Compiler';
  readonly language: Language = 'typescript';

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

      // 检查 TypeScript 是否已加载
      if (typeof window === 'undefined' || !window.ts) {
        console.error('[TypeScriptCompiler] TypeScript 编译器未加载');
        throw new Error('TypeScript 编译器未加载');
      }

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
}

// 扩展 Window 接口
declare global {
  interface Window {
    ts: any;
  }
}
