import { Logger } from './logger';

/**
 * 性能监控工具
 * 统一管理性能测量，避免重复代码
 */
export class PerformanceMonitor {
  private readonly logger: Logger;
  private readonly timers = new Map<string, number>();
  private readonly metrics = new Map<string, number[]>();

  constructor(context: string) {
    this.logger = new Logger(`${context}:Performance`);
  }

  /**
   * 开始计时
   */
  startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }

  /**
   * 结束计时并记录
   */
  endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      this.logger.warn(`计时器 ${name} 未找到`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);
    
    // 记录到指标中
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);

    this.logger.debug(`${name} 耗时: ${duration.toFixed(2)}ms`);
    return duration;
  }

  /**
   * 测量函数执行时间
   */
  async measure<T>(
    name: string,
    operation: () => T | Promise<T>
  ): Promise<{ result: T; duration: number }> {
    this.startTimer(name);
    try {
      const result = await operation();
      const duration = this.endTimer(name);
      return { result, duration };
    } catch (error) {
      this.endTimer(name);
      throw error;
    }
  }

  /**
   * 测量同步函数执行时间
   */
  measureSync<T>(
    name: string,
    operation: () => T
  ): { result: T; duration: number } {
    this.startTimer(name);
    try {
      const result = operation();
      const duration = this.endTimer(name);
      return { result, duration };
    } catch (error) {
      this.endTimer(name);
      throw error;
    }
  }

  /**
   * 获取指标统计
   */
  getMetrics(name: string): {
    count: number;
    total: number;
    average: number;
    min: number;
    max: number;
  } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) {
      return null;
    }

    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      count: values.length,
      total,
      average,
      min,
      max
    };
  }

  /**
   * 获取所有指标
   */
  getAllMetrics(): Record<string, ReturnType<typeof this.getMetrics>> {
    const result: Record<string, ReturnType<typeof this.getMetrics>> = {};
    
    for (const [name] of this.metrics) {
      result[name] = this.getMetrics(name);
    }
    
    return result;
  }

  /**
   * 清除指标
   */
  clearMetrics(name?: string): void {
    if (name) {
      this.metrics.delete(name);
      this.logger.debug(`清除指标: ${name}`);
    } else {
      this.metrics.clear();
      this.logger.debug('清除所有指标');
    }
  }

  /**
   * 打印性能报告
   */
  printReport(): void {
    const allMetrics = this.getAllMetrics();
    
    this.logger.info('=== 性能报告 ===');
    for (const [name, metrics] of Object.entries(allMetrics)) {
      if (metrics) {
        this.logger.info(
          `${name}: 平均 ${metrics.average.toFixed(2)}ms, ` +
          `最小 ${metrics.min.toFixed(2)}ms, ` +
          `最大 ${metrics.max.toFixed(2)}ms, ` +
          `总计 ${metrics.count} 次`
        );
      }
    }
    this.logger.info('===============');
  }
}

/**
 * 全局性能监控器
 */
export const globalPerformanceMonitor = new PerformanceMonitor('Global');

/**
 * 创建特定上下文的性能监控器
 */
export function createPerformanceMonitor(context: string): PerformanceMonitor {
  return new PerformanceMonitor(context);
}
