import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { Language } from '@/types';

/** 资源类型 */
export type ResourceType = 'script' | 'style' | 'module' | 'worker';

/** 资源配置 */
export interface ResourceConfig {
  url: string;
  type: ResourceType;
  timeout?: number;
  retries?: number;
  critical?: boolean;
  dependencies?: string[];
}

/** 资源状态 */
export type ResourceStatus = 'pending' | 'loading' | 'loaded' | 'error';

/** 资源信息 */
export interface ResourceInfo {
  id: string;
  config: ResourceConfig;
  status: ResourceStatus;
  loadTime?: number;
  error?: Error;
  retryCount: number;
}

/**
 * 资源加载器 - React 适配版本
 * 统一管理外部资源的加载，支持重试、超时、依赖管理等功能
 */
export class ResourceLoader {
  private readonly resources = new Map<string, ResourceInfo>();
  private readonly loadPromises = new Map<string, Promise<void>>();
  private readonly loadedCallbacks = new Map<string, Set<() => void>>();

  constructor() {
    console.info('[ResourceLoader] 资源加载器初始化完成');
  }

  /** 注册资源 */
  registerResource(id: string, config: ResourceConfig): void {
    if (this.resources.has(id)) {
      console.warn(`[ResourceLoader] 资源已存在，将被覆盖: ${id}`);
    }

    this.resources.set(id, {
      id,
      config,
      status: 'pending',
      retryCount: 0
    });

    console.debug(`[ResourceLoader] 注册资源: ${id}`);
  }

  /** 加载资源 */
  async loadResource(id: string): Promise<void> {
    const resource = this.resources.get(id);
    if (!resource) {
      throw new Error(`资源未找到: ${id}`);
    }

    if (resource.status === 'loaded') {
      return;
    }

    if (resource.status === 'loading') {
      return this.loadPromises.get(id);
    }

    // 检查依赖
    if (resource.config.dependencies) {
      await this.loadDependencies(resource.config.dependencies);
    }

    const loadPromise = this.performLoad(resource);
    this.loadPromises.set(id, loadPromise);

    try {
      await loadPromise;
    } finally {
      this.loadPromises.delete(id);
    }
  }

  /** 执行实际加载 */
  private async performLoad(resource: ResourceInfo): Promise<void> {
    const { id, config } = resource;
    const maxRetries = config.retries || 3;

    this.updateResourceStatus(id, 'loading');

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        
        await this.loadByType(config);
        
        const loadTime = Date.now() - startTime;
        this.updateResourceStatus(id, 'loaded', { loadTime });
        
        console.info(`[ResourceLoader] 资源加载成功: ${id} (${loadTime}ms)`);
        
        // 触发回调
        this.triggerLoadedCallbacks(id);
        return;

      } catch (error) {
        resource.retryCount = attempt + 1;
        
        if (attempt < maxRetries) {
          console.warn(`[ResourceLoader] 资源加载失败，重试 ${attempt + 1}/${maxRetries}: ${id}`, error);
          await this.delay(Math.pow(2, attempt) * 1000); // 指数退避
        } else {
          this.updateResourceStatus(id, 'error', { error: error as Error });
          console.error(`[ResourceLoader] 资源加载最终失败: ${id}`, error);
          throw error;
        }
      }
    }
  }

  /** 根据类型加载资源 */
  private async loadByType(config: ResourceConfig): Promise<void> {
    const timeout = config.timeout || 30000;

    switch (config.type) {
      case 'script':
        return this.loadScript(config.url, timeout);
      case 'style':
        return this.loadStyle(config.url, timeout);
      case 'module':
        // 对于模块类型，我们暂时当作脚本处理
        console.warn(`[ResourceLoader] 模块类型暂时当作脚本处理: ${config.url}`);
        return this.loadScript(config.url, timeout);
      case 'worker':
        // 对于 Worker 类型，我们暂时跳过
        console.warn(`[ResourceLoader] Worker 类型暂时跳过: ${config.url}`);
        return Promise.resolve();
      default:
        throw new Error(`不支持的资源类型: ${config.type}`);
    }
  }

  /** 加载脚本 */
  private loadScript(url: string, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof document === 'undefined') {
        reject(new Error('Document 不可用'));
        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';

      const timeoutId = setTimeout(() => {
        reject(new Error(`脚本加载超时: ${url}`));
      }, timeout);

      script.onload = () => {
        clearTimeout(timeoutId);
        resolve();
      };

      script.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error(`脚本加载失败: ${url}`));
      };

      document.head.appendChild(script);
    });
  }

  /** 加载样式 */
  private loadStyle(url: string, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof document === 'undefined') {
        reject(new Error('Document 不可用'));
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;

      const timeoutId = setTimeout(() => {
        reject(new Error(`样式加载超时: ${url}`));
      }, timeout);

      link.onload = () => {
        clearTimeout(timeoutId);
        resolve();
      };

      link.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error(`样式加载失败: ${url}`));
      };

      document.head.appendChild(link);
    });
  }

  /** 注释：模块和 Worker 加载方法已移除以避免 Turbopack 静态分析警告 */

  /** 加载依赖 */
  private async loadDependencies(dependencies: string[]): Promise<void> {
    const promises = dependencies.map(dep => this.loadResource(dep));
    await Promise.all(promises);
  }

  /** 更新资源状态 */
  private updateResourceStatus(
    id: string, 
    status: ResourceStatus, 
    updates: Partial<ResourceInfo> = {}
  ): void {
    const resource = this.resources.get(id);
    if (resource) {
      Object.assign(resource, { status, ...updates });
    }
  }

  /** 触发加载完成回调 */
  private triggerLoadedCallbacks(id: string): void {
    const callbacks = this.loadedCallbacks.get(id);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.warn(`[ResourceLoader] 回调执行失败: ${id}`, error);
        }
      });
    }
  }

  /** 延迟函数 */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /** 批量加载资源 */
  async loadResources(ids: string[]): Promise<void> {
    const promises = ids.map(id => this.loadResource(id));
    await Promise.all(promises);
  }

  /** 检查资源状态 */
  getResourceStatus(id: string): ResourceStatus | null {
    return this.resources.get(id)?.status || null;
  }

  /** 检查资源是否已加载 */
  isResourceLoaded(id: string): boolean {
    return this.getResourceStatus(id) === 'loaded';
  }

  /** 监听资源加载完成 */
  onResourceLoaded(id: string, callback: () => void): () => void {
    if (!this.loadedCallbacks.has(id)) {
      this.loadedCallbacks.set(id, new Set());
    }
    
    const callbacks = this.loadedCallbacks.get(id)!;
    callbacks.add(callback);

    // 如果资源已加载，立即触发回调
    if (this.isResourceLoaded(id)) {
      callback();
    }

    // 返回取消监听的函数
    return () => {
      callbacks.delete(callback);
    };
  }

  /** 获取所有资源信息 */
  getAllResources(): ResourceInfo[] {
    return Array.from(this.resources.values());
  }

  /** 获取统计信息 */
  getStats() {
    const resources = this.getAllResources();
    const statusCounts = resources.reduce((acc, resource) => {
      acc[resource.status] = (acc[resource.status] || 0) + 1;
      return acc;
    }, {} as Record<ResourceStatus, number>);

    const totalLoadTime = resources
      .filter(r => r.loadTime)
      .reduce((sum, r) => sum + (r.loadTime || 0), 0);

    return {
      totalResources: resources.length,
      statusCounts,
      totalLoadTime,
      averageLoadTime: resources.length > 0 ? totalLoadTime / resources.length : 0
    };
  }

  /** 清理资源 */
  clearResource(id: string): void {
    this.resources.delete(id);
    this.loadPromises.delete(id);
    this.loadedCallbacks.delete(id);
    console.debug(`[ResourceLoader] 清理资源: ${id}`);
  }

  /** 销毁加载器 */
  destroy(): void {
    this.resources.clear();
    this.loadPromises.clear();
    this.loadedCallbacks.clear();
    console.info('[ResourceLoader] 资源加载器已销毁');
  }
}

// 全局资源加载器实例
let globalResourceLoader: ResourceLoader | null = null;

/** 获取全局资源加载器 */
export function getGlobalResourceLoader(): ResourceLoader {
  if (!globalResourceLoader) {
    globalResourceLoader = new ResourceLoader();
  }
  return globalResourceLoader;
}

/** 销毁全局资源加载器 */
export function destroyGlobalResourceLoader(): void {
  if (globalResourceLoader) {
    globalResourceLoader.destroy();
    globalResourceLoader = null;
  }
}

/**
 * React Hook: 使用资源加载器
 */
export function useResourceLoader(): ResourceLoader {
  const loaderRef = useRef<ResourceLoader | null>(null);

  if (!loaderRef.current) {
    loaderRef.current = new ResourceLoader();
  }

  useEffect(() => {
    return () => {
      if (loaderRef.current) {
        loaderRef.current.destroy();
        loaderRef.current = null;
      }
    };
  }, []);

  return loaderRef.current;
}

/**
 * React Hook: 使用全局资源加载器
 */
export function useGlobalResourceLoader(): ResourceLoader {
  return getGlobalResourceLoader();
}

/**
 * React Hook: 加载资源
 */
export function useLoadResource(id: string, config: ResourceConfig, autoLoad: boolean = true) {
  const loader = useGlobalResourceLoader();
  const [status, setStatus] = useState<ResourceStatus>('pending');

  useEffect(() => {
    loader.registerResource(id, config);
    
    if (autoLoad) {
      loader.loadResource(id).catch(error => {
        console.error(`[useLoadResource] 资源加载失败: ${id}`, error);
      });
    }

    const updateStatus = () => {
      setStatus(loader.getResourceStatus(id) || 'pending');
    };

    const unsubscribe = loader.onResourceLoaded(id, updateStatus);
    updateStatus();

    return unsubscribe;
  }, [id, config, autoLoad, loader]);

  const load = useCallback(() => {
    return loader.loadResource(id);
  }, [id, loader]);

  return { status, load };
}
