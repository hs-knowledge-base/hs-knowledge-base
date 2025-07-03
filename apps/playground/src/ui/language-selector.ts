import {
  getLanguageDisplayName,
  getLanguagesByEditorType
} from '../services/language-service';
import { Logger } from '../utils/logger';
import type { Language } from '@/types';

const logger = new Logger('LanguageSelector');

/** 语言选择器配置 */
interface LanguageSelectorConfig {
  container: HTMLElement;
  editorType: 'markup' | 'style' | 'script';
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

/** 语言选择器类 */
export class LanguageSelector {
  private container: HTMLElement;
  private editorType: 'markup' | 'style' | 'script';
  private currentLanguage: Language;
  private onLanguageChange: (language: Language) => void;
  private selectElement!: HTMLSelectElement;

  constructor(config: LanguageSelectorConfig) {
    this.container = config.container;
    this.editorType = config.editorType;
    this.currentLanguage = config.currentLanguage;
    this.onLanguageChange = config.onLanguageChange;
    
    this.createSelector();
  }

  /** 创建语言选择器 */
  private createSelector(): void {
    // 创建选择器容器
    const selectorContainer = document.createElement('div');
    selectorContainer.className = 'language-selector';
    
    // 创建标签
    const label = document.createElement('label');
    label.textContent = '语言:';
    label.className = 'language-label';
    
    // 创建选择框
    this.selectElement = document.createElement('select');
    this.selectElement.className = 'language-select';
    
    // 添加语言选项
    this.populateLanguageOptions();
    
    // 设置当前语言
    this.selectElement.value = this.currentLanguage;
    
    // 监听语言变化
    this.selectElement.addEventListener('change', (event) => {
      const target = event.target as HTMLSelectElement;
      const newLanguage = target.value as Language;
      this.setLanguage(newLanguage);
    });
    
    // 组装元素
    selectorContainer.appendChild(label);
    selectorContainer.appendChild(this.selectElement);
    this.container.appendChild(selectorContainer);
    
    // 应用样式
    this.applyStyles();
    
    logger.info(`语言选择器已创建，编辑器类型: ${this.editorType}`);
  }

  /** 填充语言选项 */
  private populateLanguageOptions(): void {
    // 根据编辑器类型获取相关语言
    const relevantLanguages = getLanguagesByEditorType(this.editorType);

    relevantLanguages.forEach(language => {
      const option = document.createElement('option');
      option.value = language;
      option.textContent = getLanguageDisplayName(language);
      this.selectElement.appendChild(option);
    });
  }

  /** 设置语言 */
  setLanguage(language: Language): void {
    if (language === this.currentLanguage) {
      return;
    }

    this.currentLanguage = language;
    this.selectElement.value = language;

    // 触发语言变化回调
    this.onLanguageChange(language);

    logger.info(`编辑器 ${this.editorType} 语言已切换为 ${language}`);
  }

  /** 获取当前语言 */
  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  /** 应用样式 */
  private applyStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .language-selector {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        background: #2d2d30;
        border-bottom: 1px solid #3e3e3e;
        font-size: 12px;
      }

      .language-label {
        color: #cccccc;
        font-weight: 500;
        white-space: nowrap;
      }

      .language-select {
        background: #3c3c3c;
        color: #cccccc;
        border: 1px solid #5a5a5a;
        border-radius: 3px;
        padding: 2px 6px;
        font-size: 11px;
        min-width: 80px;
        cursor: pointer;
      }

      .language-select:hover {
        background: #404040;
        border-color: #6a6a6a;
      }

      .language-select:focus {
        outline: none;
        border-color: #007acc;
        box-shadow: 0 0 0 1px #007acc;
      }

      .language-select option {
        background: #3c3c3c;
        color: #cccccc;
      }
    `;

    if (!document.head.querySelector('style[data-language-selector]')) {
      style.setAttribute('data-language-selector', 'true');
      document.head.appendChild(style);
    }
  }

  /** 销毁选择器 */
  destroy(): void {
    const selectorElement = this.container.querySelector('.language-selector');
    if (selectorElement) {
      selectorElement.remove();
    }
    logger.info(`语言选择器已销毁，编辑器类型: ${this.editorType}`);
  }
}
