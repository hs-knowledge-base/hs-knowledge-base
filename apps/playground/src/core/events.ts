import type { EventHandler, PlaygroundEvent } from '@/types';
import { Logger } from '../utils/logger';

/**
 * 类型安全的事件发射器
 * 支持事件中间件、错误处理、性能监控等功能
 */
export class EventEmitter {
  private readonly logger = new Logger('EventEmitter');
  private readonly listeners = new Map<string, Set<EventHandler>>();
  private readonly middlewares: EventMiddleware[] = [];
  private readonly eventStats = new Map<string, { count: number; lastEmitted: number }>();
  private maxListeners = 10;

  /** 添加事件监听器 */
  on(event: string, handler: EventHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const handlers = this.listeners.get(event)!;

    // 检查监听器数量限制
    if (handlers.size >= this.maxListeners) {
      this.logger.warn(`事件 ${event} 的监听器数量已达到上限 ${this.maxListeners}`);
    }

    handlers.add(handler);
    this.logger.debug(`添加事件监听器: ${event} (总数: ${handlers.size})`);
  }

  /** 移除事件监听器 */
  off(event: string, handler: EventHandler): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
      this.logger.debug(`移除事件监听器: ${event} (剩余: ${handlers.size})`);

      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /** 触发事件 */
  emit(type: string, payload?: any): void {
    const startTime = performance.now();

    // 更新统计信息
    this.updateEventStats(type);

    const handlers = this.listeners.get(type);
    if (!handlers || handlers.size === 0) {
      this.logger.debug(`没有监听器处理事件: ${type}`);
      return;
    }

    const event: PlaygroundEvent = { type, payload };

    // 执行中间件
    this.executeMiddlewares(event, () => {
      // 执行事件处理器
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          this.logger.error(`事件处理器错误 (${type}):`, error);
        }
      });
    });

    const duration = performance.now() - startTime;
    this.logger.debug(`事件处理完成: ${type} (${duration.toFixed(2)}ms, ${handlers.size} 个处理器)`);
  }

  /** 一次性事件监听器 */
  once(event: string, handler: EventHandler): void {
    const onceHandler: EventHandler = (e) => {
      handler(e);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler);
  }

  /** 添加事件中间件 */
  use(middleware: EventMiddleware): void {
    this.middlewares.push(middleware);
    this.logger.debug(`添加事件中间件: ${middleware.name || 'anonymous'}`);
  }

  /** 执行中间件链 */
  private executeMiddlewares(event: PlaygroundEvent, next: () => void): void {
    let index = 0;

    const executeNext = () => {
      if (index >= this.middlewares.length) {
        next();
        return;
      }

      const middleware = this.middlewares[index++];
      try {
        middleware.handle(event, executeNext);
      } catch (error) {
        this.logger.error(`中间件执行错误: ${middleware.name || 'anonymous'}`, error);
        executeNext();
      }
    };

    executeNext();
  }

  /** 更新事件统计信息 */
  private updateEventStats(eventType: string): void {
    const stats = this.eventStats.get(eventType) || { count: 0, lastEmitted: 0 };
    stats.count++;
    stats.lastEmitted = Date.now();
    this.eventStats.set(eventType, stats);
  }

  /** 移除所有监听器 */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
      this.logger.debug(`移除所有 ${event} 事件监听器`);
    } else {
      this.listeners.clear();
      this.logger.debug('移除所有事件监听器');
    }
  }

  /** 获取事件的监听器数量 */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size || 0;
  }

  /** 获取所有事件名称 */
  eventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  /** 获取事件统计信息 */
  getEventStats() {
    return {
      totalEvents: this.eventStats.size,
      totalListeners: Array.from(this.listeners.values()).reduce((sum, handlers) => sum + handlers.size, 0),
      middlewareCount: this.middlewares.length,
      maxListeners: this.maxListeners,
      eventStats: Object.fromEntries(this.eventStats)
    };
  }

  /** 销毁事件发射器 */
  destroy(): void {
    this.removeAllListeners();
    this.middlewares.length = 0;
    this.eventStats.clear();
    this.logger.info('事件发射器已销毁');
  }
}

/** 事件中间件接口 */
export interface EventMiddleware {
  name?: string;
  handle(event: PlaygroundEvent, next: () => void): void;
}
