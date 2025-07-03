/**
 * UI 相关接口
 */

/** 布局管理器接口 */
export interface ILayoutManager {
  /** 初始化布局 */
  initialize(): Promise<void>;
  
  /** 获取编辑器容器 */
  getEditorContainer(): HTMLElement;
  
  /** 获取结果容器 */
  getResultContainer(): HTMLElement;
  
  /** 获取工具栏容器 */
  getToolbarContainer(): HTMLElement;
  
  /** 更新布局 */
  updateLayout(layout: 'horizontal' | 'vertical'): void;
  
  /** 应用主题 */
  applyTheme(theme: 'light' | 'dark'): void;
}

/** 代码运行器接口 */
export interface ICodeRunner {
  /** 初始化运行器 */
  initialize(container: HTMLElement): Promise<void>;
  
  /** 运行代码 */
  run(code: { markup: string; style: string; script: string }, config: any): Promise<void>;
  
  /** 清除结果 */
  clear(): void;
  
  /** 销毁运行器 */
  destroy(): void;
}
