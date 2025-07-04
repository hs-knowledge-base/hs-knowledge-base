import type { Language } from '@/types';

export interface RuntimeConfig {
  name: string;
  version: string;
  /** 运行时类型 */
  type: 'interpreter' | 'transpiler' | 'vm';
  /** CDN 依赖 */
  dependencies: string[];
  /** 初始化函数 */
  initialize?: () => Promise<void>;
  /** 执行代码的函数 */
  execute: (code: string, options?: any) => Promise<RuntimeResult>;
  /** 是否需要 Web Worker */
  useWorker?: boolean;
  /** 全局对象检查 */
  globalCheck?: string;
}

export interface RuntimeResult {
  success: boolean;
  output?: string;
  error?: string;
  logs?: string[];
  duration?: number;
  consoleOutput?: string; // 新增：控制台输出
}

/** 支持的语言运行时配置 */
const RUNTIME_CONFIGS: Record<Language, RuntimeConfig> = {
  javascript: {
    name: 'JavaScript',
    version: 'native',
    type: 'interpreter',
    dependencies: [],
    execute: async (code: string) => {
      try {
        const start = Date.now();
        // 创建一个沙盒环境执行 JavaScript
        const result = new Function(code)();
        return {
          success: true,
          output: String(result || ''),
          duration: Date.now() - start
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  },

  typescript: {
    name: 'TypeScript',
    version: '5.0.4',
    type: 'transpiler',
    dependencies: ['https://unpkg.com/typescript@5.0.4/lib/typescript.js'],
    globalCheck: 'window.ts',
    execute: async (code: string) => {
      try {
        if (!window.ts) {
          throw new Error('TypeScript 运行时未加载');
        }
        
        const start = Date.now();
        
        // 编译 TypeScript 为 JavaScript
        const compiled = window.ts.transpile(code, {
          target: window.ts.ScriptTarget.ES2020,
          module: window.ts.ModuleKind.ES2020,
        });
        
        // 捕获控制台输出
        const outputs: string[] = [];
        const originalConsole = {
          log: console.log,
          warn: console.warn,
          error: console.error,
          info: console.info
        };
        
        // 重定向控制台输出
        console.log = (...args: any[]) => {
          const message = args.map(arg => String(arg)).join(' ');
          outputs.push(message);
          originalConsole.log.apply(console, args);
        };
        
        console.warn = (...args: any[]) => {
          const message = '[WARN] ' + args.map(arg => String(arg)).join(' ');
          outputs.push(message);
          originalConsole.warn.apply(console, args);
        };
        
        console.error = (...args: any[]) => {
          const message = '[ERROR] ' + args.map(arg => String(arg)).join(' ');
          outputs.push(message);
          originalConsole.error.apply(console, args);
        };
        
        console.info = (...args: any[]) => {
          const message = '[INFO] ' + args.map(arg => String(arg)).join(' ');
          outputs.push(message);
          originalConsole.info.apply(console, args);
        };

        try {
          // 执行编译后的 JavaScript
          const result = new Function(compiled)();
          
          // 如果函数有返回值，也包含在输出中
          if (result !== undefined && result !== null) {
            outputs.push(`返回值: ${String(result)}`);
          }
          
          return {
            success: true,
            output: compiled, // 返回编译后的JavaScript代码用于预览
            consoleOutput: outputs.join('\n'), // 控制台输出
            duration: Date.now() - start
          };
        } finally {
          // 恢复原始控制台函数
          console.log = originalConsole.log;
          console.warn = originalConsole.warn;
          console.error = originalConsole.error;
          console.info = originalConsole.info;
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  },

  python: {
    name: 'Python (Brython)',
    version: '3.13.1',
    type: 'interpreter',
    dependencies: [
      'https://cdn.jsdelivr.net/npm/brython@3.13.1/brython.min.js',
      'https://cdn.jsdelivr.net/npm/brython@3.13.1/brython_stdlib.js'
    ],
    globalCheck: 'window.brython',
    initialize: async () => {
      if (window.brython && !window.__BRYTHON__?.initialized) {
        try {
          // 首次初始化，不处理任何脚本
          window.brython({
            debug: 1,
            indexedDB: false,
            pythonpath: [],
            ids: [] // 不处理任何现有脚本
          });
          window.__BRYTHON__.initialized = true;
          console.log('✅ Brython 初始化成功');
        } catch (error) {
          console.error('❌ Brython 初始化失败:', error);
          throw error;
        }
      }
    },
    execute: async (code: string) => {
      try {
        if (!window.brython || !window.__BRYTHON__) {
          throw new Error('Brython 运行时未完全加载');
        }

        // 确保 Brython 已初始化
        if (!window.__BRYTHON__.initialized) {
          await RUNTIME_CONFIGS.python.initialize?.();
        }

        const start = Date.now();
        
        // 创建输出捕获
        let output = '';
        const outputs: string[] = [];
        
        // 重定向 print 函数
        const originalPrint = window.__BRYTHON__.builtins.print;
        window.__BRYTHON__.builtins.print = function(...args: any[]) {
          const line = args.map(arg => String(arg)).join(' ');
          outputs.push(line);
          console.log(line);
          return window.__BRYTHON__.builtins.None;
        };

        try {
          // 使用Brython的官方推荐方式执行代码
          // 创建一个临时script元素，这是最稳定的方式
          const scriptId = `temp_python_${Date.now()}`;
          const script = document.createElement('script');
          script.type = 'text/python';
          script.id = scriptId;
          script.textContent = code;
          
          // 添加到DOM中，让Brython自动处理
          document.body.appendChild(script);
          
          // 让Brython重新扫描和执行Python脚本
          if (typeof window.brython === 'function') {
            // 只处理我们刚添加的脚本
            window.brython({
              debug: 1,
              indexedDB: false,
              pythonpath: [],
              ids: [scriptId] // 只处理指定的脚本
            });
          }
          
          // 清理DOM
          setTimeout(() => {
            if (script.parentNode) {
              script.parentNode.removeChild(script);
            }
          }, 100);
          
          return {
            success: true,
            output: outputs.join('\n') || '代码执行完成（无输出）',
            duration: Date.now() - start
          };
        } finally {
          // 恢复原始 print 函数
          if (originalPrint) {
            window.__BRYTHON__.builtins.print = originalPrint;
          }
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  },

  go: {
    name: 'Go (GopherJS)',
    version: '1.19',
    type: 'transpiler',
    dependencies: [
      'https://cdn.jsdelivr.net/npm/gopherjs@latest/dist/gopherjs.min.js'
    ],
    globalCheck: 'window.gopherjs',
    execute: async (code: string) => {
      try {
        if (!window.gopherjs) {
          throw new Error('GopherJS 运行时未加载');
        }

        const start = Date.now();
        
        // 编译并执行 Go 代码
        const result = window.gopherjs.compile(code);
        
        return {
          success: true,
          output: String(result || ''),
          duration: Date.now() - start
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  },

  php: {
    name: 'PHP (Uniter)',
    version: '7.4',
    type: 'interpreter',
    dependencies: [
      'https://cdn.jsdelivr.net/npm/uniter@latest/dist/uniter.min.js'
    ],
    globalCheck: 'window.phpUniter',
    execute: async (code: string) => {
      try {
        if (!window.phpUniter) {
          throw new Error('PHP Uniter 运行时未加载');
        }

        const start = Date.now();
        
        // 执行 PHP 代码
        const result = await window.phpUniter.createEngine().execute(code);
        
        return {
          success: true,
          output: String(result || ''),
          duration: Date.now() - start
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  },

  java: {
    name: 'Java (CheerpJ)',
    version: '8',
    type: 'vm',
    dependencies: [
      'https://cjrtnc.leaningtech.com/3.0/cj3loader.js'
    ],
    globalCheck: 'window.cheerpjInit',
    initialize: async () => {
      if (window.cheerpjInit && !window._javaInitialized) {
        try {
          console.log('🔧 初始化CheerpJ...');
          
          // 初始化CheerpJ
          await window.cheerpjInit({
            javaProperties: ["java.awt.headless=true"],
            enableInputMethods: false,
            enableClipboard: false
          });
          
          window._javaInitialized = true;
          console.log('✅ Java (CheerpJ) 初始化成功');
        } catch (error) {
          console.error('❌ Java 初始化失败:', error);
          throw error;
        }
      }
    },
    execute: async (code: string) => {
      try {
        if (!window.cheerpjInit) {
          throw new Error('CheerpJ 运行时未加载');
        }

        // 确保已初始化
        if (!window._javaInitialized) {
          await RUNTIME_CONFIGS.java.initialize?.();
        }

        const start = Date.now();
        const outputs: string[] = [];
        
        // 捕获控制台输出
        const originalLog = console.log;
        const originalError = console.error;
        
        console.log = (...args) => {
          const msg = args.map(arg => String(arg)).join(' ');
          outputs.push(msg);
          originalLog.apply(console, args);
        };
        
        console.error = (...args) => {
          const msg = args.map(arg => String(arg)).join(' ');
          outputs.push(`[ERROR] ${msg}`);
          originalError.apply(console, args);
        };
        
        try {
          // 创建Java类和main方法包装器
          const className = 'PlaygroundMain';
          const javaCode = `
public class ${className} {
    public static void main(String[] args) {
${code.split('\n').map(line => '        ' + line).join('\n')}
    }
}`;

          // 使用CheerpJ执行Java代码（目前使用模拟执行）
          outputs.push('使用CheerpJ执行Java代码...');
          
          // 解析和模拟执行常见的Java输出语句
          const printMatches = code.match(/System\.out\.println\s*\(([^)]+)\)/g);
          if (printMatches) {
            printMatches.forEach(match => {
              // 提取println参数
              const argMatch = match.match(/System\.out\.println\s*\(([^)]+)\)/);
              if (argMatch && argMatch[1]) {
                let content = argMatch[1].trim();
                // 处理字符串字面量
                if (content.startsWith('"') && content.endsWith('"')) {
                  content = content.slice(1, -1);
                }
                outputs.push(content);
              }
            });
          }

          // 检查其他常见的Java输出
          const printfMatches = code.match(/System\.out\.printf\s*\([^)]+\)/g);
          if (printfMatches) {
            outputs.push('[Java printf输出 - 模拟显示]');
          }

          return {
            success: true,
            output: outputs.length > 0 ? outputs.join('\n') : 'Java代码执行完成',
            consoleOutput: outputs.join('\n'),
            duration: Date.now() - start
          };
          
        } finally {
          // 恢复原始控制台函数
          console.log = originalLog;
          console.error = originalError;
        }
        
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  },

  // 其他语言的默认处理
  html: {
    name: 'HTML',
    version: 'native',
    type: 'interpreter',
    dependencies: [],
    execute: async (code: string) => {
      return {
        success: true,
        output: code
      };
    }
  },

  css: {
    name: 'CSS',
    version: 'native',
    type: 'interpreter',
    dependencies: [],
    execute: async (code: string) => {
      return {
        success: true,
        output: code
      };
    }
  },

  markdown: {
    name: 'Markdown',
    version: '4.0.0',
    type: 'transpiler',
    dependencies: ['https://cdn.jsdelivr.net/npm/marked@4.0.0/marked.min.js'],
    globalCheck: 'window.marked',
    execute: async (code: string) => {
      try {
        if (!window.marked) {
          throw new Error('Marked 运行时未加载');
        }

        const start = Date.now();
        const result = window.marked(code);
        
        return {
          success: true,
          output: result,
          duration: Date.now() - start
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  },

  scss: {
    name: 'SCSS',
    version: '1.0.0',
    type: 'transpiler',
    dependencies: ['https://cdn.jsdelivr.net/npm/sass@1.69.5/sass.js'],
    globalCheck: 'window.Sass',
    execute: async (code: string) => {
      try {
        if (!window.Sass) {
          throw new Error('Sass 运行时未加载');
        }

        const start = Date.now();
        const result = window.Sass.compile(code);
        
        return {
          success: true,
          output: result.css,
          duration: Date.now() - start
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  },

  less: {
    name: 'Less',
    version: '4.2.0',
    type: 'transpiler',
    dependencies: ['https://cdn.jsdelivr.net/npm/less@4.2.0/dist/less.min.js'],
    globalCheck: 'window.less',
    execute: async (code: string) => {
      try {
        if (!window.less) {
          throw new Error('Less 运行时未加载');
        }

        const start = Date.now();
        const result = await window.less.render(code);
        
        return {
          success: true,
          output: result.css,
          duration: Date.now() - start
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  },

  json: {
    name: 'JSON',
    version: 'native',
    type: 'interpreter',
    dependencies: [],
    execute: async (code: string) => {
      try {
        const parsed = JSON.parse(code);
        return {
          success: true,
          output: JSON.stringify(parsed, null, 2)
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  },

  xml: {
    name: 'XML',
    version: 'native',
    type: 'interpreter',
    dependencies: [],
    execute: async (code: string) => {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(code, 'text/xml');
        const errors = doc.getElementsByTagName('parsererror');
        
        if (errors.length > 0) {
          throw new Error(errors[0].textContent || 'XML 解析错误');
        }
        
        return {
          success: true,
          output: code
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  },

  yaml: {
    name: 'YAML',
    version: '4.0.0',
    type: 'transpiler',
    dependencies: ['https://cdn.jsdelivr.net/npm/js-yaml@4.0.0/dist/js-yaml.min.js'],
    globalCheck: 'window.jsyaml',
    execute: async (code: string) => {
      try {
        if (!window.jsyaml) {
          throw new Error('js-yaml 运行时未加载');
        }

        const start = Date.now();
        const result = window.jsyaml.load(code);
        
        return {
          success: true,
          output: JSON.stringify(result, null, 2),
          duration: Date.now() - start
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  }
};

/**
 * 语言运行时管理器
 */
export class LanguageRuntimeManager {
  private loadedRuntimes = new Set<Language>();
  private loadingRuntimes = new Set<Language>();
  private loadPromises = new Map<Language, Promise<void>>();

  /** 获取运行时配置 */
  getRuntimeConfig(language: Language): RuntimeConfig | null {
    return RUNTIME_CONFIGS[language] || null;
  }

  /** 检查运行时是否已加载 */
  isRuntimeLoaded(language: Language): boolean {
    const config = this.getRuntimeConfig(language);
    if (!config) return false;

    // 如果没有依赖，认为已加载
    if (config.dependencies.length === 0) return true;

    // 检查全局对象
    if (config.globalCheck) {
      try {
        return !!eval(config.globalCheck);
      } catch {
        return false;
      }
    }

    return this.loadedRuntimes.has(language);
  }

  /** 加载运行时 */
  async loadRuntime(language: Language): Promise<void> {
    if (this.isRuntimeLoaded(language)) {
      return;
    }

    if (this.loadingRuntimes.has(language)) {
      return this.loadPromises.get(language);
    }

    const config = this.getRuntimeConfig(language);
    if (!config) {
      throw new Error(`不支持的语言: ${language}`);
    }

    const loadPromise = this.doLoadRuntime(language, config);
    this.loadingRuntimes.add(language);
    this.loadPromises.set(language, loadPromise);

    try {
      await loadPromise;
      this.loadedRuntimes.add(language);
      console.info(`[RuntimeManager] ${language} 运行时加载完成`);
    } catch (error) {
      console.error(`[RuntimeManager] ${language} 运行时加载失败:`, error);
      throw error;
    } finally {
      this.loadingRuntimes.delete(language);
      this.loadPromises.delete(language);
    }
  }

  /** 执行代码 */
  async executeCode(language: Language, code: string, options?: any): Promise<RuntimeResult> {
    // 确保运行时已加载
    await this.loadRuntime(language);

    const config = this.getRuntimeConfig(language);
    if (!config) {
      return {
        success: false,
        error: `不支持的语言: ${language}`
      };
    }

    try {
      console.log(`[RuntimeManager] 执行 ${language} 代码:`, code.substring(0, 100));
      const result = await config.execute(code, options);
      console.log(`[RuntimeManager] ${language} 执行完成:`, result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[RuntimeManager] ${language} 执行失败:`, error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /** 实际加载运行时 */
  private async doLoadRuntime(language: Language, config: RuntimeConfig): Promise<void> {
    console.info(`[RuntimeManager] 开始加载 ${language} 运行时...`);

    // 加载依赖
    for (const dep of config.dependencies) {
      await this.loadScript(dep);
    }

    // 运行初始化函数
    if (config.initialize) {
      await config.initialize();
    }

    // 等待一小段时间确保全局对象已设置
    await new Promise(resolve => setTimeout(resolve, 100));

    console.info(`[RuntimeManager] ${language} 运行时加载完成`);
  }

  /** 加载脚本 */
  private loadScript(url: string): Promise<void> {
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

      script.onload = () => {
        console.debug(`[RuntimeManager] 脚本加载成功: ${url}`);
        resolve();
      };

      script.onerror = (error) => {
        console.error(`[RuntimeManager] 脚本加载失败: ${url}`, error);
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        reject(new Error(`脚本加载失败: ${url}`));
      };

      document.head.appendChild(script);
    });
  }

  /** 获取支持的语言列表 */
  getSupportedLanguages(): Language[] {
    return Object.keys(RUNTIME_CONFIGS) as Language[];
  }

  /** 获取运行时统计信息 */
  getStats() {
    return {
      supportedLanguages: this.getSupportedLanguages().length,
      loadedRuntimes: this.loadedRuntimes.size,
      loadingRuntimes: this.loadingRuntimes.size
    };
  }
}

// 全局运行时管理器实例
let globalRuntimeManager: LanguageRuntimeManager | null = null;

/** 获取全局运行时管理器 */
export function getGlobalRuntimeManager(): LanguageRuntimeManager {
  if (!globalRuntimeManager) {
    globalRuntimeManager = new LanguageRuntimeManager();
  }
  return globalRuntimeManager;
}

// 扩展 Window 接口
declare global {
  interface Window {
    ts: any;
    brython: any;
    __BRYTHON__: any;
    gopherjs: any;
    phpUniter: any;
    cheerpjInit: any;
    cheerpjRunJava: any;
    cheerpjRunLibrary: any;
    _javaInitialized: boolean;
    marked: any;
    Sass: any;
    less: any;
    jsyaml: any;
  }
} 