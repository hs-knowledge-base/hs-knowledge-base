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
    throw error;
  }
};

/** 从 CDN 加载 Monaco Editor */
const loadMonacoFromCDN = async (): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      // 动态加载 RequireJS loader
      const script = document.createElement('script');
      script.src = monacoConfig.loaderUrl;
      script.async = true;

      script.onload = () => {
        logger.info('RequireJS loader 加载成功');

        // 配置 RequireJS
        (window as any).require.config({
          paths: { "vs": monacoConfig.baseUrl + '/vs' }
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
        reject(new Error('RequireJS loader 加载失败'));
      };

      document.head.appendChild(script);
    } catch (error) {
      logger.error('Monaco Editor CDN 加载初始化失败', error);
      reject(error);
    }
  });
};

/** 配置 Monaco Editor Workers */
const configureMonacoWorkers = (): void => {
  if (!(window as any).MonacoEnvironment) {
    (window as any).MonacoEnvironment = {
      getWorkerUrl: function (moduleId: string, label: string) {
        const baseUrl = monacoConfig.baseUrl;

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
