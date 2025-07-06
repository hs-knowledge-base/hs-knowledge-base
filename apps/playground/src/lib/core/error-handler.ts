import { Logger } from './logger';

/**
 * 统一错误处理工具
 */
export class ErrorHandler {
  private readonly logger: Logger;

  constructor(context: string) {
    this.logger = new Logger(context);
  }

  /**
   * 安全执行函数，捕获并记录错误
   */
  async safeExecute<T>(
    operation: () => T | Promise<T>,
    errorMessage: string,
    fallback?: T
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      this.logger.error(errorMessage, error);
      return fallback;
    }
  }

  /**
   * 安全执行同步函数
   */
  safeExecuteSync<T>(
    operation: () => T,
    errorMessage: string,
    fallback?: T
  ): T | undefined {
    try {
      return operation();
    } catch (error) {
      this.logger.error(errorMessage, error);
      return fallback;
    }
  }

  /**
   * 批量安全执行
   */
  async safeBatchExecute<T>(
    operations: Array<() => T | Promise<T>>,
    errorMessage: string
  ): Promise<Array<T | undefined>> {
    return Promise.all(
      operations.map(op => this.safeExecute(op, errorMessage))
    );
  }

  /**
   * 重试执行
   */
  async retryExecute<T>(
    operation: () => T | Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    errorMessage: string = '操作失败'
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        this.logger.warn(`${errorMessage} (尝试 ${attempt}/${maxRetries})`, error);
        
        if (attempt < maxRetries) {
          await this.sleep(delay);
        }
      }
    }
    
    this.logger.error(`${errorMessage} - 所有重试都失败了`, lastError);
    throw lastError;
  }

  /**
   * 创建错误包装器
   */
  createErrorWrapper<T extends any[], R>(
    fn: (...args: T) => R,
    errorMessage: string
  ): (...args: T) => R | undefined {
    return (...args: T) => {
      return this.safeExecuteSync(() => fn(...args), errorMessage);
    };
  }

  /**
   * 验证并抛出错误
   */
  validateAndThrow(condition: boolean, message: string): void {
    if (!condition) {
      this.logger.error(`验证失败: ${message}`);
      throw new Error(message);
    }
  }

  /**
   * 睡眠函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 全局错误处理器实例
 */
export const globalErrorHandler = new ErrorHandler('Global');

/**
 * 创建特定上下文的错误处理器
 */
export function createErrorHandler(context: string): ErrorHandler {
  return new ErrorHandler(context);
}
