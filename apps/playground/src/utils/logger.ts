/** 日志工具 */
export class Logger {
  constructor(private context: string) {}

  info(message: string, ...args: any[]): void {
    console.log(`[${this.context}] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`[${this.context}] ${message}`, ...args);
  }

  error(message: string, ...args: any[]): void {
    console.error(`[${this.context}] ${message}`, ...args);
  }

  debug(message: string, ...args: any[]): void {
    // 在开发环境下显示调试信息
    // if (import.meta.env?.DEV) {
    //   console.debug(`[${this.context}] ${message}`, ...args);
    // }
  }
}
