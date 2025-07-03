import { modulesService, type CDN } from './modules';
import { VendorCategory } from '@/types';

/** Vendor 配置接口 */
export interface VendorConfig {
  name: string;
  version: string;
  path?: string;
  cdn?: CDN;
  isModule?: boolean;
  external?: string;
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
    isModule: false
  },
  monacoLoader: {
    name: 'monaco-editor',
    version: '0.45.0',
    path: 'min/vs/loader.js',
    cdn: 'unpkg',
    isModule: false
  },
  monacoWorkerMain: {
    name: 'monaco-editor',
    version: '0.45.0',
    path: 'min/vs/base/worker/workerMain.js',
    cdn: 'unpkg',
    isModule: false
  }
};

/** 编译器相关配置 */
const compilerVendors: VendorRegistry = {
  typescript: {
    name: 'typescript',
    version: '5.6.2',
    path: 'lib/typescript.js',
    cdn: 'unpkg',
    isModule: false
  },
  babel: {
    name: '@babel/standalone',
    version: '7.26.4',
    path: 'babel.js',
    cdn: 'jsdelivr',
    isModule: false
  },
  markdownIt: {
    name: 'markdown-it',
    version: '14.1.0',
    cdn: 'esm.sh',
    isModule: true
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
  private readonly modulesService = modulesService;

  /** 构建模块名称 */
  private buildModuleName(config: VendorConfig): string {
    const { name, version, path } = config;
    const baseModule = `${name}@${version}`;
    return path ? `${baseModule}/${path}` : baseModule;
  }

  /** 获取 Vendor URL */
  getVendorUrl(category: VendorCategory, vendorKey: string): string {
    const vendor = allVendors[category]?.[vendorKey];
    if (!vendor) {
      throw new Error(`Vendor not found: ${category}.${vendorKey}`);
    }

    // 如果有 external URL，直接使用
    if (vendor.external) {
      return vendor.external;
    }

    const moduleName = this.buildModuleName(vendor);

    if (vendor.isModule) {
      return this.modulesService.getModuleUrl(moduleName, {
        isModule: true,
        defaultCDN: vendor.cdn,
        external: vendor.external
      });
    } else {
      return this.modulesService.getUrl(moduleName, vendor.cdn);
    }
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
        console.warn(`Failed to get URL for ${category}.${vendorKey}:`, error);
      }
    }

    return result;
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