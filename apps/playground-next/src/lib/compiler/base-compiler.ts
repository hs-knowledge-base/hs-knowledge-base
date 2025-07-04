import type { Language, CompileResult } from '@/types';
import type { ICompiler, CompileOptions } from './compiler-factory';

/**
 * 基础编译器抽象类
 * 提供编译器的通用功能和接口
 */
export abstract class BaseCompiler implements ICompiler {
  /** 编译器名称 */
  abstract readonly name: string;
  
  /** 支持的语言 */
  abstract readonly language: Language;

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

/**
 * 直通编译器 - 不进行任何转换
 * 用于原生支持的语言（如 HTML、CSS、JavaScript）
 */
export class PassthroughCompiler extends BaseCompiler {
  readonly name: string;
  readonly language: Language;

  constructor(language: Language, name?: string) {
    super();
    this.language = language;
    this.name = name || `${language.toUpperCase()} Passthrough Compiler`;
  }

  async compile(code: string): Promise<CompileResult> {
    this.validateCode(code);
    return this.createSuccessResult(code);
  }
}

/**
 * TypeScript 编译器
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
      // 检查 TypeScript 是否已加载
      if (typeof window === 'undefined' || !window.ts) {
        throw new Error('TypeScript 编译器未加载');
      }

      const ts = window.ts;
      
      // 编译选项
      const compilerOptions = {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ES2020,
        strict: false,
        esModuleInterop: true,
        skipLibCheck: true,
        ...options
      };

      // 编译代码
      const result = ts.transpile(code, compilerOptions);
      
      return this.createSuccessResult(result);
    } catch (error) {
      return this.handleCompileError(error);
    }
  }
}

/**
 * Markdown 编译器
 */
export class MarkdownCompiler extends BaseCompiler {
  readonly name = 'Markdown Compiler';
  readonly language: Language = 'markdown';

  needsVendor(): boolean {
    return true;
  }

  getVendorKey(): string {
    return 'marked';
  }

  async compile(code: string, options: CompileOptions = {}): Promise<CompileResult> {
    this.validateCode(code);

    try {
      // 检查 Marked 是否已加载
      if (typeof window === 'undefined' || !window.marked) {
        throw new Error('Marked 编译器未加载');
      }

      const marked = window.marked;
      
      // 配置 marked
      marked.setOptions({
        highlight: function(code: string, lang: string) {
          // 这里可以集成语法高亮库
          return code;
        },
        breaks: true,
        gfm: true,
        ...options
      });

      // 编译 Markdown
      const html = marked.parse(code);
      
      return this.createSuccessResult(html);
    } catch (error) {
      return this.handleCompileError(error);
    }
  }
}

/**
 * SCSS 编译器
 */
export class ScssCompiler extends BaseCompiler {
  readonly name = 'SCSS Compiler';
  readonly language: Language = 'scss';

  needsVendor(): boolean {
    return true;
  }

  getVendorKey(): string {
    return 'sass';
  }

  async compile(code: string, options: CompileOptions = {}): Promise<CompileResult> {
    this.validateCode(code);

    try {
      // 检查 Sass 是否已加载
      if (typeof window === 'undefined' || !window.Sass) {
        throw new Error('Sass 编译器未加载');
      }

      const Sass = window.Sass;
      
      return new Promise((resolve) => {
        Sass.compile(code, {
          style: options.minify ? Sass.style.compressed : Sass.style.expanded,
          ...options
        }, (result: any) => {
          if (result.status === 0) {
            resolve(this.createSuccessResult(result.text));
          } else {
            resolve(this.handleCompileError(new Error(result.message)));
          }
        });
      });
    } catch (error) {
      return this.handleCompileError(error);
    }
  }
}

/**
 * Less 编译器
 */
export class LessCompiler extends BaseCompiler {
  readonly name = 'Less Compiler';
  readonly language: Language = 'less';

  needsVendor(): boolean {
    return true;
  }

  getVendorKey(): string {
    return 'less';
  }

  async compile(code: string, options: CompileOptions = {}): Promise<CompileResult> {
    this.validateCode(code);

    try {
      // 检查 Less 是否已加载
      if (typeof window === 'undefined' || !window.less) {
        throw new Error('Less 编译器未加载');
      }

      const less = window.less;
      
      const result = await less.render(code, {
        compress: options.minify || false,
        ...options
      });
      
      return this.createSuccessResult(result.css);
    } catch (error) {
      return this.handleCompileError(error);
    }
  }
}

// 扩展 Window 接口以包含编译器全局变量
declare global {
  interface Window {
    ts: any;
    marked: any;
    Sass: any;
    less: any;
  }
}
