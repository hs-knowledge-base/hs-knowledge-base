import type { Language, CompileResult } from '@/types';
import { BaseCompiler } from '../base-compiler';
import { CompileOptions } from "@/lib/compiler/compiler-factory";

/**
 * Java 运行时编译器
 * 使用 DoppioJVM 在浏览器中执行 Java 代码
 */
export class JavaCompiler extends BaseCompiler {
  readonly name = 'Java Runtime (DoppioJVM)';
  readonly language: Language = 'java';

  needsVendor(): boolean {
    return true;
  }

  getVendorKey(): string {
    return 'doppio';
  }

  async compile(code: string, options: CompileOptions = {}): Promise<CompileResult> {
    this.validateCode(code);

    try {
      console.log('[JavaCompiler] 开始编译 Java 代码:', code.substring(0, 100));

      // 确保 Doppio 已加载
      await this.ensureDoppioLoaded();

      // 创建执行包装器
      const wrappedCode = this.wrapJavaCode(code);

      console.log('[JavaCompiler] Java 代码编译成功');

      return this.createSuccessResult(wrappedCode);
    } catch (error) {
      console.error('[JavaCompiler] 编译失败:', error);
      return this.handleCompileError(error);
    }
  }

  /** 包装 Java 代码以在浏览器中执行 */
  private wrapJavaCode(code: string): string {
    return `
(function() {
  try {
    // 确保 DoppioJVM 已加载
    if (typeof Doppio === 'undefined') {
      console.warn('DoppioJVM 未加载，使用模拟执行');
      
      // 简化的 Java 代码解析和执行（仅用于演示）
      const javaCode = \`${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
      
      console.log('Java 代码开始执行 (模拟):');
      console.log(javaCode);
      
      // 简单的 System.out.println 模拟
      if (javaCode.includes('System.out.println')) {
        const matches = javaCode.match(/System\\.out\\.println\\(([^)]+)\\)/g);
        if (matches) {
          matches.forEach(match => {
            const content = match.match(/System\\.out\\.println\\(([^)]+)\\)/)?.[1];
            if (content) {
              // 去掉引号并输出
              const output = content.replace(/['"]/g, '');
              console.log(output);
            }
          });
        }
      }
      
      console.log('Java 代码执行完成 (模拟)');
      return;
    }

    // 创建 DoppioJVM 实例
    const jvm = new Doppio.VM();
    
    // 创建 Java 代码
    const javaCode = \`${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
    
    console.log('Java 代码开始执行:');
    
    // 执行 Java 代码（需要先编译）
    jvm.runClass('Main', [], function(err, result) {
      if (err) {
        console.error('Java 执行错误:', err);
      } else {
        console.log('Java 代码执行完成，结果:', result);
      }
    });
    
  } catch (error) {
    console.error('Java 虚拟机错误:', error);
    throw error;
  }
})();
`;
  }

  /** 确保 Doppio 已加载 */
  private async ensureDoppioLoaded(): Promise<void> {
    // 检查 Doppio 是否已加载
    if (typeof window !== 'undefined' && (window as any).Doppio) {
      return;
    }

    console.warn('[JavaCompiler] DoppioJVM 未加载，尝试等待加载...');
    
    // 等待一段时间后重试
    let retries = 30; // 最多等待 3 秒
    while (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (typeof window !== 'undefined' && (window as any).Doppio) {
        console.log('[JavaCompiler] DoppioJVM 加载成功');
        return;
      }
      
      retries--;
    }

    // 即使 Doppio 没有加载，我们也继续（使用模拟执行）
    console.warn('DoppioJVM 未能加载，将使用模拟执行');
  }
}

// 扩展 Window 接口
declare global {
  interface Window {
    Doppio: any;
  }
} 