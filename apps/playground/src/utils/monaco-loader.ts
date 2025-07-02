import { monacoBaseUrl, monacoEditorMainUrl } from '../services/vendors';
import { Logger } from './logger';
import { preloadCommonLanguages } from './monaco-language-loader';

const logger = new Logger('MonacoLoader');

/** Monaco Editor 全局加载状态 */
let monacoGloballyLoaded = false;
let monacoLoadPromise: Promise<typeof import('monaco-editor')> | null = null;

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
  monacoLoadPromise = loadMonacoFromCDN();
  
  try {
    const monaco = await monacoLoadPromise;
    monacoGloballyLoaded = true;
    (window as any).monaco = monaco;
    logger.info('Monaco Editor 加载成功');

    return monaco;
  } catch (error) {
    logger.error('Monaco Editor 加载失败', error);
    monacoLoadPromise = null;
    throw error;
  }
};

/** 从 CDN 加载 Monaco Editor */
const loadMonacoFromCDN = async (): Promise<typeof import('monaco-editor')> => {
  // 尝试多种加载方式，优先使用 LiveCodes 版本
  const loadStrategies = [
    {
      name: 'LiveCodes Monaco Editor',
      loader: async () => {
        // 按照 LiveCodes 的方式加载
        const monacoModule = await import(/* @vite-ignore */ monacoEditorMainUrl);
        // LiveCodes 的方式：(window as any).monaco = (window as any).monaco || monacoModule.monaco;
        return (window as any).monaco || monacoModule.monaco || monacoModule;
      }
    },
  ];

  for (const strategy of loadStrategies) {
    try {
      logger.info(`尝试从 ${strategy.name} 加载 Monaco Editor`);
      const monaco = await strategy.loader();

      if (monaco && (monaco.editor || monaco.monaco?.editor)) {
        const finalMonaco = monaco.monaco || monaco;
        logger.info(`Monaco Editor 从 ${strategy.name} 加载成功`);
        return finalMonaco;
      } else {
        logger.warn(`从 ${strategy.name} 加载的 Monaco Editor 对象无效`);
      }
    } catch (error) {
      logger.warn(`从 ${strategy.name} 加载 Monaco Editor 失败`, error);
      // 继续尝试下一个策略
    }
  }

  // 所有策略都失败了
  throw new Error('无法从任何源加载 Monaco Editor');
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
