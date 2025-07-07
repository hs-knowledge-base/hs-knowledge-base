import { useEffect, useRef, useCallback } from 'react';
import type { PlaygroundEvents } from '@/types';
import { Logger } from './logger';
import { createPerformanceMonitor } from './performance-monitor';

/**
 * 事件处理器类型
 */
export type EventHandler<T = any> = (payload: T) => void;

/**
 * Playground 事件类型
 */
export interface PlaygroundEvent<T = any> {
  type: string;
  payload: T;
  timestamp: number;
}

/**
 * 事件中间件接口
 */
export interface EventMiddleware {
  name?: string;
  handle<T>(event: PlaygroundEvent<T>, next: () => void): void;
}

/**
 * 类型安全的事件发射器 - React 适配版本
 * 支持事件中间件、错误处理、性能监控等功能
 */
export class EventEmitter {
  private readonly logger = new Logger(EventEmitter.name);
  private readonly performanceMonitor = createPerformanceMonitor(EventEmitter.name);
  private readonly listeners = new Map<string, Set<EventHandler>>();
  private readonly middlewares: EventMiddleware[] = [];
  private readonly eventStats = new Map<string, { count: number; lastEmitted: number }>();
  private maxListeners = 10;

  /** 添加事件监听器 */
  on<K extends keyof PlaygroundEvents>(
    event: K,
    handler: EventHandler<PlaygroundEvents[K]>
  ): () => void;
  on(event: string, handler: EventHandler): () => void;
  on(event: string, handler: EventHandler): () => void {
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

    // 返回取消监听的函数
    return () => {
      this.off(event, handler);
    };
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
  emit<K extends keyof PlaygroundEvents>(
    type: K,
    payload: PlaygroundEvents[K]
  ): void;
  emit(type: string, payload?: any): void;
  emit(type: string, payload?: any): void {
    // 使用性能监控器测量事件处理时间
    const { duration } = this.performanceMonitor.measureSync(`event:${type}`, () => {
      // 更新统计信息
      this.updateEventStats(type);

      const handlers = this.listeners.get(type);
      if (!handlers || handlers.size === 0) {
        this.logger.debug(`没有监听器处理事件: ${type}`);
        return;
      }

      const event: PlaygroundEvent = {
        type,
        payload,
        timestamp: Date.now()
      };

      // 执行中间件
      this.executeMiddlewares(event, () => {
        // 执行事件处理器
        handlers.forEach(handler => {
          try {
            handler(payload);
          } catch (error) {
            this.logger.error(`事件处理器错误 (${type}):`, error);
          }
        });
      });
    });

    this.logger.debug(`事件处理完成: ${type} (${duration.toFixed(2)}ms)`);
  }

  /** 一次性事件监听器 */
  once<K extends keyof PlaygroundEvents>(
    event: K,
    handler: EventHandler<PlaygroundEvents[K]>
  ): () => void;
  once(event: string, handler: EventHandler): () => void;
  once(event: string, handler: EventHandler): () => void {
    const onceHandler: EventHandler = (payload) => {
      handler(payload);
      this.off(event, onceHandler);
    };
    return this.on(event, onceHandler);
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

  /** 设置最大监听器数量 */
  setMaxListeners(max: number): void {
    this.maxListeners = max;
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

// 全局事件发射器实例
let globalEventEmitter: EventEmitter | null = null;

/** 获取全局事件发射器 */
export function getGlobalEventEmitter(): EventEmitter {
  if (!globalEventEmitter) {
    globalEventEmitter = new EventEmitter();
  }
  return globalEventEmitter;
}

/** 销毁全局事件发射器 */
export function destroyGlobalEventEmitter(): void {
  if (globalEventEmitter) {
    globalEventEmitter.destroy();
    globalEventEmitter = null;
  }
}

/**
 * React Hook: 使用事件发射器
 */
export function useEventEmitter(): EventEmitter {
  const emitterRef = useRef<EventEmitter | null>(null);

  if (!emitterRef.current) {
    emitterRef.current = new EventEmitter();
  }

  useEffect(() => {
    return () => {
      if (emitterRef.current) {
        emitterRef.current.destroy();
        emitterRef.current = null;
      }
    };
  }, []);

  return emitterRef.current;
}

/**
 * React Hook: 使用全局事件发射器
 */
export function useGlobalEventEmitter(): EventEmitter {
  return getGlobalEventEmitter();
}

/**
 * React Hook: 监听事件
 */
export function useEventListener<K extends keyof PlaygroundEvents>(
  event: K,
  handler: EventHandler<PlaygroundEvents[K]>,
  emitter?: EventEmitter
): void;
export function useEventListener(
  event: string,
  handler: EventHandler,
  emitter?: EventEmitter
): void;
export function useEventListener(
  event: string,
  handler: EventHandler,
  emitter?: EventEmitter
): void {
  const defaultEmitter = useGlobalEventEmitter();
  const targetEmitter = emitter || defaultEmitter;
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const wrappedHandler = (payload: any) => {
      handlerRef.current(payload);
    };

    const unsubscribe = targetEmitter.on(event, wrappedHandler);
    return unsubscribe;
  }, [event, targetEmitter]);
}

/**
 * React Hook: 触发事件
 */
export function useEventEmit(emitter?: EventEmitter) {
  const defaultEmitter = useGlobalEventEmitter();
  const targetEmitter = emitter || defaultEmitter;

  return useCallback(<K extends keyof PlaygroundEvents>(
    event: K,
    payload: PlaygroundEvents[K]
  ) => {
    targetEmitter.emit(event, payload);
  }, [targetEmitter]);
}

/**
 * 常用的事件中间件
 */
export const eventMiddlewares = {
  /** 日志中间件 */
  logger: (name: string = 'EventLogger'): EventMiddleware => ({
    name,
    handle(event, next) {
      console.log(`[${name}] 事件: ${event.type}`, event.payload);
      next();
    }
  }),

  /** 性能监控中间件 */
  performance: (name: string = 'PerformanceMonitor'): EventMiddleware => ({
    name,
    handle(event, next) {
      const start = performance.now();
      next();
      const duration = performance.now() - start;
      if (duration > 10) { // 只记录超过 10ms 的事件
        console.warn(`[${name}] 慢事件: ${event.type} (${duration.toFixed(2)}ms)`);
      }
    }
  }),

  /** 错误捕获中间件 */
  errorHandler: (name: string = 'ErrorHandler'): EventMiddleware => ({
    name,
    handle(event, next) {
      try {
        next();
      } catch (error) {
        console.error(`[${name}] 事件处理错误: ${event.type}`, error);
        // 可以在这里添加错误上报逻辑
      }
    }
  })
};

/**
 * React Hook: 获取事件发射器引用
 */
export function useEventEmitterRef(): React.RefObject<EventEmitter> {
  const emitterRef = useRef<EventEmitter>(new EventEmitter());
  return emitterRef;
}
