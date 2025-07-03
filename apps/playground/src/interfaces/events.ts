/**
 * 事件系统接口
 */

/** 事件处理器类型 */
export type EventHandler<T = any> = (data: T) => void | Promise<void>;

/** 事件数据类型映射 */
export interface EventDataMap {
  'ready': {};
  'error': { error: Error };
  'run': { code: any };
  'code-update': { editor: string; code: string };
  'language-change': { editorType: string; language: string };
  'config-update': { config: any };
  'layout-change': { layout: string };
  'theme-change': { theme: string };
}

/**
 * 事件发射器接口
 */
export interface IEventEmitter {
  /** 监听事件 */
  on<K extends keyof EventDataMap>(event: K, handler: EventHandler<EventDataMap[K]>): void;
  
  /** 监听一次事件 */
  once<K extends keyof EventDataMap>(event: K, handler: EventHandler<EventDataMap[K]>): void;
  
  /** 移除事件监听器 */
  off<K extends keyof EventDataMap>(event: K, handler: EventHandler<EventDataMap[K]>): void;
  
  /** 发射事件 */
  emit<K extends keyof EventDataMap>(event: K, data: EventDataMap[K]): void;
  
  /** 移除所有监听器 */
  removeAllListeners(event?: keyof EventDataMap): void;
  
  /** 获取监听器数量 */
  listenerCount(event: keyof EventDataMap): number;
}

/**
 * 事件总线接口
 */
export interface IEventBus extends IEventEmitter {
  /** 创建命名空间 */
  namespace(name: string): IEventEmitter;
  
  /** 销毁事件总线 */
  destroy(): void;
}

/**
 * 事件中间件接口
 */
export interface IEventMiddleware {
  /** 处理事件 */
  handle<K extends keyof EventDataMap>(
    event: K, 
    data: EventDataMap[K], 
    next: () => void
  ): void | Promise<void>;
}
