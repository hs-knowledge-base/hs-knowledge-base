import type { Language, CompileResult } from '@/types';
import { BaseCompiler } from '../base-compiler';
import { CompileOptions, ExecutionResult, ConsoleMessage } from "@/lib/compiler/compiler-factory";

/**
 * Python 运行时编译器
 * 使用 Brython 在浏览器中执行 Python 代码
 */
export class PythonCompiler extends BaseCompiler {
  readonly name = 'Python Runtime';
  readonly language: Language = 'python';
  readonly targetLanguage: Language = 'python';

  needsVendor(): boolean {
    return true;
  }

  getVendorKey(): string {
    return 'brython';
  }

  /** 获取所需的 vendor 键名列表 */
  getVendorKeys(): string[] {
    return ['brython', 'brythonStdlib'];
  }

  async compile(code: string, options: CompileOptions = {}): Promise<CompileResult> {
    this.validateCode(code);

    try {
      console.log('[PythonCompiler] 开始编译 Python 代码:', code.substring(0, 100));

      // 确保 Brython 已加载
      await this.ensureBrythonLoaded();

      // 创建执行包装器
      const wrappedCode = this.wrapPythonCode(code);

      console.log('[PythonCompiler] Python 代码编译成功');

      return this.createSuccessResult(wrappedCode);
    } catch (error) {
      console.error('[PythonCompiler] 编译失败:', error);
      return this.handleCompileError(error);
    }
  }

  /** 包装 Python 代码以在浏览器中执行 */
  private wrapPythonCode(code: string): string {
    return `
(function() {
  try {
    // 确保 Brython 已加载
    if (typeof brython === 'undefined' || typeof __BRYTHON__ === 'undefined') {
      throw new Error('Brython 运行时未完全加载');
    }

    // 初始化 Brython（如果还未初始化）
    if (!__BRYTHON__.initialized) {
      brython({
        debug: 1,
        indexedDB: false,
        pythonpath: []
      });
      __BRYTHON__.initialized = true;
      console.log('Brython 初始化完成');
    }

    // 创建 Python 代码
    const pythonCode = \`${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
    
    // 重定向 print 输出到控制台
    if (__BRYTHON__.builtins && __BRYTHON__.builtins.print) {
      const originalPrint = __BRYTHON__.builtins.print;
      __BRYTHON__.builtins.print = function(...args) {
        const line = args.map(arg => String(arg)).join(' ');
        console.log(line);
        return __BRYTHON__.builtins.None;
      };
    }

    // 确保模块路径存在
    if (!__BRYTHON__.$py_module_path) {
      __BRYTHON__.$py_module_path = {};
    }
    __BRYTHON__.$py_module_path['__main__'] = __BRYTHON__.brython_path || '';
    
    // 使用 __BRYTHON__.py2js 编译和执行 Python 代码
    if (typeof __BRYTHON__.py2js === 'function') {
      const result = __BRYTHON__.py2js(pythonCode, '__main__', '__main__');
      eval(result.to_js());
    } else {
      throw new Error('Brython py2js 方法不可用');
    }
    
    console.log('🐍 Python 代码执行完成');
  } catch (error) {
    console.error('🐍 Python 执行错误:', error);
    throw error;
  }
})();
`;
  }

  /** 确保 Brython 已加载 */
  private async ensureBrythonLoaded(): Promise<void> {
    // 检查 Brython 核心和标准库是否都已加载
    if (typeof window !== 'undefined' && 
        (window as any).brython && 
        (window as any).__BRYTHON__) {
      console.log('[PythonCompiler] Brython 运行时已就绪');
      return;
    }

    console.warn('[PythonCompiler] Brython 运行时未完全加载，尝试等待...');
    
    // 等待一段时间后重试
    let retries = 50; // 最多等待 5 秒
    while (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (typeof window !== 'undefined' && 
          (window as any).brython && 
          (window as any).__BRYTHON__) {
        console.log('[PythonCompiler] Brython 运行时加载成功');
        
        // 额外等待一点时间确保所有模块都已就绪
        await new Promise(resolve => setTimeout(resolve, 200));
        return;
      }
      
      retries--;
    }

    throw new Error('Brython 运行时加载超时。请确保 brython.min.js 和 brython_stdlib.js 都已正确加载');
  }

  /** 处理Python特有的执行结果 */
  processExecutionResult(result: any): ExecutionResult {
    if (result.success) {
      const consoleMessages: ConsoleMessage[] = [];
      
      // 处理Python的输出
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
        previewCode: `// Python 代码已执行，输出显示在控制台中\nconsole.log('✅ Python 代码执行完成');`,
        consoleMessages,
        duration: result.duration
      };
    } else {
      return {
        success: false,
        previewCode: `// Python 代码执行失败\nconsole.error('❌ Python 代码执行失败: ${result.error || '未知错误'}');`,
        consoleMessages: [{
          type: 'error',
          message: result.error || 'Python 执行失败'
        }],
        error: result.error
      };
    }
  }

  /** 重写getPreviewCode方法 */
  protected getPreviewCode(result: any): string {
    return `// Python 代码已执行，输出显示在控制台中\nconsole.log('✅ Python 代码执行完成');`;
  }
}

// 扩展 Window 接口
declare global {
  interface Window {
    brython: any;
    __BRYTHON__: any;
  }
} 