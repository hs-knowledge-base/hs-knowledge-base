import type { VendorCategory } from '@/types';

/**
 * 资源加载器接口
 */
export interface IResourceLoader {
  /** 加载脚本资源 */
  loadScript(url: string, id?: string): Promise<void>;
  
  /** 加载编译器资源 */
  loadCompiler(vendorKey: string): Promise<void>;
  
  /** 加载运行时资源 */
  loadRuntime(vendorKey: string): Promise<void>;
  
  /** 批量加载资源 */
  loadResources(resources: Array<{ category: VendorCategory; vendorKey: string; type: 'compiler' | 'runtime' }>): Promise<void>;
  
  /** 检查资源是否已加载 */
  isLoaded(resourceId: string): boolean;
  
  /** 检查资源是否正在加载 */
  isLoading(resourceId: string): boolean;
  
  /** 获取加载状态 */
  getLoadingStatus(): { loaded: string[]; loading: string[] };
  
  /** 清除加载状态 */
  clearLoadingStatus(): void;
  
  /** 预加载常用资源 */
  preloadCommonResources(): Promise<void>;
}
