import { modulesService, type CDN } from './modules';
import { VendorCategory } from '@/types';
import { Logger } from '@/utils/logger';

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
    version: '0.45.0',
    path: 'min',
    cdn: 'unpkg',
    fallbackCdns: ['jsdelivr', 'cdnjs'],
    isModule: false,
    critical: true,
    priority: 1
  },
  monacoLoader: {
    name: 'monaco-editor',
    version: '0.45.0',
    path: 'min/vs/loader.js',
    cdn: 'unpkg',
    fallbackCdns: ['jsdelivr', 'cdnjs'],
    isModule: false,
    critical: true,
    priority: 1
  }
};

/** 编译器相关配置 */
const compilerVendors: VendorRegistry = {
  typescript: {
    name: 'typescript',
    version: '5.6.2',
    path: 'lib/typescript.js',
    cdn: 'unpkg',
    fallbackCdns: ['jsdelivr', 'cdnjs'],
    isModule: false,
    critical: true,
    priority: 1
  },
  babel: {
    name: '@babel/standalone',
    version: '7.26.4',
    path: 'babel.js',
    cdn: 'jsdelivr',
    fallbackCdns: ['unpkg', 'cdnjs'],
    isModule: false,
    critical: true,
    priority: 2
  },
  markdownIt: {
    name: 'markdown-it',
    version: '14.1.0',
    cdn: 'esm.sh',
    fallbackCdns: ['unpkg', 'jsdelivr'],
    isModule: true,
    priority: 3
  },
  postcss: {
    name: 'postcss',
    version: '8.4.47',
    cdn: 'esm.sh',
    isModule: true
  },
  autoprefixer: {
    name: 'autoprefixer',
    version: '10.4.20',
    cdn: 'esm.sh',
    isModule: true
  },
  // Python 运行时 - 使用 Skulpt (更轻量的浏览器 Python)
  skulpt: {
    name: 'skulpt',
    version: '0.11.1',
    path: 'skulpt.min.js',
    cdn: 'jsdelivr',
    isModule: false,
    external: 'https://cdnjs.cloudflare.com/ajax/libs/skulpt/0.11.1/skulpt.min.js'
  },
  skulptStdlib: {
    name: 'skulpt-stdlib',
    version: '0.11.1',
    path: 'skulpt-stdlib.js',
    cdn: 'jsdelivr',
    isModule: false,
    external: 'https://cdnjs.cloudflare.com/ajax/libs/skulpt/0.11.1/skulpt-stdlib.js'
  },
  // WebAssembly 相关
  wabt: {
    name: 'wabt',
    version: '1.0.36',
    cdn: 'esm.sh',
    isModule: true
  },
  // 代码格式化
  jsBeautify: {
    name: 'js-beautify',
    version: '1.15.1',
    cdn: 'esm.sh',
    isModule: true
  }
};
/** 工具库相关配置 */
const toolVendors: VendorRegistry = {
  prettier: {
    name: 'prettier',
    version: '3.3.3',
    cdn: 'esm.sh',
    isModule: true
  },
  prettierParserBabel: {
    name: 'prettier',
    version: '3.3.3',
    path: 'plugins/babel',
    cdn: 'esm.sh',
    isModule: true
  },
  prettierParserTypescript: {
    name: 'prettier',
    version: '3.3.3',
    path: 'plugins/typescript',
    cdn: 'esm.sh',
    isModule: true
  },
  prettierParserHtml: {
    name: 'prettier',
    version: '3.3.3',
    path: 'plugins/html',
    cdn: 'esm.sh',
    isModule: true
  },
  prettierParserCss: {
    name: 'prettier',
    version: '3.3.3',
    path: 'plugins/postcss',
    cdn: 'esm.sh',
    isModule: true
  },
  // ESLint 相关
  eslint: {
    name: 'eslint',
    version: '9.17.0',
    cdn: 'esm.sh',
    isModule: true
  },
  // 代码压缩
  terser: {
    name: 'terser',
    version: '5.36.0',
    cdn: 'esm.sh',
    isModule: true
  },
  // 代码分析
  acorn: {
    name: 'acorn',
    version: '8.14.0',
    cdn: 'esm.sh',
    isModule: true
  },
  // 代码转换
  esbuild: {
    name: 'esbuild-wasm',
    version: '0.24.2',
    cdn: 'esm.sh',
    isModule: true
  }
};

/** 测试框架相关配置 */
const testVendors: VendorRegistry = {
  jest: {
    name: 'jest',
    version: '29.7.0',
    cdn: 'esm.sh',
    isModule: true
  },
  vitest: {
    name: 'vitest',
    version: '2.1.8',
    cdn: 'esm.sh',
    isModule: true
  }
};

/** 框架相关配置 */
const frameworkVendors: VendorRegistry = {
  react: {
    name: 'react',
    version: '18.3.1',
    cdn: 'esm.sh',
    isModule: true
  },
  reactDom: {
    name: 'react-dom',
    version: '18.3.1',
    cdn: 'esm.sh',
    isModule: true
  },
  vue: {
    name: 'vue',
    version: '3.5.13',
    cdn: 'esm.sh',
    isModule: true
  },
  vueCompilerSfc: {
    name: '@vue/compiler-sfc',
    version: '3.5.13',
    cdn: 'esm.sh',
    isModule: true
  },
  // Svelte
  svelte: {
    name: 'svelte',
    version: '5.15.0',
    path: 'compiler.mjs',
    cdn: 'esm.sh',
    isModule: true
  },
  // Angular
  angular: {
    name: '@angular/core',
    version: '19.0.5',
    cdn: 'esm.sh',
    isModule: true
  },
  // Solid.js
  solid: {
    name: 'solid-js',
    version: '1.9.3',
    cdn: 'esm.sh',
    isModule: true
  },
  // Preact
  preact: {
    name: 'preact',
    version: '10.25.1',
    cdn: 'esm.sh',
    isModule: true
  },
  // Lit
  lit: {
    name: 'lit',
    version: '3.2.1',
    cdn: 'esm.sh',
    isModule: true
  }
};

/** 样式处理相关配置 */
const styleVendors: VendorRegistry = {
  sass: {
    name: 'sass',
    version: '1.82.0',
    cdn: 'esm.sh',
    isModule: true
  },
  less: {
    name: 'less',
    version: '4.2.1',
    cdn: 'esm.sh',
    isModule: true
  },
  stylus: {
    name: 'stylus',
    version: '0.63.0',
    cdn: 'esm.sh',
    isModule: true
  }
};
/** 模板引擎相关配置 */
const templateVendors: VendorRegistry = {
  handlebars: {
    name: 'handlebars',
    version: '4.7.8',
    cdn: 'esm.sh',
    isModule: true
  },
  mustache: {
    name: 'mustache',
    version: '4.2.0',
    cdn: 'esm.sh',
    isModule: true
  },
  pug: {
    name: 'pug',
    version: '3.0.3',
    cdn: 'esm.sh',
    isModule: true
  }
};

/** 图表库相关配置 */
const chartVendors: VendorRegistry = {
  chartJs: {
    name: 'chart.js',
    version: '4.4.7',
    cdn: 'esm.sh',
    isModule: true
  },
  d3: {
    name: 'd3',
    version: '7.9.0',
    cdn: 'esm.sh',
    isModule: true
  },
  echarts: {
    name: 'echarts',
    version: '5.5.1',
    cdn: 'esm.sh',
    isModule: true
  }
};

/** 动画库相关配置 */
const animationVendors: VendorRegistry = {
  gsap: {
    name: 'gsap',
    version: '3.12.8',
    cdn: 'esm.sh',
    isModule: true
  },
  animejs: {
    name: 'animejs',
    version: '3.2.2',
    cdn: 'esm.sh',
    isModule: true
  }
};

/** 工具函数相关配置 */
const utilityVendors: VendorRegistry = {
  lodash: {
    name: 'lodash',
    version: '4.17.21',
    cdn: 'esm.sh',
    isModule: true
  },
  axios: {
    name: 'axios',
    version: '1.7.9',
    cdn: 'esm.sh',
    isModule: true
  },
  dayjs: {
    name: 'dayjs',
    version: '1.11.13',
    cdn: 'esm.sh',
    isModule: true
  },
  moment: {
    name: 'moment',
    version: '2.30.1',
    cdn: 'esm.sh',
    isModule: true
  },
  uuid: {
    name: 'uuid',
    version: '11.0.3',
    cdn: 'esm.sh',
    isModule: true
  },
  validator: {
    name: 'validator',
    version: '13.12.0',
    cdn: 'esm.sh',
    isModule: true
  }
};

/** 所有 Vendor 注册表 */
const allVendors: Record<VendorCategory, VendorRegistry> = {
  [VendorCategory.MONACO]: monacoVendors,
  [VendorCategory.COMPILER]: compilerVendors,
  [VendorCategory.TOOL]: toolVendors,
  [VendorCategory.TEST]: testVendors,
  [VendorCategory.FRAMEWORK]: frameworkVendors,
  [VendorCategory.STYLE]: styleVendors,
  [VendorCategory.TEMPLATE]: templateVendors,
  [VendorCategory.CHART]: chartVendors,
  [VendorCategory.ANIMATION]: animationVendors,
  [VendorCategory.UTILITY]: utilityVendors
};

/** Vendor 服务类 */
class VendorService {
  private readonly logger = new Logger('VendorService');
  private readonly modulesService = modulesService;
  private readonly urlCache = new Map<string, string>();
  private readonly failedCdns = new Set<string>();
  private readonly cdnPerformance = new Map<string, number>();

  constructor() {
    this.initializeCdnPerformance();
  }

  /** 初始化 CDN 性能统计 */
  private initializeCdnPerformance(): void {
    // 初始化 CDN 性能评分（可以根据实际测试结果调整）
    this.cdnPerformance.set('unpkg', 90);
    this.cdnPerformance.set('jsdelivr', 95);
    this.cdnPerformance.set('cdnjs', 85);
    this.cdnPerformance.set('esm.sh', 80);
  }

  /** 构建模块名称 */
  private buildModuleName(config: VendorConfig): string {
    const { name, version, path } = config;
    const baseModule = `${name}@${version}`;
    return path ? `${baseModule}/${path}` : baseModule;
  }

  /** 智能选择最佳 CDN */
  private selectBestCdn(config: VendorConfig): CDN {
    const availableCdns = [config.cdn, ...(config.fallbackCdns || [])].filter(Boolean) as CDN[];

    // 过滤掉已知失败的 CDN
    const workingCdns = availableCdns.filter(cdn => !this.failedCdns.has(cdn));

    if (workingCdns.length === 0) {
      this.logger.warn('所有 CDN 都不可用，使用默认 CDN');
      return config.cdn || 'unpkg';
    }

    // 根据性能评分选择最佳 CDN
    const bestCdn = workingCdns.reduce((best, current) => {
      const bestScore = this.cdnPerformance.get(best) || 0;
      const currentScore = this.cdnPerformance.get(current) || 0;
      return currentScore > bestScore ? current : best;
    });

    return bestCdn;
  }

  /** 获取 Vendor URL（带缓存和智能 CDN 选择） */
  getVendorUrl(category: VendorCategory, vendorKey: string): string {
    const cacheKey = `${category}.${vendorKey}`;

    // 检查缓存
    if (this.urlCache.has(cacheKey)) {
      return this.urlCache.get(cacheKey)!;
    }

    const vendor = allVendors[category]?.[vendorKey];
    if (!vendor) {
      throw new Error(`Vendor not found: ${category}.${vendorKey}`);
    }

    let url: string;

    // 如果有 external URL，直接使用
    if (vendor.external) {
      url = vendor.external;
    } else {
      const moduleName = this.buildModuleName(vendor);
      const bestCdn = this.selectBestCdn(vendor);

      if (vendor.isModule) {
        url = this.modulesService.getModuleUrl(moduleName, {
          isModule: true,
          defaultCDN: bestCdn,
          external: vendor.external
        });
      } else {
        url = this.modulesService.getUrl(moduleName, bestCdn);
      }
    }

    // 缓存结果
    this.urlCache.set(cacheKey, url);
    this.logger.debug(`生成 URL: ${cacheKey} -> ${url}`);

    return url;
  }

  /** 获取带回退的 Vendor URL 列表 */
  getVendorUrlsWithFallback(category: VendorCategory, vendorKey: string): string[] {
    const vendor = allVendors[category]?.[vendorKey];
    if (!vendor) {
      throw new Error(`Vendor not found: ${category}.${vendorKey}`);
    }

    const urls: string[] = [];
    const moduleName = this.buildModuleName(vendor);

    // 如果有 external URL，优先使用
    if (vendor.external) {
      urls.push(vendor.external);
    }

    // 生成所有可能的 CDN URL
    const allCdns = [vendor.cdn, ...(vendor.fallbackCdns || [])].filter(Boolean) as CDN[];

    for (const cdn of allCdns) {
      try {
        const url = vendor.isModule
          ? this.modulesService.getModuleUrl(moduleName, { isModule: true, defaultCDN: cdn })
          : this.modulesService.getUrl(moduleName, cdn);

        if (!urls.includes(url)) {
          urls.push(url);
        }
      } catch (error) {
        this.logger.warn(`生成 ${cdn} URL 失败: ${vendorKey}`, error);
      }
    }

    return urls;
  }

  /** 获取指定类别的所有 Vendor */
  getVendorsByCategory(category: VendorCategory): VendorRegistry {
    return allVendors[category] || {};
  }

  /** 获取所有 Vendor 类别 */
  getAllCategories(): VendorCategory[] {
    return Object.values(VendorCategory);
  }

  /** 检查 Vendor 是否存在 */
  hasVendor(category: VendorCategory, vendorKey: string): boolean {
    return !!(allVendors[category]?.[vendorKey]);
  }

  /** 添加新的 Vendor */
  addVendor(category: VendorCategory, vendorKey: string, config: VendorConfig): void {
    if (!allVendors[category]) {
      allVendors[category] = {};
    }
    allVendors[category][vendorKey] = config;
  }

  /** 更新 Vendor 配置 */
  updateVendor(category: VendorCategory, vendorKey: string, config: Partial<VendorConfig>): void {
    const vendor = allVendors[category]?.[vendorKey];
    if (!vendor) {
      throw new Error(`Vendor not found: ${category}.${vendorKey}`);
    }
    allVendors[category][vendorKey] = { ...vendor, ...config };
  }

  /** 删除 Vendor */
  removeVendor(category: VendorCategory, vendorKey: string): void {
    if (allVendors[category]?.[vendorKey]) {
      delete allVendors[category][vendorKey];
    }
  }

  /** 批量获取 Vendor URLs */
  getVendorUrls(requests: Array<{ category: VendorCategory; vendorKey: string }>): Record<string, string> {
    const result: Record<string, string> = {};

    for (const { category, vendorKey } of requests) {
      try {
        const key = `${category}.${vendorKey}`;
        result[key] = this.getVendorUrl(category, vendorKey);
      } catch (error) {
        this.logger.warn(`获取 URL 失败: ${category}.${vendorKey}`, error);
      }
    }

    return result;
  }

  /** 标记 CDN 为失败状态 */
  markCdnAsFailed(cdn: CDN): void {
    this.failedCdns.add(cdn);
    this.logger.warn(`CDN 标记为失败: ${cdn}`);
  }

  /** 重置 CDN 失败状态 */
  resetCdnFailures(): void {
    this.failedCdns.clear();
    this.logger.info('CDN 失败状态已重置');
  }

  /** 更新 CDN 性能评分 */
  updateCdnPerformance(cdn: CDN, score: number): void {
    this.cdnPerformance.set(cdn, score);
    this.logger.debug(`CDN 性能评分更新: ${cdn} = ${score}`);
  }

  /** 获取 CDN 性能统计 */
  getCdnPerformanceStats(): Record<string, number> {
    return Object.fromEntries(this.cdnPerformance);
  }

  /** 清除 URL 缓存 */
  clearUrlCache(): void {
    this.urlCache.clear();
    this.logger.info('URL 缓存已清除');
  }

  /** 获取缓存统计 */
  getCacheStats() {
    return {
      urlCacheSize: this.urlCache.size,
      failedCdnsCount: this.failedCdns.size,
      cdnPerformanceEntries: this.cdnPerformance.size,
      failedCdns: Array.from(this.failedCdns),
      cachedUrls: Array.from(this.urlCache.keys())
    };
  }

  /** 预热缓存 */
  async preloadCriticalResources(): Promise<void> {
    this.logger.info('开始预热关键资源缓存...');

    const criticalResources = [
      { category: VendorCategory.MONACO, vendorKey: 'monacoLoader' },
      { category: VendorCategory.COMPILER, vendorKey: 'typescript' },
      { category: VendorCategory.COMPILER, vendorKey: 'babel' }
    ];

    for (const { category, vendorKey } of criticalResources) {
      try {
        this.getVendorUrl(category, vendorKey);
      } catch (error) {
        this.logger.warn(`预热资源失败: ${category}.${vendorKey}`, error);
      }
    }

    this.logger.info('关键资源缓存预热完成');
  }
}
/** Vendor 服务实例 */
export const vendorService = new VendorService();

/** 便捷方法：获取 Monaco Editor 相关 URLs */
export const getMonacoUrls = () => ({
  baseUrl: vendorService.getVendorUrl(VendorCategory.MONACO, 'monacoEditor'),
  loaderUrl: vendorService.getVendorUrl(VendorCategory.MONACO, 'monacoLoader'),
  workerMainUrl: vendorService.getVendorUrl(VendorCategory.MONACO, 'monacoWorkerMain')
});

/** 便捷方法：获取编译器相关 URLs */
export const getCompilerUrls = () => ({
  typescriptUrl: vendorService.getVendorUrl(VendorCategory.COMPILER, 'typescript'),
  babelUrl: vendorService.getVendorUrl(VendorCategory.COMPILER, 'babel'),
  markdownItUrl: vendorService.getVendorUrl(VendorCategory.COMPILER, 'markdownIt'),
  postcssUrl: vendorService.getVendorUrl(VendorCategory.COMPILER, 'postcss'),
  autoprefixerUrl: vendorService.getVendorUrl(VendorCategory.COMPILER, 'autoprefixer')
});