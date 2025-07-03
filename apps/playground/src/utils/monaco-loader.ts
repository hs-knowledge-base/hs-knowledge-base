import { vendorService } from '../services/vendors';
import { Logger } from './logger';
import { preloadCommonLanguages } from './monaco-language-loader';
import { VendorCategory } from "@/types";

const logger = new Logger('MonacoLoader');

/** Monaco Editor 全局加载状态 */
let monacoGloballyLoaded = false;
let monacoLoadPromise: Promise<any> | null = null;

/** Monaco Editor 配置 */
const monacoConfig = {
  get baseUrl() {
    return vendorService.getVendorUrl(VendorCategory.MONACO, 'monacoEditor');
  },
  get loaderUrl() {
    return vendorService.getVendorUrl(VendorCategory.MONACO, 'monacoLoader');
  }
};


/** 动态加载 Monaco Editor */
export const loadMonaco = async (): Promise<any> => {
  // 如果已经加载过，直接返回
  if (monacoGloballyLoaded && (window as any).monaco) {
    return (window as any).monaco;
  }

  // 如果正在加载，等待加载完成
  if (monacoLoadPromise) {
    return monacoLoadPromise;
  }

  // 开始加载 Monaco Editor
  monacoLoadPromise = loadMonacoFromCDN();

  try {
    const monaco = await monacoLoadPromise;
    monacoGloballyLoaded = true;
    (window as any).monaco = monaco;

    // 配置 Workers
    configureMonacoWorkers();

    logger.info('Monaco Editor 加载成功');

    // 预加载常用语言
    preloadCommonLanguages().catch(error => {
      logger.warn('预加载常用语言失败', error);
    });

    return monaco;
  } catch (error) {
    logger.error('Monaco Editor 加载失败', error);
    monacoLoadPromise = null;

    // 提供一个简单的错误提示
    showMonacoLoadError(error);

    // 尝试创建一个简单的后备编辑器
    try {
      const fallbackMonaco = createFallbackEditor();
      monacoGloballyLoaded = true;
      (window as any).monaco = fallbackMonaco;
      logger.warn('使用后备编辑器');
      return fallbackMonaco;
    } catch (fallbackError) {
      logger.error('后备编辑器创建失败', fallbackError);
      throw error;
    }
  }
};

/** 显示 Monaco Editor 加载错误 */
const showMonacoLoadError = (error: any): void => {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #dc3545;
    color: white;
    padding: 12px 16px;
    border-radius: 4px;
    z-index: 9999;
    max-width: 400px;
    font-family: Arial, sans-serif;
    font-size: 14px;
  `;
  errorDiv.innerHTML = `
    <strong>Monaco Editor 加载失败</strong><br>
    ${error.message || '网络连接问题，请刷新页面重试'}
    <button onclick="this.parentElement.remove()" style="
      background: none;
      border: none;
      color: white;
      float: right;
      cursor: pointer;
      font-size: 16px;
      margin-left: 8px;
    ">&times;</button>
  `;

  document.body.appendChild(errorDiv);

  // 5秒后自动移除
  setTimeout(() => {
    if (errorDiv.parentElement) {
      errorDiv.remove();
    }
  }, 5000);
};

/** 创建后备编辑器 */
const createFallbackEditor = (): any => {
  logger.warn('创建后备编辑器');

  return {
    editor: {
      create: (container: HTMLElement, options: any) => {
        // 创建一个简单的 textarea 作为后备
        const textarea = document.createElement('textarea');
        textarea.style.cssText = `
          width: 100%;
          height: 100%;
          background: #1e1e1e;
          color: #d4d4d4;
          border: none;
          outline: none;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 14px;
          padding: 10px;
          resize: none;
          tab-size: 2;
        `;

        if (options.model && options.model.getValue) {
          textarea.value = options.model.getValue();
        }

        container.appendChild(textarea);

        // 模拟 Monaco Editor 的 API
        return {
          getValue: () => textarea.value,
          setValue: (value: string) => { textarea.value = value; },
          getModel: () => ({
            getValue: () => textarea.value,
            setValue: (value: string) => { textarea.value = value; },
            getLanguageId: () => 'plaintext',
            dispose: () => {}
          }),
          setModel: (model: any) => {
            if (model && model.getValue) {
              textarea.value = model.getValue();
            }
          },
          onDidChangeModelContent: (callback: Function) => {
            textarea.addEventListener('input', () => callback());
            return { dispose: () => {} };
          },
          layout: () => {},
          dispose: () => {
            if (textarea.parentNode) {
              textarea.parentNode.removeChild(textarea);
            }
          },
          getAction: () => ({ run: () => Promise.resolve() })
        };
      },
      createModel: (content: string, language: string, uri?: any) => ({
        getValue: () => content,
        setValue: (value: string) => { content = value; },
        getLanguageId: () => language,
        dispose: () => {}
      }),
      setTheme: () => {},
      defineTheme: () => {}
    },
    Uri: {
      parse: (path: string) => ({ toString: () => path })
    },
    languages: {
      typescript: {
        typescriptDefaults: {
          setCompilerOptions: () => {},
          setDiagnosticsOptions: () => {}
        },
        javascriptDefaults: {
          setCompilerOptions: () => {},
          setDiagnosticsOptions: () => {}
        }
      }
    }
  };
};

/** 从 CDN 加载 Monaco Editor */
const loadMonacoFromCDN = async (): Promise<any> => {
  // 尝试多个 CDN 源
  const cdnUrls = [
    'https://unpkg.com/monaco-editor@0.41.0/min/vs/loader.js',
    'https://cdn.jsdelivr.net/npm/monaco-editor@0.41.0/min/vs/loader.js',
    'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.41.0/min/vs/loader.min.js'
  ];

  for (let i = 0; i < cdnUrls.length; i++) {
    try {
      logger.info(`尝试从 CDN 加载 Monaco Editor (${i + 1}/${cdnUrls.length}): ${cdnUrls[i]}`);
      return await loadFromUrl(cdnUrls[i]);
    } catch (error) {
      logger.warn(`CDN ${i + 1} 加载失败:`, error);
      if (i === cdnUrls.length - 1) {
        throw new Error('所有 CDN 源都加载失败');
      }
    }
  }
};

/** 从指定 URL 加载 Monaco Editor */
const loadFromUrl = async (loaderUrl: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    // 检查是否已经有 RequireJS
    if ((window as any).require && (window as any).monaco) {
      resolve((window as any).monaco);
      return;
    }

    const script = document.createElement('script');
    script.src = loaderUrl;
    script.async = true;

    script.onload = () => {
      logger.info('RequireJS loader 加载成功');

      // 获取基础 URL
      const baseUrl = loaderUrl.replace('/loader.js', '').replace('/loader.min.js', '');

      // 配置 RequireJS
      (window as any).require.config({
        paths: { "vs": baseUrl }
      });

      // 加载 Monaco Editor
      (window as any).require(["vs/editor/editor.main"], function () {
        logger.info('Monaco Editor 主模块加载成功');

        if ((window as any).monaco && (window as any).monaco.editor) {
          resolve((window as any).monaco);
        } else {
          reject(new Error('Monaco Editor 对象无效'));
        }
      }, function (error: any) {
        logger.error('Monaco Editor 主模块加载失败', error);
        reject(error);
      });
    };

    script.onerror = (error) => {
      logger.error('RequireJS loader 加载失败', error);
      reject(new Error(`RequireJS loader 加载失败: ${loaderUrl}`));
    };

    // 设置超时
    setTimeout(() => {
      if (!script.onload) {
        reject(new Error(`加载超时: ${loaderUrl}`));
      }
    }, 10000);

    document.head.appendChild(script);
  });
};

/** 配置 Monaco Editor Workers */
const configureMonacoWorkers = (): void => {
  if (!(window as any).MonacoEnvironment) {
    (window as any).MonacoEnvironment = {
      getWorkerUrl: function (moduleId: string, label: string) {
        // 使用 unpkg CDN 作为 Worker 的基础 URL
        const baseUrl = 'https://unpkg.com/monaco-editor@0.41.0/min';

        switch (label) {
          case 'json':
            return `${baseUrl}/vs/language/json/json.worker.js`;
          case 'css':
          case 'scss':
          case 'less':
            return `${baseUrl}/vs/language/css/css.worker.js`;
          case 'html':
          case 'handlebars':
          case 'razor':
            return `${baseUrl}/vs/language/html/html.worker.js`;
          case 'typescript':
          case 'javascript':
            return `${baseUrl}/vs/language/typescript/ts.worker.js`;
          default:
            return `${baseUrl}/vs/editor/editor.worker.js`;
        }
      }
    };
    logger.info('Monaco Editor Workers 配置完成');
  }
};

/** 检查 Monaco Editor 是否已加载 */
export const isMonacoLoaded = (): boolean => {
  return monacoGloballyLoaded && !!(window as any).monaco;
};

/** 获取已加载的 Monaco Editor 实例 */
export const getMonaco = (): any | null => {
  return isMonacoLoaded() ? (window as any).monaco : null;
};
