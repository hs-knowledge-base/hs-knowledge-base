/**
 * Core 模块统一导出
 * 遵循 SOLID 原则的核心功能模块
 */

// 核心类
export { ConfigManager } from './config-manager';
export { ConfigValidator } from './config-validator';
export { EventEmitter } from './events';
export { ServiceContainer } from './service-container';
export { Logger } from './logger';
export { ErrorHandler, globalErrorHandler, createErrorHandler } from './error-handler';
export { PerformanceMonitor, globalPerformanceMonitor, createPerformanceMonitor } from './performance-monitor';

// React Hooks
export { 
  useConfigManager,
  useConfigValue,
  useConfigUpdater 
} from './config-manager';

export {
  useEventEmitter,
  useEventListener,
  useEventEmitterRef
} from './events';

export {
  useServiceContainer,
  useService,
  useResolveService,
  useServiceRef
} from './service-container';

// 工具函数
export {
  registerServiceProviders,
  registerServices
} from './service-container';

// 类型定义
export type { PlaygroundConfig } from './config-manager';
export type { EventHandler, EventMiddleware } from './events';
export type { ServiceProvider, ServiceConfig } from './service-container';
