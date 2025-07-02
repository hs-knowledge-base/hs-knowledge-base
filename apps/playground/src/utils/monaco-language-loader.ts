import { Logger } from './logger';

const logger = new Logger('MonacoLanguageLoader');

/** 语言加载状态 */
const loadedLanguages = new Set<string>();

/** 支持的语言配置 */
const supportedLanguages = {
  // LiveCodes Monaco Editor 内置语言（不需要额外加载）
  builtin: [
    'javascript', 'typescript', 'html', 'css', 'json', 'xml', 'yaml', 'markdown',
    'python', 'sql', 'shell', 'bash', 'dockerfile', 'ini', 'properties'
  ],

  // 别名映射
  aliases: {
    js: 'javascript',
    ts: 'typescript',
    jsx: 'javascript',
    tsx: 'typescript',
    htm: 'html',
    scss: 'css',
    sass: 'css',
    less: 'css',
    yml: 'yaml',
    py: 'python',
    sh: 'shell',
    md: 'markdown'
  }
};

/** 动态加载语言支持 */
export const loadMonacoLanguage = async (language: string): Promise<void> => {
  // 标准化语言名称
  const normalizedLang = normalizeLanguage(language);

  // 如果已经加载过，直接返回
  if (loadedLanguages.has(normalizedLang)) {
    return;
  }

  // 检查是否是内置语言
  if (supportedLanguages.builtin.includes(normalizedLang)) {
    // LiveCodes Monaco Editor 内置语言不需要额外加载
    loadedLanguages.add(normalizedLang);
    logger.info(`内置语言 ${language} 已可用`);
    return;
  }

  // 对于非内置语言，标记为已处理（避免重复尝试）
  loadedLanguages.add(normalizedLang);
  logger.warn(`语言 ${language} 暂不支持动态加载，使用基础语法高亮`);
};

/** 标准化语言名称 */
const normalizeLanguage = (language: string): string => {
  const normalized = language.toLowerCase();
  return supportedLanguages.aliases[normalized] || normalized;
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
  return loadedLanguages.has(normalizeLanguage(language));
};

/** 获取支持的语言列表 */
export const getSupportedLanguages = (): string[] => {
  return [...supportedLanguages.builtin, ...Object.keys(supportedLanguages.aliases)];
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
    bash: 'Bash',
    dockerfile: 'Dockerfile',
    ini: 'INI',
    properties: 'Properties',
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
    md: 'Markdown'
  };

  const normalized = normalizeLanguage(language);
  return displayNames[normalized] || language;
};
