import { Logger } from '../utils/logger';

/**
 * 简单的依赖注入容器
 * 管理服务的注册、解析和生命周期
 */
export class ServiceContainer {
  private readonly logger = new Logger('ServiceContainer');
  private readonly services = new Map<string, any>();
  private readonly factories = new Map<string, () => any>();
  private readonly singletons = new Map<string, any>();

  /** 注册服务实例 */
  register<T>(name: string, instance: T): void {
    this.services.set(name, instance);
    this.logger.debug(`注册服务: ${name}`);
  }

  /** 注册服务工厂 */
  registerFactory<T>(name: string, factory: () => T): void {
    this.factories.set(name, factory);
    this.logger.debug(`注册服务工厂: ${name}`);
  }

  /** 注册单例服务工厂 */
  registerSingleton<T>(name: string, factory: () => T): void {
    this.factories.set(name, factory);
    this.logger.debug(`注册单例服务: ${name}`);
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
      this.logger.debug(`创建服务实例: ${name}`);
      
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

  /** 清除所有服务 */
  clear(): void {
    this.services.clear();
    this.factories.clear();
    this.singletons.clear();
    this.logger.info('服务容器已清空');
  }

  /** 销毁容器 */
  destroy(): void {
    // 销毁所有单例实例
    this.singletons.forEach((instance, name) => {
      if (instance && typeof instance.destroy === 'function') {
        try {
          instance.destroy();
          this.logger.debug(`销毁服务: ${name}`);
        } catch (error) {
          this.logger.warn(`销毁服务失败: ${name}`, error);
        }
      }
    });

    this.clear();
    this.logger.info('服务容器已销毁');
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
