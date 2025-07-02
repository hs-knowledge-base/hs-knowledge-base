import type { Language, CompilerOptions, CompileResult } from '@/types';
import { Logger } from '../utils/logger';

/** 编译器抽象基类 */
export abstract class BaseCompiler {
  protected readonly logger: Logger;

  constructor(protected language: Language) {
    this.logger = new Logger(`${language}Compiler`);
  }

  /** 编译代码 - 子类必须实现 */
  abstract compile(code: string, options: CompilerOptions): Promise<CompileResult>;

  /** 获取支持的语言 */
  getLanguage(): Language {
    return this.language;
  }

  /** 检查是否支持该语言 */
  supports(language: Language): boolean {
    return this.language === language;
  }

  /** 预处理代码 */
  protected preprocess(code: string): string {
    return code.trim();
  }

  /** 后处理编译结果 */
  protected postprocess(result: string): string {
    return result;
  }

  /** 处理编译错误 */
  protected handleError(error: any): CompileResult {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.logger.error('编译失败:', errorMessage);

    return {
      code: '',
      language: this.language,
      error: errorMessage
    };
  }

  /** 创建成功的编译结果 */
  protected createSuccessResult(code: string): CompileResult {
    return {
      code: this.postprocess(code),
      language: this.language
    };
  }

  /** 验证代码 */
  protected validate(code: string): void {
    if (typeof code !== 'string') {
      throw new Error('代码必须是字符串类型');
    }
  }
}
