import type { Language, Config } from '@/types';

/**
 * 编辑器接口
 */
export interface IEditor {
  /** 初始化编辑器 */
  initialize(container: HTMLElement): Promise<void>;
  
  /** 获取代码 */
  getCode(): Promise<{ markup: string; style: string; script: string }>;
  
  /** 设置代码 */
  setCode(code: Partial<{ markup: string; style: string; script: string }>): Promise<void>;
  
  /** 更新配置 */
  updateConfig(config: Config): Promise<void>;
  
  /** 格式化代码 */
  format(): Promise<void>;
  
  /** 设置编辑器语言 */
  setLanguage(editorType: string, language: Language): Promise<void>;
  
  /** 销毁编辑器 */
  destroy(): Promise<void>;
}

/**
 * Monaco Editor 服务接口
 */
export interface IMonacoEditorService {
  /** 创建编辑器实例 */
  createEditor(container: HTMLElement, options: any): any;
  
  /** 配置语言支持 */
  configureLanguage(language: Language): Promise<void>;
  
  /** 设置主题 */
  setTheme(theme: string): void;
  
  /** 获取 Monaco 实例 */
  getMonaco(): any;
  
  /** 检查是否已加载 */
  isLoaded(): boolean;
}

/**
 * 编辑器 UI 管理器接口
 */
export interface IEditorUIManager {
  /** 创建编辑器界面 */
  createEditorInterface(container: HTMLElement): void;
  
  /** 创建语言选择器 */
  createLanguageSelectors(): void;
  
  /** 更新面板标题 */
  updatePanelTitle(editorType: string, language: Language): void;
  
  /** 设置面板可见性 */
  setPanelVisibility(editorType: string, visible: boolean): void;
}

/**
 * 语言切换器接口
 */
export interface ILanguageSwitcher {
  /** 切换语言 */
  switchLanguage(editorType: string, language: Language): Promise<void>;
  
  /** 获取当前语言 */
  getCurrentLanguage(editorType: string): Language;
  
  /** 获取支持的语言列表 */
  getSupportedLanguages(editorType: string): Language[];
}
