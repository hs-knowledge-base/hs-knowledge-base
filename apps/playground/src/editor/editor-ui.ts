import { Logger } from '../utils/logger';
import { languageService } from '../services/language-service';
import type { Language } from '@/types';

/**
 * 编辑器 UI 管理器
 * 负责编辑器界面的创建和管理
 */
export class EditorUI {
  private readonly logger = new Logger('EditorUI');
  private container!: HTMLElement;

  constructor(private onLanguageChange: (editorType: string, language: Language) => void) {}

  /** 创建编辑器界面 */
  createEditorInterface(container: HTMLElement): void {
    this.container = container;
    
    container.innerHTML = `
      <div class="editor-panels">
        <div class="editor-panel" data-editor="markup">
          <div class="panel-header">
            <span class="panel-title">HTML</span>
            <select class="language-selector" data-editor="markup">
              ${this.createLanguageOptions('markup')}
            </select>
            <button class="panel-toggle" data-editor="markup">−</button>
          </div>
          <div class="panel-content"></div>
        </div>
        
        <div class="editor-panel" data-editor="style">
          <div class="panel-header">
            <span class="panel-title">CSS</span>
            <select class="language-selector" data-editor="style">
              ${this.createLanguageOptions('style')}
            </select>
            <button class="panel-toggle" data-editor="style">−</button>
          </div>
          <div class="panel-content"></div>
        </div>
        
        <div class="editor-panel" data-editor="script">
          <div class="panel-header">
            <span class="panel-title">JavaScript</span>
            <select class="language-selector" data-editor="script">
              ${this.createLanguageOptions('script')}
            </select>
            <button class="panel-toggle" data-editor="script">−</button>
          </div>
          <div class="panel-content"></div>
        </div>
      </div>
    `;

    this.setupEventHandlers();
    this.applyStyles();
  }

  /** 创建语言选项 */
  private createLanguageOptions(editorType: 'markup' | 'style' | 'script'): string {
    const languages = languageService.getLanguagesByEditorType(editorType);
    
    return languages.map(lang => {
      const displayName = languageService.getLanguageDisplayName(lang);
      return `<option value="${lang}">${displayName}</option>`;
    }).join('');
  }

  /** 设置事件处理器 */
  private setupEventHandlers(): void {
    // 语言选择器事件
    this.container.querySelectorAll('.language-selector').forEach(selector => {
      selector.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        const editorType = target.dataset.editor!;
        const language = target.value as Language;
        
        this.logger.info(`语言切换: ${editorType} -> ${language}`);
        this.onLanguageChange(editorType, language);
      });
    });

    // 面板折叠事件
    this.container.querySelectorAll('.panel-toggle').forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const editorType = target.dataset.editor!;
        this.togglePanel(editorType);
      });
    });
  }

  /** 更新面板标题 */
  updatePanelTitle(editorType: string, language: Language): void {
    const panelTitle = this.container.querySelector(`[data-editor="${editorType}"] .panel-title`) as HTMLElement;
    if (panelTitle) {
      const displayName = languageService.getLanguageDisplayName(language);
      panelTitle.textContent = displayName;
      this.logger.info(`面板 ${editorType} 标题已更新为 ${displayName}`);
    }
  }

  /** 设置面板可见性 */
  setPanelVisibility(editorType: string, visible: boolean): void {
    const panel = this.container.querySelector(`[data-editor="${editorType}"]`) as HTMLElement;
    if (panel) {
      panel.style.display = visible ? 'flex' : 'none';
    }
  }

  /** 切换面板折叠状态 */
  private togglePanel(editorType: string): void {
    const panel = this.container.querySelector(`[data-editor="${editorType}"]`) as HTMLElement;
    const toggle = this.container.querySelector(`[data-editor="${editorType}"] .panel-toggle`) as HTMLButtonElement;
    
    if (panel && toggle) {
      const isCollapsed = panel.classList.contains('collapsed');
      
      if (isCollapsed) {
        panel.classList.remove('collapsed');
        toggle.textContent = '−';
      } else {
        panel.classList.add('collapsed');
        toggle.textContent = '+';
      }
    }
  }

  /** 获取编辑器容器 */
  getEditorContainer(editorType: string): HTMLElement | null {
    return this.container.querySelector(`[data-editor="${editorType}"] .panel-content`) as HTMLElement;
  }

  /** 应用样式 */
  private applyStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .editor-panels {
        display: flex;
        height: 100%;
        gap: 1px;
        background: #2d2d30;
      }

      .editor-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: #1e1e1e;
        border-radius: 4px;
        overflow: hidden;
      }

      .editor-panel.collapsed .panel-content {
        display: none;
      }

      .panel-header {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        background: #2d2d30;
        border-bottom: 1px solid #3e3e42;
        gap: 8px;
      }

      .panel-title {
        font-weight: 500;
        color: #cccccc;
        font-size: 13px;
      }

      .language-selector {
        background: #3c3c3c;
        border: 1px solid #464647;
        color: #cccccc;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 12px;
        outline: none;
      }

      .language-selector:focus {
        border-color: #007acc;
      }

      .panel-toggle {
        background: none;
        border: none;
        color: #cccccc;
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 14px;
        margin-left: auto;
      }

      .panel-toggle:hover {
        background: #464647;
      }

      .panel-content {
        flex: 1;
        position: relative;
      }
    `;
    
    document.head.appendChild(style);
  }
}
