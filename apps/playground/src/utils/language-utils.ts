import type {
  Language,
  LanguageCategory,
  MarkupLanguage,
  StyleLanguage,
  ScriptLanguage,
  EditorType
} from '@/types';

/**
 * 判断是否为标记语言
 */
export function isMarkupLanguage(language: Language): language is MarkupLanguage {
  return language in MARKUP_LANGUAGE_CONFIG;
}

/**
 * 判断是否为样式语言
 */
export function isStyleLanguage(language: Language): language is StyleLanguage {
  return language in STYLE_LANGUAGE_CONFIG;
}

/**
 * 判断是否为脚本语言
 */
export function isScriptLanguage(language: Language): language is ScriptLanguage {
  return language in SCRIPT_LANGUAGE_CONFIG;
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
 */
export function canExecuteInBrowser(language: Language): boolean {
  return language === 'javascript';
}

/** 语言配置接口 */
interface LanguageConfig {
  displayName: string;
  monacoId: string;
  description: string;
  extension: string;
}

/** 标记语言配置 */
const MARKUP_LANGUAGE_CONFIG: Record<MarkupLanguage, LanguageConfig> = {
  html: {
    displayName: 'HTML',
    monacoId: 'html',
    description: 'HyperText Markup Language - 网页结构标记语言',
    extension: '.html'
  },
  markdown: {
    displayName: 'Markdown',
    monacoId: 'markdown',
    description: 'Markdown - 轻量级标记语言',
    extension: '.md'
  }
};

/** 样式语言配置 */
const STYLE_LANGUAGE_CONFIG: Record<StyleLanguage, LanguageConfig> = {
  css: {
    displayName: 'CSS',
    monacoId: 'css',
    description: 'Cascading Style Sheets - 层叠样式表',
    extension: '.css'
  },
  scss: {
    displayName: 'SCSS',
    monacoId: 'scss',
    description: 'Sass (SCSS) - CSS 预处理器',
    extension: '.scss'
  },
  less: {
    displayName: 'Less',
    monacoId: 'less',
    description: 'Less - CSS 预处理器',
    extension: '.less'
  }
};

/** 脚本语言配置 */
const SCRIPT_LANGUAGE_CONFIG: Record<ScriptLanguage, LanguageConfig> = {
  javascript: {
    displayName: 'JavaScript',
    monacoId: 'javascript',
    description: 'JavaScript - 原生浏览器脚本语言',
    extension: '.js'
  },
  typescript: {
    displayName: 'TypeScript',
    monacoId: 'typescript',
    description: 'TypeScript - 带类型的 JavaScript 超集',
    extension: '.ts'
  },
  python: {
    displayName: 'Python',
    monacoId: 'python',
    description: 'Python - 使用 Brython 在浏览器中运行',
    extension: '.py'
  },
  go: {
    displayName: 'Go',
    monacoId: 'go',
    description: 'Go - 使用 GopherJS 编译为 JavaScript',
    extension: '.go'
  },
  php: {
    displayName: 'PHP',
    monacoId: 'php',
    description: 'PHP - 使用 Uniter 在浏览器中运行',
    extension: '.php'
  },
  java: {
    displayName: 'Java',
    monacoId: 'java',
    description: 'Java - 使用 CheerpJ 在浏览器中运行',
    extension: '.java'
  }
};

/** 统一的语言配置映射 */
const LANGUAGE_CONFIG: Record<Language, LanguageConfig> = {
  ...MARKUP_LANGUAGE_CONFIG,
  ...STYLE_LANGUAGE_CONFIG,
  ...SCRIPT_LANGUAGE_CONFIG
};

/**
 * 获取语言的显示名称
 */
export function getLanguageDisplayName(language: Language): string {
  return LANGUAGE_CONFIG[language]?.displayName || language;
}

/**
 * 获取 Monaco 编辑器的语言标识符
 */
export function getMonacoLanguageId(language: Language): string {
  return LANGUAGE_CONFIG[language]?.monacoId || 'plaintext';
}

/**
 * 获取语言的描述信息
 */
export function getLanguageDescription(language: Language): string {
  return LANGUAGE_CONFIG[language]?.description || language;
}

/**
 * 获取语言的文件扩展名
 */
export function getLanguageExtension(language: Language): string {
  return LANGUAGE_CONFIG[language]?.extension || '.txt';
}

/**
 * 获取分类下的所有语言
 */
export function getLanguagesByCategory(category: LanguageCategory): Language[] {
  switch (category) {
    case 'markup':
      return Object.keys(MARKUP_LANGUAGE_CONFIG) as MarkupLanguage[];
    case 'style':
      return Object.keys(STYLE_LANGUAGE_CONFIG) as StyleLanguage[];
    case 'script':
      return Object.keys(SCRIPT_LANGUAGE_CONFIG) as ScriptLanguage[];
    default:
      return [];
  }
}

/**
 * 获取支持的语言列表（按编辑器类型分组）
 */
export function getSupportedLanguages(): Record<EditorType, Language[]> {
  return {
    markup: getLanguagesByCategory('markup'),
    style: getLanguagesByCategory('style'),
    script: getLanguagesByCategory('script')
  };
}

/** 支持的语言列表 */
export const SUPPORTED_LANGUAGES: Record<EditorType, Language[]> = {
  markup: getLanguagesByCategory('markup'),
  style: getLanguagesByCategory('style'),
  script: getLanguagesByCategory('script')
};
