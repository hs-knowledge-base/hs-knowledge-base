import {
  monacoTypescriptUrl,
  monacoJsonUrl,
  monacoCssUrl,
  monacoHtmlUrl,
  monacoJavascriptUrl,
  monacoMarkdownUrl,
  monacoXmlUrl,
  monacoYamlUrl,
  monacoSqlUrl,
  monacoPythonUrl,
  monacoShellUrl
} from '../services/vendors';
import { Logger } from './logger';

const logger = new Logger('MonacoLanguageLoader');

/** 语言加载状态 */
const loadedLanguages = new Set<string>();
const loadingPromises = new Map<string, Promise<void>>();

/** 语言配置映射 */
const languageUrls: Record<string, string> = {
  typescript: monacoTypescriptUrl,
  javascript: monacoJavascriptUrl,
  json: monacoJsonUrl,
  css: monacoCssUrl,
  html: monacoHtmlUrl,
  markdown: monacoMarkdownUrl,
  xml: monacoXmlUrl,
  yaml: monacoYamlUrl,
  sql: monacoSqlUrl,
  python: monacoPythonUrl,
  shell: monacoShellUrl,
  // 别名支持
  js: monacoJavascriptUrl,
  ts: monacoTypescriptUrl,
  jsx: monacoJavascriptUrl,
  tsx: monacoTypescriptUrl,
  scss: monacoCssUrl,
  less: monacoCssUrl,
  sass: monacoCssUrl,
  htm: monacoHtmlUrl,
  xml: monacoXmlUrl,
  yml: monacoYamlUrl,
  py: monacoPythonUrl,
  sh: monacoShellUrl,
  bash: monacoShellUrl
};

/** 动态加载语言支持 */
export const loadMonacoLanguage = async (language: string): Promise<void> => {
  // 标准化语言名称
  const normalizedLang = language.toLowerCase();
  
  // 如果已经加载过，直接返回
  if (loadedLanguages.has(normalizedLang)) {
    return;
  }

  // 如果正在加载，等待加载完成
  if (loadingPromises.has(normalizedLang)) {
    return loadingPromises.get(normalizedLang);
  }

  // 获取语言URL
  const languageUrl = languageUrls[normalizedLang];
  if (!languageUrl) {
    logger.warn(`不支持的语言: ${language}`);
    return;
  }

  // 开始加载语言
  const loadPromise = loadLanguageFromUrl(normalizedLang, languageUrl);
  loadingPromises.set(normalizedLang, loadPromise);

  try {
    await loadPromise;
    loadedLanguages.add(normalizedLang);
    logger.info(`语言 ${language} 加载成功`);
  } catch (error) {
    logger.error(`语言 ${language} 加载失败`, error);
    loadingPromises.delete(normalizedLang);
    throw error;
  } finally {
    loadingPromises.delete(normalizedLang);
  }
};

/** 从URL加载语言支持 */
const loadLanguageFromUrl = async (language: string, url: string): Promise<void> => {
  try {
    // 动态导入语言模块
    await import(/* @vite-ignore */ url);
    logger.debug(`语言模块 ${language} 从 ${url} 加载成功`);
  } catch (error) {
    logger.error(`从 ${url} 加载语言模块 ${language} 失败`, error);
    throw error;
  }
};

/** 预加载常用语言 */
export const preloadCommonLanguages = async (): Promise<void> => {
  const commonLanguages = ['javascript', 'typescript', 'css', 'html', 'json'];
  
  logger.info('开始预加载常用语言...');
  
  const loadPromises = commonLanguages.map(lang => 
    loadMonacoLanguage(lang).catch(error => {
      logger.warn(`预加载语言 ${lang} 失败`, error);
    })
  );

  await Promise.all(loadPromises);
  logger.info('常用语言预加载完成');
};

/** 检查语言是否已加载 */
export const isLanguageLoaded = (language: string): boolean => {
  return loadedLanguages.has(language.toLowerCase());
};

/** 获取支持的语言列表 */
export const getSupportedLanguages = (): string[] => {
  return Object.keys(languageUrls);
};

/** 获取语言的显示名称 */
export const getLanguageDisplayName = (language: string): string => {
  const displayNames: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    css: 'CSS',
    html: 'HTML',
    json: 'JSON',
    markdown: 'Markdown',
    xml: 'XML',
    yaml: 'YAML',
    sql: 'SQL',
    python: 'Python',
    shell: 'Shell',
    js: 'JavaScript',
    ts: 'TypeScript',
    jsx: 'JSX',
    tsx: 'TSX',
    scss: 'SCSS',
    less: 'Less',
    sass: 'Sass',
    htm: 'HTML',
    yml: 'YAML',
    py: 'Python',
    sh: 'Shell',
    bash: 'Bash'
  };

  return displayNames[language.toLowerCase()] || language;
};
