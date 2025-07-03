import { BaseCompiler } from '../base-compiler';
import type { CompilerOptions, CompileResult } from '@/types';
import {getCompilerUrls} from '../../services/vendors';

/** TypeScript 编译器 */
export class TypeScriptCompiler extends BaseCompiler {
  private ts: any = null;

  constructor() {
    super('typescript');
  }

  async compile(code: string, options: CompilerOptions): Promise<CompileResult> {
    try {
      this.validate(code);

      // 动态导入 TypeScript（只加载一次）
      if (!this.ts) {
        this.logger.info('开始加载 TypeScript 库');

        try {
          // 首先尝试从本地 node_modules 加载
          const tsModule = await import('typescript');
          this.ts = tsModule;
          this.logger.info('TypeScript 从本地加载成功');
        } catch (localError) {
          this.logger.warn('本地 TypeScript 加载失败，尝试 CDN 版本:', localError);

          // 回退到 CDN 脚本加载
          try {
            await this.loadTypeScriptFromCDN();
            this.ts = (window as any).ts;
            this.logger.info('TypeScript 从 CDN 加载成功');
          } catch (cdnError) {
            this.logger.error('CDN TypeScript 加载也失败:', cdnError);
            throw new Error('无法加载 TypeScript 编译器');
          }
        }

        if (!this.ts || typeof this.ts.transpile !== 'function') {
          throw new Error('TypeScript 模块无效：缺少 transpile 方法');
        }
      }

      const processedCode = this.preprocess(code);

      // 使用 TypeScript 编译器
      const result = this.ts.transpile(processedCode, this.getCompilerOptions(this.ts));

      return this.createSuccessResult(result);

    } catch (error) {
      return this.handleError(error);
    }
  }

  /** 从 CDN 加载 TypeScript */
  private async loadTypeScriptFromCDN(): Promise<void> {
    // 如果已经加载过，直接返回
    if ((window as any).ts) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = getCompilerUrls().typescriptUrl;
      script.async = true;

      script.onload = () => {
        if ((window as any).ts) {
          resolve();
        } else {
          reject(new Error('TypeScript 全局变量未找到'));
        }
      };

      script.onerror = () => reject(new Error(`Failed to load script: ${getCompilerUrls().typescriptUrl}`));

      document.head.appendChild(script);
    });
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
