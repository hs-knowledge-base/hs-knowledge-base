import { Logger } from './logger';
import {
  languageService,
  normalizeLanguage,
  getSupportedLanguages,
  getLanguageDisplayName,
  isLanguageLoaded,
  markLanguageLoaded,
  getCompilerUrl,
  getRuntimeUrl,
  needsCompiler,
  needsRuntime
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

  // 检查是否是内置语言
  if (languageConfig.isBuiltin) {
    // 内置语言不需要额外加载
    markLanguageLoaded(normalizedLang);
    logger.info(`内置语言 ${language} 已可用`);
    return;
  }

  // 对于非内置语言，尝试加载编译器或运行时
  try {
    await loadLanguageResources(normalizedLang);
    markLanguageLoaded(normalizedLang);
    logger.info(`语言 ${language} 资源加载成功`);
  } catch (error) {
    logger.warn(`语言 ${language} 资源加载失败，使用基础语法高亮:`, error);
    markLanguageLoaded(normalizedLang); // 标记为已处理，避免重复尝试
  }
};

/** 加载语言资源（编译器、运行时等） */
const loadLanguageResources = async (language: Language): Promise<void> => {
  const promises: Promise<void>[] = [];

  // 加载编译器
  if (needsCompiler(language)) {
    const compilerUrl = getCompilerUrl(language);
    if (compilerUrl) {
      promises.push(loadScript(compilerUrl, `${language}-compiler`));
    }
  }

  // 加载运行时
  if (needsRuntime(language)) {
    const runtimeUrl = getRuntimeUrl(language);
    if (runtimeUrl) {
      promises.push(loadScript(runtimeUrl, `${language}-runtime`));
    }
  }

  if (promises.length > 0) {
    await Promise.all(promises);
  }
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
  const commonLanguages: Language[] = ['javascript', 'typescript', 'css', 'html', 'json'];

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
