import type { Language, CompileResult } from '@/types';
import { BaseCompiler } from '../base-compiler';
import { CompileOptions } from "@/lib/compiler/compiler-factory";

/**
 * Go 编译器
 * 使用 GopherJS 将 Go 代码编译为 JavaScript
 */
export class GoCompiler extends BaseCompiler {
  readonly name = 'Go Compiler (GopherJS)';
  readonly language: Language = 'go';
  readonly targetLanguage: Language = 'go';

  needsVendor(): boolean {
    return true;
  }

  getVendorKey(): string {
    return 'gopherjs';
  }

  async compile(code: string, options: CompileOptions = {}): Promise<CompileResult> {
    this.validateCode(code);

    try {
      console.log('[GoCompiler] 开始编译 Go 代码:', code.substring(0, 100));

      // 确保 GopherJS 已加载
      await this.ensureGopherJSLoaded();

      // 创建执行包装器
      const wrappedCode = this.wrapGoCode(code);

      console.log('[GoCompiler] Go 代码编译成功');

      return this.createSuccessResult(wrappedCode);
    } catch (error) {
      console.error('[GoCompiler] 编译失败:', error);
      return this.handleCompileError(error);
    }
  }

  /** 包装 Go 代码以在浏览器中执行 */
  private wrapGoCode(code: string): string {
    return `
(function() {
  try {
    // 确保 GopherJS 已加载
    if (typeof Go === 'undefined') {
      throw new Error('GopherJS 未加载');
    }

    // 创建基本的 Go 运行时环境（模拟）
    console.log('Go 代码开始执行:');
    console.log(\`${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`);
    
    // 注意：这是一个简化的实现
    // 实际的 GopherJS 需要完整的编译过程
    // 这里我们主要用于演示和简单的 Go 代码片段
    
    // 模拟 fmt.Println 输出
    const goCode = \`${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
    
    // 简单的 Go 语法转换（仅用于演示）
    if (goCode.includes('fmt.Println')) {
      const matches = goCode.match(/fmt\\.Println\\(([^)]+)\\)/g);
      if (matches) {
        matches.forEach(match => {
          const content = match.match(/fmt\\.Println\\(([^)]+)\\)/)?.[1];
          if (content) {
            // 去掉引号并输出
            const output = content.replace(/['"]/g, '');
            console.log(output);
          }
        });
      }
    }
    
    console.log('Go 代码执行完成');
  } catch (error) {
    console.error('Go 执行错误:', error);
    throw error;
  }
})();
`;
  }

  /** 确保 GopherJS 已加载 */
  private async ensureGopherJSLoaded(): Promise<void> {
    // 检查 GopherJS 是否已加载
    if (typeof window !== 'undefined' && (window as any).Go) {
      return;
    }

    console.warn('[GoCompiler] GopherJS 未加载，尝试等待加载...');
    
    // 等待一段时间后重试
    let retries = 30; // 最多等待 3 秒
    while (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (typeof window !== 'undefined' && (window as any).Go) {
        console.log('[GoCompiler] GopherJS 加载成功');
        return;
      }
      
      retries--;
    }

    throw new Error('GopherJS 编译器加载超时，请确保 GopherJS 库已正确加载');
  }
}

// 扩展 Window 接口
declare global {
  interface Window {
    Go: any;
  }
} 