import type { Language, CodeContent, EditorType } from '@/types';
import {
  LANGUAGE_TEMPLATES,
  DEFAULT_CODE,
  getLanguageTemplate,
  hasLanguageTemplate
} from '@/templates/code-templates';
import { DEFAULT_LANGUAGES } from '@/constants/editor';

/**
 * 模板服务 - 统一管理代码模板
 */
export class TemplateService {
  private static instance: TemplateService | null = null;
  private readonly templateCache = new Map<Language, string>();

  private constructor() {
    this.initializeCache();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  /**
   * 初始化模板缓存
   */
  private initializeCache(): void {
    // 预加载所有模板到缓存中
    Object.entries(LANGUAGE_TEMPLATES).forEach(([language, template]) => {
      this.templateCache.set(language as Language, template);
    });
    
    console.log(`[TemplateService] 已缓存 ${this.templateCache.size} 个语言模板`);
  }

  /**
   * 获取指定语言的模板代码
   * @param language 语言类型
   * @returns 模板代码字符串
   */
  getTemplate(language: Language): string {
    // 优先从缓存获取
    const cached = this.templateCache.get(language);
    if (cached !== undefined) {
      return cached;
    }

    // 回退到直接获取
    const template = getLanguageTemplate(language);
    
    // 缓存结果
    if (template) {
      this.templateCache.set(language, template);
    }
    
    return template;
  }

  /**
   * 检查语言是否有可用模板
   * @param language 语言类型
   * @returns 是否有模板
   */
  hasTemplate(language: Language): boolean {
    return hasLanguageTemplate(language);
  }

  /**
   * 获取默认的编辑器内容
   * @returns 默认代码内容
   */
  getDefaultContent(): CodeContent {
    return { ...DEFAULT_CODE };
  }

  /**
   * 根据编辑器类型获取对应的默认语言模板
   * 使用配置化的默认语言设置
   * @param editorType 编辑器类型
   * @returns 模板代码
   */
  getDefaultTemplateByEditorType(editorType: EditorType): string {
    switch (editorType) {
      case 'markup':
        return this.getTemplate(DEFAULT_LANGUAGES.markup);
      case 'style':
        return this.getTemplate(DEFAULT_LANGUAGES.style);
      case 'script':
        return this.getTemplate(DEFAULT_LANGUAGES.script);
      default:
        return '';
    }
  }

  /**
   * 获取所有可用的模板语言列表
   * @returns 语言列表
   */
  getAvailableLanguages(): Language[] {
    return Array.from(this.templateCache.keys());
  }

  /**
   * 清除模板缓存
   */
  clearCache(): void {
    this.templateCache.clear();
    console.log('[TemplateService] 模板缓存已清除');
  }

  /**
   * 重新加载模板缓存
   */
  reloadCache(): void {
    this.clearCache();
    this.initializeCache();
  }

  /**
   * 获取模板统计信息
   */
  getStats(): {
    totalTemplates: number;
    cachedTemplates: number;
    availableLanguages: Language[];
  } {
    return {
      totalTemplates: Object.keys(LANGUAGE_TEMPLATES).length,
      cachedTemplates: this.templateCache.size,
      availableLanguages: this.getAvailableLanguages()
    };
  }
}

/**
 * 模板服务实例 - 便于导入使用
 */
export const templateService = TemplateService.getInstance();

/**
 * React Hook - 使用模板服务
 */
export function useTemplateService() {
  return templateService;
}

/**
 * 便捷函数 - 获取语言模板
 * @param language 语言类型
 * @returns 模板代码
 */
export function getTemplate(language: Language): string {
  return templateService.getTemplate(language);
}

/**
 * 便捷函数 - 获取默认内容
 * @returns 默认代码内容
 */
export function getDefaultContent(): CodeContent {
  return templateService.getDefaultContent();
}
