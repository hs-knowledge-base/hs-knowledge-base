import { useRef, useEffect } from 'react';

/**
 * 简单的依赖注入容器 - React 适配版本
 * 管理服务的注册、解析和生命周期
 */
export class ServiceContainer {
  private readonly services = new Map<string, any>();
  private readonly factories = new Map<string, () => any>();
  private readonly singletons = new Map<string, any>();
  private readonly disposables = new Set<() => void>();

  /** 注册服务实例 */
  register<T>(name: string, instance: T): void {
    this.services.set(name, instance);
    console.debug(`[ServiceContainer] 注册服务: ${name}`);
  }

  /** 注册服务工厂 */
  registerFactory<T>(name: string, factory: () => T): void {
    this.factories.set(name, factory);
    console.debug(`[ServiceContainer] 注册服务工厂: ${name}`);
  }

  /** 注册单例服务工厂 */
  registerSingleton<T>(name: string, factory: () => T): void {
    this.factories.set(name, factory);
    console.debug(`[ServiceContainer] 注册单例服务: ${name}`);
  }

  /** 解析服务 */
  resolve<T>(name: string): T {
    // 首先检查已注册的实例
    if (this.services.has(name)) {
      return this.services.get(name) as T;
    }

    // 检查单例缓存
    if (this.singletons.has(name)) {
      return this.singletons.get(name) as T;
    }

    // 使用工厂创建
    if (this.factories.has(name)) {
      const factory = this.factories.get(name)!;
      const instance = factory();
      
      // 缓存单例
      this.singletons.set(name, instance);
      console.debug(`[ServiceContainer] 创建服务实例: ${name}`);
      
      return instance as T;
    }

    throw new Error(`服务未找到: ${name}`);
  }

  /** 检查服务是否存在 */
  has(name: string): boolean {
    return this.services.has(name) || this.factories.has(name);
  }

  /** 获取所有已注册的服务名称 */
  getRegisteredServices(): string[] {
    const serviceNames = Array.from(this.services.keys());
    const factoryNames = Array.from(this.factories.keys());
    return [...serviceNames, ...factoryNames];
  }

  /** 注册清理函数 */
  registerDisposable(dispose: () => void): void {
    this.disposables.add(dispose);
  }

  /** 清除所有服务 */
  clear(): void {
    this.services.clear();
    this.factories.clear();
    this.singletons.clear();
    console.info('[ServiceContainer] 服务容器已清空');
  }

  /** 销毁容器 */
  destroy(): void {
    // 执行所有清理函数
    this.disposables.forEach(dispose => {
      try {
        dispose();
      } catch (error) {
        console.warn('[ServiceContainer] 清理函数执行失败:', error);
      }
    });
    this.disposables.clear();

    // 销毁所有单例实例
    this.singletons.forEach((instance, name) => {
      if (instance && typeof instance.destroy === 'function') {
        try {
          instance.destroy();
          console.debug(`[ServiceContainer] 销毁服务: ${name}`);
        } catch (error) {
          console.warn(`[ServiceContainer] 销毁服务失败: ${name}`, error);
        }
      }
    });

    this.clear();
    console.info('[ServiceContainer] 服务容器已销毁');
  }

  /** 获取容器统计信息 */
  getStats() {
    return {
      servicesCount: this.services.size,
      factoriesCount: this.factories.size,
      singletonsCount: this.singletons.size,
      totalRegistered: this.services.size + this.factories.size
    };
  }
}

// 全局服务容器实例
let globalContainer: ServiceContainer | null = null;

/** 获取全局服务容器 */
export function getGlobalContainer(): ServiceContainer {
  if (!globalContainer) {
    globalContainer = new ServiceContainer();
  }
  return globalContainer;
}

/** 销毁全局服务容器 */
export function destroyGlobalContainer(): void {
  if (globalContainer) {
    globalContainer.destroy();
    globalContainer = null;
  }
}

/**
 * React Hook: 使用服务容器
 * 在组件卸载时自动清理资源
 */
export function useServiceContainer(): ServiceContainer {
  const containerRef = useRef<ServiceContainer | null>(null);

  if (!containerRef.current) {
    containerRef.current = new ServiceContainer();
  }

  useEffect(() => {
    return () => {
      if (containerRef.current) {
        containerRef.current.destroy();
        containerRef.current = null;
      }
    };
  }, []);

  return containerRef.current;
}

/**
 * React Hook: 使用全局服务容器
 * 组件间共享服务实例
 */
export function useGlobalServiceContainer(): ServiceContainer {
  const container = getGlobalContainer();

  useEffect(() => {
    // 组件卸载时不销毁全局容器，因为其他组件可能还在使用
    return () => {
      // 可以在这里添加一些清理逻辑，但不销毁容器
    };
  }, []);

  return container;
}

/**
 * React Hook: 注册服务到容器
 */
export function useService<T>(
  name: string,
  factory: () => T,
  container?: ServiceContainer
): T {
  const defaultContainer = useGlobalServiceContainer();
  const targetContainer = container || defaultContainer;

  // 注册服务工厂（如果还没注册）
  if (!targetContainer.has(name)) {
    targetContainer.registerSingleton(name, factory);
  }

  return targetContainer.resolve<T>(name);
}

/**
 * React Hook: 使用已注册的服务
 */
export function useResolveService<T>(
  name: string,
  container?: ServiceContainer
): T {
  const defaultContainer = useGlobalServiceContainer();
  const targetContainer = container || defaultContainer;

  return targetContainer.resolve<T>(name);
}

/**
 * 服务装饰器工厂
 * 用于标记需要注入的服务
 */
export function createServiceDecorator<T>(serviceName: string) {
  return function useServiceDecorator(container?: ServiceContainer): T {
    return useResolveService<T>(serviceName, container);
  };
}

/**
 * 服务提供者接口
 */
export interface ServiceProvider {
  register(container: ServiceContainer): void;
}

/**
 * 批量注册服务提供者
 */
export function registerServiceProviders(
  container: ServiceContainer,
  providers: ServiceProvider[]
): void {
  providers.forEach(provider => {
    try {
      provider.register(container);
      console.debug(`[ServiceContainer] 服务提供者注册成功: ${provider.constructor.name}`);
    } catch (error) {
      console.error(`[ServiceContainer] 服务提供者注册失败: ${provider.constructor.name}`, error);
    }
  });
}

/**
 * 服务配置接口
 */
export interface ServiceConfig {
  name: string;
  factory: () => any;
  singleton?: boolean;
}

/**
 * 批量注册服务配置
 */
export function registerServices(
  container: ServiceContainer,
  configs: ServiceConfig[]
): void {
  configs.forEach(config => {
    try {
      if (config.singleton !== false) {
        container.registerSingleton(config.name, config.factory);
      } else {
        container.registerFactory(config.name, config.factory);
      }
      console.debug(`[ServiceContainer] 服务配置注册成功: ${config.name}`);
    } catch (error) {
      console.error(`[ServiceContainer] 服务配置注册失败: ${config.name}`, error);
    }
  });
}
