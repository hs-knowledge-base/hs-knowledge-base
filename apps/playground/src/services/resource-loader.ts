import { Logger } from '../utils/logger';
import { vendorService } from './vendors';
import { VendorCategory } from '@/types';

/**
 * 统一的资源加载器
 * 负责从 CDN 加载各种资源，包括编译器、运行时等
 */
export class ResourceLoader {
  private readonly logger = new Logger('ResourceLoader');
  private loadedResources = new Set<string>();
  private loadingPromises = new Map<string, Promise<void>>();

  /** 加载脚本资源 */
  async loadScript(url: string, id?: string): Promise<void> {
    const resourceId = id || url;
    
    // 如果已经加载过，直接返回
    if (this.loadedResources.has(resourceId)) {
      return;
    }

    // 如果正在加载，等待加载完成
    if (this.loadingPromises.has(resourceId)) {
      return this.loadingPromises.get(resourceId)!;
    }

    // 开始加载
    const loadPromise = this.doLoadScript(url, resourceId);
    this.loadingPromises.set(resourceId, loadPromise);

    try {
      await loadPromise;
      this.loadedResources.add(resourceId);
      this.logger.info(`资源加载成功: ${resourceId}`);
    } catch (error) {
      this.logger.error(`资源加载失败: ${resourceId}`, error);
      throw error;
    } finally {
      this.loadingPromises.delete(resourceId);
    }
  }

  /** 实际加载脚本的方法 */
  private doLoadScript(url: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 检查是否已经存在相同 ID 的脚本
      if (document.querySelector(`script[data-resource-id="${id}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.setAttribute('data-resource-id', id);

      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));

      document.head.appendChild(script);
    });
  }

  /** 加载编译器资源 */
  async loadCompiler(vendorKey: string): Promise<void> {
    try {
      const url = vendorService.getVendorUrl(VendorCategory.COMPILER, vendorKey);
      await this.loadScript(url, `compiler-${vendorKey}`);
    } catch (error) {
      this.logger.error(`编译器加载失败: ${vendorKey}`, error);
      throw error;
    }
  }

  /** 加载运行时资源 */
  async loadRuntime(vendorKey: string): Promise<void> {
    try {
      const url = vendorService.getVendorUrl(VendorCategory.COMPILER, vendorKey);
      await this.loadScript(url, `runtime-${vendorKey}`);
    } catch (error) {
      this.logger.error(`运行时加载失败: ${vendorKey}`, error);
      throw error;
    }
  }

  /** 批量加载资源 */
  async loadResources(resources: Array<{ category: VendorCategory; vendorKey: string; type: 'compiler' | 'runtime' }>): Promise<void> {
    const loadPromises = resources.map(async ({ category, vendorKey, type }) => {
      try {
        const url = vendorService.getVendorUrl(category, vendorKey);
        await this.loadScript(url, `${type}-${vendorKey}`);
      } catch (error) {
        this.logger.error(`资源加载失败: ${type}-${vendorKey}`, error);
        throw error;
      }
    });

    await Promise.all(loadPromises);
  }

  /** 检查资源是否已加载 */
  isLoaded(resourceId: string): boolean {
    return this.loadedResources.has(resourceId);
  }

  /** 检查资源是否正在加载 */
  isLoading(resourceId: string): boolean {
    return this.loadingPromises.has(resourceId);
  }

  /** 获取加载状态 */
  getLoadingStatus(): { loaded: string[]; loading: string[] } {
    return {
      loaded: Array.from(this.loadedResources),
      loading: Array.from(this.loadingPromises.keys())
    };
  }

  /** 清除加载状态 */
  clearLoadingStatus(): void {
    this.loadedResources.clear();
    this.loadingPromises.clear();
  }

  /** 预加载常用资源 */
  async preloadCommonResources(): Promise<void> {
    const commonResources = [
      { category: VendorCategory.COMPILER, vendorKey: 'typescript', type: 'compiler' as const },
      { category: VendorCategory.COMPILER, vendorKey: 'babel', type: 'compiler' as const },
      { category: VendorCategory.COMPILER, vendorKey: 'markdownIt', type: 'compiler' as const }
    ];

    try {
      await this.loadResources(commonResources);
      this.logger.info('常用资源预加载完成');
    } catch (error) {
      this.logger.warn('常用资源预加载失败', error);
    }
  }
}

/** 全局资源加载器实例 */
export const resourceLoader = new ResourceLoader();
