# LiveCodes SDK 设计架构详解

## 概述

LiveCodes SDK 是一个轻量级（小于 5kb gzipped）、零依赖的软件开发工具包，提供了强大而易用的接口来嵌入和控制 LiveCodes 代码游乐场。SDK 支持多种前端框架，包括原生 JavaScript/TypeScript、React、Vue 和 Svelte。

## 核心设计理念

### 1. 框架无关的核心设计

SDK 采用框架无关的核心设计，然后为不同框架提供专门的包装器：

```
src/sdk/
├── index.ts          # 核心 SDK 实现
├── models.ts         # 类型定义
├── react.tsx         # React 组件包装器
├── vue.ts           # Vue 组件包装器
└── package.sdk.json  # SDK 包配置
```

### 2. 统一的 API 接口

所有 SDK 变体都提供相同的核心 API：

```typescript
export interface API {
  // 执行代码
  run: () => Promise<void>;
  
  // 格式化代码
  format: (allEditors?: boolean) => Promise<void>;
  
  // 获取分享链接
  getShareUrl: (shortUrl?: boolean) => Promise<string>;
  
  // 配置管理
  getConfig: (contentOnly?: boolean) => Promise<Config>;
  setConfig: (config: Partial<Config>) => Promise<Config>;
  
  // 代码管理
  getCode: () => Promise<Code>;
  
  // 界面控制
  show: (panel: string, options?: any) => Promise<void>;
  
  // 测试运行
  runTests: () => Promise<{ results: TestResult[] }>;
  
  // 事件监听
  watch: WatchFn;
  
  // 执行命令
  exec: (command: APICommands, ...args: any[]) => Promise<any>;
  
  // 销毁实例
  destroy: () => Promise<void>;
}
```

## 通信机制详解

### 1. PostMessage 通信架构

SDK 使用 PostMessage API 实现与嵌入的 LiveCodes iframe 的双向通信：

```typescript
// SDK 端发送消息
const callAPI = <T>(method: keyof API, args?: any[]) =>
  new Promise<T>(async (resolve, reject) => {
    if (destroyed) {
      return reject(alreadyDestroyedMessage);
    }
    
    await loadLivecodes();
    const id = getRandomString(); // 生成唯一 ID
    
    // 注册响应处理器
    registerEventHandler(function handler(e: MessageEventInit) {
      if (
        e.source !== iframe.contentWindow ||
        e.origin !== origin ||
        e.data?.type !== 'livecodes-api-response' ||
        e.data?.id !== id
      ) {
        return;
      }
      
      if (e.data.method === method) {
        removeEventListener('message', handler);
        const payload = e.data.payload;
        if (payload?.error) {
          reject(payload.error);
        } else {
          resolve(payload);
        }
      }
    });
    
    // 发送请求
    iframe.contentWindow?.postMessage({ method, id, args }, origin);
  });

// LiveCodes 端处理消息
window.addEventListener('message', async (e) => {
  const { method, id, args } = e.data;
  
  if (!api[method]) {
    return sendError(e, `Unknown API method: ${method}`);
  }
  
  try {
    const result = await api[method](...(args || []));
    e.source?.postMessage({
      type: 'livecodes-api-response',
      method,
      id,
      payload: result
    }, e.origin);
  } catch (error) {
    e.source?.postMessage({
      type: 'livecodes-api-response',
      method,
      id,
      payload: { error: error.message }
    }, e.origin);
  }
});
```

### 2. 事件系统

SDK 实现了完整的事件系统，支持监听各种 playground 事件：

```typescript
// 事件类型定义
export type SDKEvent = 'load' | 'ready' | 'code' | 'console' | 'tests' | 'destroy';

// 事件监听器接口
export interface WatchFn {
  (event: 'load', fn: () => void): { remove: () => void };
  (event: 'ready', fn: () => void): { remove: () => void };
  (event: 'code', fn: (data: { code: Code; config: Config }) => void): { remove: () => void };
  (event: 'console', fn: (data: { method: string; args: any[] }) => void): { remove: () => void };
  (event: 'tests', fn: (data: { results: TestResult[] }) => void): { remove: () => void };
  (event: 'destroy', fn: () => void): { remove: () => void };
}

// 事件监听实现
const watch: WatchFn = (event: SDKEvent, fn: any) => {
  if (destroyed) {
    throw new Error(alreadyDestroyedMessage);
  }
  
  const eventType = `livecodes-${event}`;
  
  const handler = (e: MessageEventInit) => {
    if (
      e.source !== iframe.contentWindow ||
      e.origin !== origin ||
      e.data?.type !== eventType
    ) {
      return;
    }
    
    fn(e.data.payload);
  };
  
  registerEventHandler(handler);
  
  return {
    remove: () => removeEventListener('message', handler)
  };
};
```

### 3. 生命周期管理

SDK 管理 playground 的完整生命周期：

```typescript
// 初始化流程
const createPlayground = async (
  container: string | HTMLElement,
  options: EmbedOptions = {}
): Promise<Playground> => {
  // 1. 验证容器
  const containerElement = getContainer(container);
  
  // 2. 创建 iframe
  const iframe = await createIframe(containerElement, options);
  
  // 3. 等待 LiveCodes 准备就绪
  const livecodesReady = waitForReady(iframe);
  
  // 4. 设置通信
  setupCommunication(iframe);
  
  // 5. 返回 API 实例
  return createAPIInstance(iframe, livecodesReady);
};

// iframe 创建
const createIframe = async (
  container: HTMLElement,
  options: EmbedOptions
): Promise<HTMLIFrameElement> => {
  const iframe = document.createElement('iframe');
  
  // 设置 iframe 属性
  iframe.src = buildIframeUrl(options);
  iframe.style.width = '100%';
  iframe.style.height = options.height || '300px';
  iframe.style.border = 'none';
  iframe.loading = options.loading || 'lazy';
  
  // 安全设置
  iframe.sandbox = 'allow-same-origin allow-scripts allow-forms allow-downloads';
  
  container.appendChild(iframe);
  
  // 等待 iframe 加载
  return new Promise((resolve) => {
    iframe.onload = () => resolve(iframe);
  });
};

// 等待就绪
const waitForReady = (iframe: HTMLIFrameElement): Promise<void> => {
  return new Promise((resolve) => {
    const handler = (e: MessageEvent) => {
      if (
        e.source === iframe.contentWindow &&
        e.data?.type === 'livecodes-ready'
      ) {
        removeEventListener('message', handler);
        resolve();
      }
    };
    
    addEventListener('message', handler);
  });
};
```

## 框架集成实现

### 1. React 组件

React SDK 提供了声明式的组件接口：

```typescript
import React, { useRef, useEffect, useState } from 'react';
import { createPlayground, type Playground, type EmbedOptions } from './index';

interface Props extends EmbedOptions {
  className?: string;
  style?: React.CSSProperties;
  sdkReady?: (playground: Playground) => void;
}

export default function LiveCodes(props: Props): React.ReactElement<Props> {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playgroundRef = useRef<Playground | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const { className, style, sdkReady, ...options } = props;
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    let mounted = true;
    
    createPlayground(containerRef.current, options)
      .then((playground) => {
        if (!mounted) {
          playground.destroy();
          return;
        }
        
        playgroundRef.current = playground;
        setIsReady(true);
        sdkReady?.(playground);
      })
      .catch(console.error);
    
    return () => {
      mounted = false;
      if (playgroundRef.current) {
        playgroundRef.current.destroy();
        playgroundRef.current = null;
      }
    };
  }, []);
  
  // 配置变更处理
  useEffect(() => {
    if (isReady && playgroundRef.current && options.config) {
      playgroundRef.current.setConfig(options.config);
    }
  }, [isReady, options.config]);
  
  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '300px', ...style }}
    />
  );
}
```

### 2. Vue 组件

Vue SDK 使用 Composition API 提供响应式的接口：

```typescript
import { ref, onMounted, onUnmounted, watch, defineComponent } from 'vue';
import { createPlayground, type Playground, type EmbedOptions } from './index';

export default defineComponent({
  name: 'LiveCodes',
  props: {
    // EmbedOptions 的所有属性
    config: Object,
    import: String,
    lite: Boolean,
    loading: String,
    params: Object,
    template: String,
    view: String,
    // 样式属性
    height: String,
    style: Object,
  },
  emits: ['sdkReady'],
  setup(props, { emit }) {
    const containerRef = ref<HTMLElement>();
    const playground = ref<Playground | undefined>();
    
    onMounted(async () => {
      if (!containerRef.value) return;
      
      try {
        const { height, style, ...options } = props;
        const instance = await createPlayground(containerRef.value, options);
        
        playground.value = instance;
        emit('sdkReady', instance);
      } catch (error) {
        console.error('Failed to create playground:', error);
      }
    });
    
    onUnmounted(() => {
      if (playground.value) {
        playground.value.destroy();
      }
    });
    
    // 监听配置变更
    watch(
      () => props.config,
      (newConfig) => {
        if (playground.value && newConfig) {
          playground.value.setConfig(newConfig);
        }
      },
      { deep: true }
    );
    
    return {
      containerRef,
      playground,
    };
  },
  template: `
    <div 
      ref="containerRef" 
      :style="{ width: '100%', height: height || '300px', ...style }"
    />
  `,
});
```

### 3. Svelte 集成

Svelte 可以直接使用核心 SDK，无需特殊包装器：

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import { createPlayground } from 'livecodes';
  
  export let config = {};
  export let height = '300px';
  
  let container;
  let playground;
  
  onMount(async () => {
    if (container) {
      try {
        playground = await createPlayground(container, { config });
        // playground 准备就绪
      } catch (error) {
        console.error('Failed to create playground:', error);
      }
    }
  });
  
  onDestroy(() => {
    if (playground) {
      playground.destroy();
    }
  });
  
  // 响应配置变更
  $: if (playground && config) {
    playground.setConfig(config);
  }
</script>

<div bind:this={container} style="width: 100%; height: {height};" />
```

## 高级功能

### 1. 无头模式 (Headless Mode)

无头模式允许在不显示 UI 的情况下使用 LiveCodes 的编译和执行能力：

```typescript
// 创建无头实例
const headlessPlayground = await createPlayground(container, {
  headless: true,
  config: {
    script: {
      language: 'typescript',
      content: 'console.log("Hello from headless mode");'
    }
  }
});

// 编译和执行代码
await headlessPlayground.run();

// 获取编译结果
const code = await headlessPlayground.getCode();
console.log('Compiled JavaScript:', code.script.compiled);
```

### 2. 批量操作

SDK 支持批量操作以提高性能：

```typescript
// 批量设置配置
const batchUpdate = async (playground: Playground) => {
  const updates = [
    { markup: { content: '<h1>Hello</h1>' } },
    { style: { content: 'h1 { color: blue; }' } },
    { script: { content: 'console.log("Updated");' } },
  ];
  
  // 使用事务模式避免多次重新编译
  await playground.exec('startTransaction');
  
  for (const update of updates) {
    await playground.setConfig(update);
  }
  
  await playground.exec('commitTransaction');
};
```

### 3. 自定义命令

SDK 支持执行自定义命令：

```typescript
// 设置广播令牌
await playground.exec('setBroadcastToken', 'your-token');

// 显示版本信息
const version = await playground.exec('showVersion');

// 导出项目
const exportData = await playground.exec('exportProject', 'json');

// 自定义命令示例
await playground.exec('customCommand', {
  action: 'highlight',
  line: 10,
  column: 5
});
```

## 错误处理和调试

### 1. 错误处理机制

SDK 提供了完善的错误处理机制：

```typescript
// 全局错误处理
const createPlaygroundWithErrorHandling = async (
  container: string | HTMLElement,
  options: EmbedOptions = {}
): Promise<Playground> => {
  try {
    return await createPlayground(container, options);
  } catch (error) {
    // 分类错误类型
    if (error instanceof ContainerNotFoundError) {
      throw new SDKError('Container element not found', 'CONTAINER_NOT_FOUND');
    } else if (error instanceof IframeLoadError) {
      throw new SDKError('Failed to load LiveCodes iframe', 'IFRAME_LOAD_FAILED');
    } else if (error instanceof CommunicationError) {
      throw new SDKError('Communication with LiveCodes failed', 'COMMUNICATION_FAILED');
    } else {
      throw new SDKError('Unknown error occurred', 'UNKNOWN_ERROR', error);
    }
  }
};

// 自定义错误类
class SDKError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'SDKError';
  }
}

// API 调用错误处理
const safeAPICall = async <T>(
  apiCall: () => Promise<T>,
  fallback?: T
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    console.warn('API call failed:', error);

    if (fallback !== undefined) {
      return fallback;
    }

    throw error;
  }
};
```

### 2. 调试工具

SDK 内置了调试工具来帮助开发者：

```typescript
// 调试模式
const createDebugPlayground = async (
  container: string | HTMLElement,
  options: EmbedOptions & { debug?: boolean } = {}
): Promise<Playground> => {
  const playground = await createPlayground(container, options);

  if (options.debug) {
    // 添加调试包装器
    return createDebugWrapper(playground);
  }

  return playground;
};

const createDebugWrapper = (playground: Playground): Playground => {
  const debugLog = (method: string, args: any[], result?: any) => {
    console.group(`🎮 LiveCodes SDK: ${method}`);
    console.log('Arguments:', args);
    if (result !== undefined) {
      console.log('Result:', result);
    }
    console.groupEnd();
  };

  // 包装所有 API 方法
  return new Proxy(playground, {
    get(target, prop) {
      const value = target[prop];

      if (typeof value === 'function') {
        return async (...args: any[]) => {
          const startTime = performance.now();

          try {
            const result = await value.apply(target, args);
            const duration = performance.now() - startTime;

            debugLog(prop as string, args, result);
            console.log(`⏱️ Duration: ${duration.toFixed(2)}ms`);

            return result;
          } catch (error) {
            debugLog(prop as string, args);
            console.error(`❌ Error:`, error);
            throw error;
          }
        };
      }

      return value;
    }
  });
};
```

### 3. 性能监控

SDK 提供性能监控功能：

```typescript
// 性能监控器
class PerformanceMonitor {
  private metrics = new Map<string, number[]>();

  startTiming(operation: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(operation, duration);
    };
  }

  recordMetric(operation: string, duration: number) {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }

    this.metrics.get(operation)!.push(duration);
  }

  getStats(operation: string) {
    const durations = this.metrics.get(operation) || [];
    if (durations.length === 0) return null;

    const sorted = durations.sort((a, b) => a - b);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];

    return { avg, median, p95, count: durations.length };
  }

  getAllStats() {
    const stats: Record<string, any> = {};
    for (const [operation] of this.metrics) {
      stats[operation] = this.getStats(operation);
    }
    return stats;
  }
}

// 在 SDK 中集成性能监控
const monitor = new PerformanceMonitor();

const monitoredAPICall = async <T>(
  operation: string,
  apiCall: () => Promise<T>
): Promise<T> => {
  const endTiming = monitor.startTiming(operation);

  try {
    const result = await apiCall();
    endTiming();
    return result;
  } catch (error) {
    endTiming();
    throw error;
  }
};
```

## 安全性考虑

### 1. 源验证

SDK 严格验证消息来源：

```typescript
// 安全的消息处理
const isValidOrigin = (origin: string, allowedOrigins: string[]): boolean => {
  // 检查是否在允许的源列表中
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // 检查是否为 LiveCodes 官方域名
  const livecodesOrigins = [
    'https://livecodes.io',
    'https://dev.livecodes.io',
    'https://v1.livecodes.io',
  ];

  return livecodesOrigins.includes(origin);
};

const secureMessageHandler = (
  allowedOrigins: string[] = []
) => (e: MessageEvent) => {
  // 验证来源
  if (!isValidOrigin(e.origin, allowedOrigins)) {
    console.warn('Rejected message from unauthorized origin:', e.origin);
    return;
  }

  // 验证消息格式
  if (!isValidMessage(e.data)) {
    console.warn('Rejected invalid message format:', e.data);
    return;
  }

  // 处理消息
  handleMessage(e);
};
```

### 2. 内容安全策略

SDK 支持内容安全策略配置：

```typescript
// CSP 配置
interface SecurityOptions {
  allowedOrigins?: string[];
  allowUnsafeEval?: boolean;
  allowUnsafeInline?: boolean;
  trustedTypes?: boolean;
}

const createSecurePlayground = async (
  container: string | HTMLElement,
  options: EmbedOptions & { security?: SecurityOptions } = {}
): Promise<Playground> => {
  const securityOptions = {
    allowedOrigins: ['https://livecodes.io'],
    allowUnsafeEval: false,
    allowUnsafeInline: false,
    trustedTypes: true,
    ...options.security,
  };

  // 应用安全策略
  applySecurityPolicy(securityOptions);

  return createPlayground(container, options);
};

const applySecurityPolicy = (security: SecurityOptions) => {
  // 设置 CSP 头部（如果支持）
  if (document.head && security.trustedTypes) {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = buildCSPContent(security);
    document.head.appendChild(meta);
  }
};
```

## 最佳实践

### 1. 资源管理

```typescript
// 资源管理最佳实践
class PlaygroundManager {
  private playgrounds = new Set<Playground>();

  async create(
    container: string | HTMLElement,
    options: EmbedOptions = {}
  ): Promise<Playground> {
    const playground = await createPlayground(container, options);
    this.playgrounds.add(playground);

    // 自动清理
    playground.watch('destroy', () => {
      this.playgrounds.delete(playground);
    });

    return playground;
  }

  async destroyAll(): Promise<void> {
    const promises = Array.from(this.playgrounds).map(p => p.destroy());
    await Promise.all(promises);
    this.playgrounds.clear();
  }

  getActiveCount(): number {
    return this.playgrounds.size;
  }
}

// 全局管理器实例
export const playgroundManager = new PlaygroundManager();

// 页面卸载时自动清理
window.addEventListener('beforeunload', () => {
  playgroundManager.destroyAll();
});
```

### 2. 配置管理

```typescript
// 配置管理工具
class ConfigManager {
  private defaultConfig: Partial<Config>;

  constructor(defaultConfig: Partial<Config> = {}) {
    this.defaultConfig = defaultConfig;
  }

  merge(...configs: Array<Partial<Config>>): Config {
    return deepMerge(this.defaultConfig, ...configs) as Config;
  }

  validate(config: Partial<Config>): boolean {
    // 验证配置的有效性
    return validateConfig(config);
  }

  sanitize(config: Partial<Config>): Partial<Config> {
    // 清理和标准化配置
    return sanitizeConfig(config);
  }
}

// 使用示例
const configManager = new ConfigManager({
  theme: 'dark',
  autoupdate: 1000,
  tools: { enabled: 'all', active: 'console', status: 'open' },
});

const playground = await createPlayground(container, {
  config: configManager.merge(userConfig, projectConfig),
});
```

### 3. 错误恢复

```typescript
// 自动错误恢复
class ResilientPlayground {
  private playground: Playground | null = null;
  private container: HTMLElement;
  private options: EmbedOptions;
  private retryCount = 0;
  private maxRetries = 3;

  constructor(container: HTMLElement, options: EmbedOptions) {
    this.container = container;
    this.options = options;
  }

  async initialize(): Promise<Playground> {
    try {
      this.playground = await createPlayground(this.container, this.options);
      this.retryCount = 0; // 重置重试计数
      return this.playground;
    } catch (error) {
      return this.handleError(error);
    }
  }

  private async handleError(error: Error): Promise<Playground> {
    console.error('Playground initialization failed:', error);

    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`Retrying... (${this.retryCount}/${this.maxRetries})`);

      // 延迟重试
      await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));

      return this.initialize();
    }

    throw new Error(`Failed to initialize playground after ${this.maxRetries} attempts`);
  }

  async safeCall<T>(method: keyof API, ...args: any[]): Promise<T | null> {
    if (!this.playground) {
      console.warn('Playground not initialized');
      return null;
    }

    try {
      return await (this.playground[method] as any)(...args);
    } catch (error) {
      console.error(`API call failed: ${method}`, error);

      // 尝试重新初始化
      try {
        await this.initialize();
        return await (this.playground![method] as any)(...args);
      } catch (retryError) {
        console.error('Recovery failed:', retryError);
        return null;
      }
    }
  }
}
```

## 总结

LiveCodes SDK 的设计体现了以下关键特点：

### 技术优势
1. **轻量级设计**：小于 5kb 的体积，零依赖
2. **框架无关**：核心 SDK 不依赖任何框架
3. **类型安全**：完整的 TypeScript 类型定义
4. **异步优先**：所有 API 都是异步的，避免阻塞

### 架构优势
1. **统一接口**：所有框架变体提供相同的 API
2. **事件驱动**：完整的事件系统支持响应式编程
3. **错误处理**：完善的错误处理和恢复机制
4. **安全性**：严格的源验证和 CSP 支持

### 开发体验
1. **易于集成**：简单的 API 设计，快速上手
2. **调试友好**：内置调试工具和性能监控
3. **文档完善**：详细的类型定义和示例代码
4. **最佳实践**：提供资源管理和错误恢复的最佳实践

这种设计使得 LiveCodes SDK 成为一个强大而易用的工具，能够满足从简单嵌入到复杂集成的各种需求。
```
