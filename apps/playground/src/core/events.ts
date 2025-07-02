import type { EventHandler, PlaygroundEvent } from '../types';

/** 事件发射器 */
export class EventEmitter {
  private listeners = new Map<string, Set<EventHandler>>();

  /** 添加事件监听器 */
  on(event: string, handler: EventHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  /** 移除事件监听器 */
  off(event: string, handler: EventHandler): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /** 触发事件 */
  emit(type: string, payload?: any): void {
    const handlers = this.listeners.get(type);
    if (handlers) {
      const event: PlaygroundEvent = { type, payload };
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`事件处理器错误 (${type}):`, error);
        }
      });
    }
  }

  /** 一次性事件监听器 */
  once(event: string, handler: EventHandler): void {
    const onceHandler: EventHandler = (e) => {
      handler(e);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler);
  }

  /** 移除所有监听器 */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
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
}
