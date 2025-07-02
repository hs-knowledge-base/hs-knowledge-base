import { monacoBaseUrl, monacoLoaderUrl, monacoWorkerMainUrl } from '../services/vendors';
import { Logger } from './logger';
import { preloadCommonLanguages } from './monaco-language-loader';

const logger = new Logger('MonacoLoader');

/** Monaco Editor 全局加载状态 */
let monacoGloballyLoaded = false;
let monacoLoadPromise: Promise<typeof import('monaco-editor')> | null = null;

/** 配置 Monaco Environment */
const configureMonacoEnvironment = (): void => {
  // 使用 data URL 代理 Worker，避免跨域问题
  (window as any).MonacoEnvironment = {
    getWorkerUrl: function(workerId: string, label: string): string {
      return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
        self.MonacoEnvironment = { baseUrl: "${monacoBaseUrl}" };
        importScripts("${monacoWorkerMainUrl}");
      `)}`;
    }
  };

  logger.info('Monaco Environment 配置完成（AMD + data URL 模式）');
};

/** 动态加载 Monaco Editor */
export const loadMonaco = async (): Promise<typeof import('monaco-editor')> => {
  // 如果已经加载过，直接返回
  if (monacoGloballyLoaded && (window as any).monaco) {
    return (window as any).monaco;
  }

  // 如果正在加载，等待加载完成
  if (monacoLoadPromise) {
    return monacoLoadPromise;
  }

  // 开始加载 Monaco Editor
  monacoLoadPromise = loadMonacoAMD();

  try {
    const monaco = await monacoLoadPromise;
    monacoGloballyLoaded = true;
    (window as any).monaco = monaco;
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

/** 使用 AMD 方式加载 Monaco Editor */
const loadMonacoAMD = async (): Promise<typeof import('monaco-editor')> => {
  return new Promise((resolve, reject) => {
    try {
      // 配置 Monaco Environment
      configureMonacoEnvironment();

      // 动态加载 RequireJS loader
      const script = document.createElement('script');
      script.src = monacoLoaderUrl;
      script.async = true;

      script.onload = () => {
        logger.info('RequireJS loader 加载成功');

        // 配置 RequireJS
        (window as any).require.config({
          paths: { "vs": monacoBaseUrl + '/vs' }
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
      logger.error('Monaco Editor AMD 加载初始化失败', error);
      reject(error);
    }
  });
};

/** 检查 Monaco Editor 是否已加载 */
export const isMonacoLoaded = (): boolean => {
  return monacoGloballyLoaded && !!(window as any).monaco;
};

/** 获取已加载的 Monaco Editor 实例 */
export const getMonaco = (): typeof import('monaco-editor') | null => {
  return isMonacoLoaded() ? (window as any).monaco : null;
};

/** 预加载 Monaco Editor Workers */
export const preloadMonacoWorkers = async (): Promise<void> => {
  // 这个函数可以在应用启动时调用，预加载 Workers
  // 目前只是占位符，实际的 Worker 配置在 monaco-manager.ts 中
  logger.info('Monaco Editor Workers 预加载完成');
};
