import type { Language, CompileResult } from '@/types';
import { BaseCompiler } from '../base-compiler';
import { CompileOptions } from "@/lib/compiler/compiler-factory";

/**
 * PHP 运行时编译器
 * 使用 Uniter 在浏览器中执行 PHP 代码
 */
export class PhpCompiler extends BaseCompiler {
  readonly name = 'PHP Runtime (Uniter)';
  readonly language: Language = 'php';
  readonly targetLanguage: Language = 'php';

  needsVendor(): boolean {
    return true;
  }

  getVendorKey(): string {
    return 'uniter';
  }

  async compile(code: string, options: CompileOptions = {}): Promise<CompileResult> {
    this.validateCode(code);

    try {
      console.log('[PhpCompiler] 开始编译 PHP 代码:', code.substring(0, 100));

      // 确保 Uniter 已加载
      await this.ensureUniterLoaded();

      // 创建执行包装器
      const wrappedCode = this.wrapPhpCode(code);

      console.log('[PhpCompiler] PHP 代码编译成功');

      return this.createSuccessResult(wrappedCode);
    } catch (error) {
      console.error('[PhpCompiler] 编译失败:', error);
      return this.handleCompileError(error);
    }
  }

  /** 包装 PHP 代码以在浏览器中执行 */
  private wrapPhpCode(code: string): string {
    return `
(function() {
  try {
    // 确保 Uniter 已加载
    if (typeof uniter === 'undefined') {
      throw new Error('Uniter PHP 引擎未加载');
    }

    // 创建 PHP 引擎实例
    const phpEngine = uniter.createEngine();
    
    // 重定向 PHP echo/print 输出到控制台
    phpEngine.expose({
      console_log: function(message) {
        console.log(String(message));
      }
    });

    // 创建 PHP 代码
    let phpCode = \`${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
    
    // 如果代码没有开始标签，添加它
    if (!phpCode.trim().startsWith('<?php')) {
      phpCode = '<?php\\n' + phpCode;
    }
    
    // 替换 echo 语句以重定向输出
    phpCode = phpCode.replace(/echo\\s+([^;]+);/g, 'console_log($1);');
    phpCode = phpCode.replace(/print\\s+([^;]+);/g, 'console_log($1);');
    
    console.log('PHP 代码开始执行:');
    
    // 执行 PHP 代码
    phpEngine.execute(phpCode).then(function(result) {
      console.log('PHP 代码执行完成，结果:', result);
    }).catch(function(error) {
      console.error('PHP 执行错误:', error);
    });
    
  } catch (error) {
    console.error('PHP 引擎错误:', error);
    throw error;
  }
})();
`;
  }

  /** 确保 Uniter 已加载 */
  private async ensureUniterLoaded(): Promise<void> {
    // 检查 Uniter 是否已加载
    if (typeof window !== 'undefined' && (window as any).uniter) {
      return;
    }

    console.warn('[PhpCompiler] Uniter 未加载，尝试等待加载...');
    
    // 等待一段时间后重试
    let retries = 30; // 最多等待 3 秒
    while (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (typeof window !== 'undefined' && (window as any).uniter) {
        console.log('[PhpCompiler] Uniter 加载成功');
        return;
      }
      
      retries--;
    }

    throw new Error('Uniter PHP 引擎加载超时，请确保 Uniter 库已正确加载');
  }
}

// 扩展 Window 接口
declare global {
  interface Window {
    uniter: any;
  }
} 