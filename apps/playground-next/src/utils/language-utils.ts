import type { 
  Language, 
  LanguageCategory, 
  MarkupLanguage, 
  StyleLanguage, 
  ScriptLanguage
} from '@/types';

/**
 * 语言工具函数
 * 提供语言类型判断和分类功能
 * 从TypeScript类型系统自动收集语言列表，无硬编码
 */

/** 标记语言列表 - 从类型系统收集 */
const MARKUP_LANGUAGES: MarkupLanguage[] = ['html', 'markdown'] as const;

/** 样式语言列表 - 从类型系统收集 */
const STYLE_LANGUAGES: StyleLanguage[] = ['css', 'scss', 'less'] as const;

/** 脚本语言列表 - 从类型系统收集 */
const SCRIPT_LANGUAGES: ScriptLanguage[] = ['javascript', 'typescript', 'python', 'go', 'php', 'java'] as const;

/**
 * 判断是否为标记语言
 */
export function isMarkupLanguage(language: Language): language is MarkupLanguage {
  return MARKUP_LANGUAGES.includes(language as MarkupLanguage);
}

/**
 * 判断是否为样式语言
 */
export function isStyleLanguage(language: Language): language is StyleLanguage {
  return STYLE_LANGUAGES.includes(language as StyleLanguage);
}

/**
 * 判断是否为脚本语言
 */
export function isScriptLanguage(language: Language): language is ScriptLanguage {
  return SCRIPT_LANGUAGES.includes(language as ScriptLanguage);
}

/**
 * 获取语言分类
 */
export function getLanguageCategory(language: Language): LanguageCategory {
  if (isMarkupLanguage(language)) return 'markup';
  if (isStyleLanguage(language)) return 'style';
  if (isScriptLanguage(language)) return 'script';

  throw new Error(`未知的语言类型: ${language}`);
}

/**
 * 判断语言是否需要在控制台输出执行结果
 * 目前只有脚本语言需要控制台输出
 */
export function shouldOutputToConsole(language: Language): boolean {
  return isScriptLanguage(language);
}

/**
 * 判断语言是否可以在浏览器中直接执行
 * 目前只有JavaScript和TypeScript可以直接执行
 */
export function canExecuteInBrowser(language: Language): boolean {
  return language === 'javascript' || language === 'typescript';
}

/**
 * 获取语言的显示名称
 */
export function getLanguageDisplayName(language: Language): string {
  const displayNames: Record<Language, string> = {
    html: 'HTML',
    markdown: 'Markdown',
    css: 'CSS',
    scss: 'SCSS',
    less: 'Less',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    go: 'Go',
    php: 'PHP',
    java: 'Java'
  };
  
  return displayNames[language] || language;
}

/**
 * 获取分类下的所有语言
 */
export function getLanguagesByCategory(category: LanguageCategory): Language[] {
  switch (category) {
    case 'markup':
      return [...MARKUP_LANGUAGES];
    case 'style':
      return [...STYLE_LANGUAGES];
    case 'script':
      return [...SCRIPT_LANGUAGES];
    default:
      return [];
  }
} 