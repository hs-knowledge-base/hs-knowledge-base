import { Logger } from './logger';
import {
  normalizeLanguage,
  getSupportedLanguages,
  getLanguageDisplayName
} from '@/services/language-service';
import {
  isLanguageLoaded,
  markLanguageLoaded,
  getCompilerUrl,
  getRuntimeUrl,
  needsCompiler,
  needsRuntime,
  languageService
} from '../services/language-service';
import type { Language } from '@/types';

const logger = new Logger('MonacoLanguageLoader');

/** 动态加载语言支持 */
export const loadMonacoLanguage = async (language: string): Promise<void> => {
  // 标准化语言名称
  const normalizedLang = normalizeLanguage(language) as Language;

  // 如果已经加载过，直接返回
  if (isLanguageLoaded(normalizedLang)) {
    return;
  }

  const languageConfig = languageService.getLanguageConfig(normalizedLang);
  if (!languageConfig) {
    logger.warn(`不支持的语言: ${language}`);
    return;
  }

  // 尝试加载语言所需的额外资源（编译器、运行时等）
  try {
    await loadLanguageResources(normalizedLang);
    markLanguageLoaded(normalizedLang);
    logger.info(`语言 ${language} 资源加载完成`);
  } catch (error) {
    // 即使资源加载失败，Monaco Editor 仍可提供基础语法高亮
    logger.warn(`语言 ${language} 额外资源加载失败，使用基础语法高亮:`, error);
    markLanguageLoaded(normalizedLang); // 标记为已处理，避免重复尝试
  }
};

/** 加载语言资源（编译器、运行时等） */
const loadLanguageResources = async (language: Language): Promise<void> => {
  const promises: Promise<void>[] = [];
  const config = languageService.getLanguageConfig(language);

  if (!config) {
    logger.warn(`未找到语言配置: ${language}`);
    return;
  }

  // 加载编译器（如果需要）
  if (needsCompiler(language)) {
    const compilerUrl = getCompilerUrl(language);
    if (compilerUrl) {
      logger.info(`加载 ${language} 编译器: ${compilerUrl}`);
      promises.push(loadScript(compilerUrl, `${language}-compiler`));
    }
  }

  // 加载运行时（如果需要）
  if (needsRuntime(language)) {
    const runtimeUrl = getRuntimeUrl(language);
    if (runtimeUrl) {
      logger.info(`加载 ${language} 运行时: ${runtimeUrl}`);
      promises.push(loadScript(runtimeUrl, `${language}-runtime`));
    }
  }

  // 如果没有额外资源需要加载，直接返回
  if (promises.length === 0) {
    logger.info(`语言 ${language} 无需额外资源，使用 Monaco Editor 内置支持`);
    return;
  }

  // 并行加载所有资源
  await Promise.all(promises);
  logger.info(`语言 ${language} 的 ${promises.length} 个额外资源加载完成`);
};

/** 动态加载脚本 */
const loadScript = async (url: string, id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 检查是否已经加载
    if (document.querySelector(`script[data-id="${id}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.setAttribute('data-id', id);

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));

    document.head.appendChild(script);
  });
};

/** 预加载常用语言 */
export const preloadCommonLanguages = async (): Promise<void> => {
  const commonLanguages: Language[] = ['javascript', 'typescript', 'css', 'html'];

  logger.info('开始预加载常用语言...');

  const loadPromises = commonLanguages.map(lang =>
    loadMonacoLanguage(lang).catch(error => {
      logger.warn(`预加载语言 ${lang} 失败`, error);
    })
  );

  await Promise.all(loadPromises);
  logger.info('常用语言预加载完成');
};

// 重新导出语言服务的方法，保持向后兼容
export {
  getSupportedLanguages,
  getLanguageDisplayName,
  isLanguageLoaded,
  normalizeLanguage
};
