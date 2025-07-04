import { useRef, useEffect } from 'react';
import type { CDNConfig } from '@/types';
import { CDN_CONFIGS } from '@/constants';

/** CDN 类型定义 */
export type CDN = 'jsdelivr' | 'unpkg' | 'esm.sh' | 'skypack' | 'cdnjs';

/** Vendor 配置接口 */
export interface VendorConfig {
  name: string;
  version: string;
  path?: string;
  cdn?: CDN;
  isModule?: boolean;
  external?: string;
  /** 备用 CDN 列表 */
  fallbackCdns?: CDN[];
  /** 优先级（数字越小优先级越高） */
  priority?: number;
  /** 是否为关键资源 */
  critical?: boolean;
}

/** Vendor 注册表接口 */
export interface VendorRegistry {
  [key: string]: VendorConfig;
}

/** Monaco Editor 相关配置 */
const monacoVendors: VendorRegistry = {
  monacoEditor: {
    name: 'monaco-editor',
    version: '0.41.0',
    path: 'min',
    cdn: 'unpkg',
    fallbackCdns: ['jsdelivr'],
    isModule: false,
    critical: true,
    priority: 1
  },
  monacoLoader: {
    name: 'monaco-editor',
    version: '0.41.0',
    path: 'min/vs/loader.js',
    cdn: 'unpkg',
    fallbackCdns: ['jsdelivr'],
    isModule: false,
    critical: true,
    priority: 1,
    external: 'https://unpkg.com/monaco-editor@0.41.0/min/vs/loader.js'
  }
};

/** 编译器相关配置 */
const compilerVendors: VendorRegistry = {
  typescript: {
    name: 'typescript',
    version: '5.0.4',
    path: 'lib/typescript.js',
    cdn: 'unpkg',
    fallbackCdns: ['jsdelivr'],
    isModule: false,
    critical: true,
    priority: 1,
    external: 'https://unpkg.com/typescript@5.0.4/lib/typescript.js'
  },
  babel: {
    name: '@babel/standalone',
    version: '7.23.0',
    path: 'babel.js',
    cdn: 'unpkg',
    fallbackCdns: ['jsdelivr'],
    isModule: false,
    critical: true,
    priority: 2,
    external: 'https://unpkg.com/@babel/standalone@7.23.0/babel.js'
  },
  marked: {
    name: 'marked',
    version: '9.1.6',
    cdn: 'jsdelivr',
    fallbackCdns: ['unpkg'],
    isModule: false,
    priority: 3,
    external: 'https://cdn.jsdelivr.net/npm/marked@9.1.6/marked.min.js'
  },
  sass: {
    name: 'sass',
    version: '1.69.5',
    path: 'sass.js',
    cdn: 'jsdelivr',
    fallbackCdns: ['unpkg'],
    isModule: false,
    priority: 3,
    external: 'https://cdn.jsdelivr.net/npm/sass@1.69.5/sass.js'
  },
  less: {
    name: 'less',
    version: '4.2.0',
    path: 'dist/less.min.js',
    cdn: 'jsdelivr',
    fallbackCdns: ['unpkg'],
    isModule: false,
    priority: 3,
    external: 'https://cdn.jsdelivr.net/npm/less@4.2.0/dist/less.min.js'
  }
};

/** 运行时相关配置 */
const runtimeVendors: VendorRegistry = {
  brython: {
    name: 'brython',
    version: '3.13.1',
    path: 'brython.min.js',
    cdn: 'jsdelivr',
    fallbackCdns: ['unpkg'],
    isModule: false,
    priority: 3,
    external: 'https://cdn.jsdelivr.net/npm/brython@3.13.1/brython.min.js'
  },
  brythonStdlib: {
    name: 'brython',
    version: '3.13.1',
    path: 'brython_stdlib.js',
    cdn: 'jsdelivr',
    fallbackCdns: ['unpkg'],
    isModule: false,
    priority: 3,
    external: 'https://cdn.jsdelivr.net/npm/brython@3.13.1/brython_stdlib.js'
  },
  gopherjs: {
    name: 'gopherjs',
    version: '1.18.1',
    path: 'dist/gopherjs.min.js',
    cdn: 'jsdelivr',
    fallbackCdns: ['unpkg'],
    isModule: false,
    priority: 3,
    external: 'https://cdn.jsdelivr.net/npm/gopherjs@1.18.1/dist/gopherjs.min.js'
  },
  uniter: {
    name: 'uniter',
    version: '2.18.0',
    path: 'dist/uniter.min.js',
    cdn: 'jsdelivr',
    fallbackCdns: ['unpkg'],
    isModule: false,
    priority: 3,
    external: 'https://cdn.jsdelivr.net/npm/uniter@2.18.0/dist/uniter.min.js'
  },
  doppio: {
    name: 'doppio-jvm',
    version: '0.5.1',
    path: 'dist/doppio.min.js',
    cdn: 'jsdelivr',
    fallbackCdns: ['unpkg'],
    isModule: false,
    priority: 3,
    external: 'https://cdn.jsdelivr.net/npm/doppio-jvm@0.5.1/dist/doppio.min.js'
  }
};

/** 样式处理器相关配置 */
const styleVendors: VendorRegistry = {
  postcss: {
    name: 'postcss',
    version: '8.4.47',
    cdn: 'esm.sh',
    isModule: true,
    external: 'https://esm.sh/postcss@8.4.47'
  },
  autoprefixer: {
    name: 'autoprefixer',
    version: '10.4.20',
    cdn: 'esm.sh',
    isModule: true,
    external: 'https://esm.sh/autoprefixer@10.4.20'
  }
};

/** 所有 Vendor 配置 */
const allVendors: VendorRegistry = {
  ...monacoVendors,
  ...compilerVendors,
  ...runtimeVendors,
  ...styleVendors
};

/**
 * Vendor 服务类 - React 适配版本
 */
export class VendorService {
  private readonly loadedVendors = new Set<string>();
  private readonly loadingVendors = new Set<string>();
  private readonly loadPromises = new Map<string, Promise<void>>();
  private readonly vendorRegistry: VendorRegistry;

  constructor(customVendors: VendorRegistry = {}) {
    this.vendorRegistry = { ...allVendors, ...customVendors };
    console.info('[VendorService] Vendor 服务初始化完成');
  }

  /** 根据 CDN 类型获取 URL */
  private getCdnUrl(moduleName: string, isModule: boolean = false, cdn: CDN = 'jsdelivr'): string {
    const baseUrls = {
      jsdelivr: isModule ? 'https://esm.sh' : 'https://cdn.jsdelivr.net/npm',
      unpkg: 'https://unpkg.com',
      'esm.sh': 'https://esm.sh',
      skypack: 'https://cdn.skypack.dev',
      cdnjs: 'https://cdnjs.cloudflare.com/ajax/libs'
    };

    const baseUrl = baseUrls[cdn];
    if (!baseUrl) {
      throw new Error(`不支持的 CDN: ${cdn}`);
    }

    if (cdn === 'cdnjs') {
      // CDNJS 需要特殊处理
      return `${baseUrl}/${moduleName}`;
    }

    return `${baseUrl}/${moduleName}`;
  }

  /** 获取 Vendor URL */
  getVendorUrl(vendorKey: string): string {
    const config = this.vendorRegistry[vendorKey];
    if (!config) {
      throw new Error(`Vendor 未找到: ${vendorKey}`);
    }

    // 如果有外部 URL，直接使用
    if (config.external) {
      return config.external;
    }

    // 构建 CDN URL
    const moduleName = config.path 
      ? `${config.name}@${config.version}/${config.path}`
      : `${config.name}@${config.version}`;

    return this.getCdnUrl(moduleName, config.isModule, config.cdn);
  }

  /** 加载 Vendor */
  async loadVendor(vendorKey: string): Promise<void> {
    if (this.loadedVendors.has(vendorKey)) {
      return;
    }

    if (this.loadingVendors.has(vendorKey)) {
      return this.loadPromises.get(vendorKey);
    }

    const config = this.vendorRegistry[vendorKey];
    if (!config) {
      throw new Error(`Vendor 未找到: ${vendorKey}`);
    }

    this.loadingVendors.add(vendorKey);

    const loadPromise = this.loadVendorScript(vendorKey, config);
    this.loadPromises.set(vendorKey, loadPromise);

    try {
      await loadPromise;
      this.loadedVendors.add(vendorKey);
      console.info(`[VendorService] Vendor 加载成功: ${vendorKey}`);
    } catch (error) {
      console.error(`[VendorService] Vendor 加载失败: ${vendorKey}`, error);
      throw error;
    } finally {
      this.loadingVendors.delete(vendorKey);
      this.loadPromises.delete(vendorKey);
    }
  }

  /** 加载 Vendor 脚本 */
  private async loadVendorScript(vendorKey: string, config: VendorConfig): Promise<void> {
    const urls = [config.cdn, ...(config.fallbackCdns || [])].map(cdn => {
      try {
        return this.getCdnUrl(
          config.path ? `${config.name}@${config.version}/${config.path}` : `${config.name}@${config.version}`,
          config.isModule,
          cdn
        );
      } catch {
        return config.external || '';
      }
    }).filter(Boolean);

    if (config.external) {
      urls.unshift(config.external);
    }

    let lastError: Error | null = null;

    for (const url of urls) {
      try {
        console.info(`[VendorService] 尝试加载 ${vendorKey} 从: ${url}`);
        await this.loadScript(url, config.isModule);
        console.info(`[VendorService] ${vendorKey} 加载成功`);
        
        // 对于 TypeScript，验证是否正确加载
        if (vendorKey === 'typescript') {
          await this.verifyTypeScriptLoaded();
        }
        
        return;
      } catch (error) {
        lastError = error as Error;
        console.warn(`[VendorService] 从 ${url} 加载 ${vendorKey} 失败:`, error);
      }
    }

    throw new Error(`所有 CDN 都加载失败，${vendorKey}: ${lastError?.message}`);
  }

  /** 验证 TypeScript 是否正确加载 */
  private async verifyTypeScriptLoaded(): Promise<void> {
    let retries = 50; // 最多等待 5 秒
    while (retries > 0) {
      if (typeof window !== 'undefined' && window.ts && typeof window.ts.transpile === 'function') {
        console.info('[VendorService] TypeScript 验证通过');
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
      retries--;
    }
    throw new Error('TypeScript 加载验证失败');
  }

  /** 加载脚本 */
  private loadScript(url: string, isModule: boolean = false): Promise<void> {
    return new Promise((resolve, reject) => {
      // 检查是否已经存在相同的脚本
      const existingScript = document.querySelector(`script[src="${url}"]`);
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.async = true;

      if (isModule) {
        script.type = 'module';
      }

      script.onload = () => {
        console.debug(`[VendorService] 脚本加载成功: ${url}`);
        resolve();
      };

      script.onerror = (error) => {
        console.error(`[VendorService] 脚本加载失败: ${url}`, error);
        // 清理失败的脚本元素
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        reject(new Error(`脚本加载失败: ${url}`));
      };

      document.head.appendChild(script);
    });
  }

  /** 批量加载 Vendors */
  async loadVendors(vendorKeys: string[]): Promise<void> {
    const promises = vendorKeys.map(key => this.loadVendor(key));
    await Promise.all(promises);
  }

  /** 检查 Vendor 是否已加载 */
  isVendorLoaded(vendorKey: string): boolean {
    return this.loadedVendors.has(vendorKey);
  }

  /** 检查 Vendor 是否正在加载 */
  isVendorLoading(vendorKey: string): boolean {
    return this.loadingVendors.has(vendorKey);
  }

  /** 获取所有已注册的 Vendors */
  getRegisteredVendors(): string[] {
    return Object.keys(this.vendorRegistry);
  }

  /** 获取关键 Vendors */
  getCriticalVendors(): string[] {
    return Object.entries(this.vendorRegistry)
      .filter(([, config]) => config.critical)
      .sort(([, a], [, b]) => (a.priority || 999) - (b.priority || 999))
      .map(([key]) => key);
  }

  /** 注册新的 Vendor */
  registerVendor(key: string, config: VendorConfig): void {
    this.vendorRegistry[key] = config;
    console.info(`[VendorService] 注册新 Vendor: ${key}`);
  }

  /** 获取统计信息 */
  getStats() {
    return {
      totalVendors: Object.keys(this.vendorRegistry).length,
      loadedVendors: this.loadedVendors.size,
      loadingVendors: this.loadingVendors.size,
      criticalVendors: this.getCriticalVendors().length
    };
  }

  /** 销毁服务 */
  destroy(): void {
    this.loadedVendors.clear();
    this.loadingVendors.clear();
    this.loadPromises.clear();
    console.info('[VendorService] Vendor 服务已销毁');
  }
}

// 全局 Vendor 服务实例
let globalVendorService: VendorService | null = null;

/** 获取全局 Vendor 服务 */
export function getGlobalVendorService(): VendorService {
  if (!globalVendorService) {
    globalVendorService = new VendorService();
  }
  return globalVendorService;
}

/** 销毁全局 Vendor 服务 */
export function destroyGlobalVendorService(): void {
  if (globalVendorService) {
    globalVendorService.destroy();
    globalVendorService = null;
  }
}

/**
 * React Hook: 使用 Vendor 服务
 */
export function useVendorService(customVendors?: VendorRegistry): VendorService {
  const serviceRef = useRef<VendorService | null>(null);

  if (!serviceRef.current) {
    serviceRef.current = new VendorService(customVendors);
  }

  useEffect(() => {
    return () => {
      if (serviceRef.current) {
        serviceRef.current.destroy();
        serviceRef.current = null;
      }
    };
  }, []);

  return serviceRef.current;
}

/**
 * React Hook: 使用全局 Vendor 服务
 */
export function useGlobalVendorService(): VendorService {
  return getGlobalVendorService();
}
