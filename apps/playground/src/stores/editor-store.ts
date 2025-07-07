import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { EditorConfig, EditorType, Language } from '@/types';
import { DEFAULT_EDITOR_CONFIG } from '@/constants';
import { templateService } from '@/lib/services/template-service';

/**
 * 编辑器状态接口
 * 定义编辑器的所有状态属性
 */
interface EditorState {
  /** 编辑器配置 - 每个编辑器类型的配置信息 */
  configs: Record<EditorType, EditorConfig>;

  /** 编辑器实例状态 - 是否已加载完成 */
  isLoaded: boolean;
  /** 编辑器实例状态 - 是否正在加载中 */
  isLoading: boolean;
  /** 编辑器实例状态 - 加载错误信息 */
  loadError: string | null;

  /** 当前活动的编辑器类型 */
  activeEditor: EditorType;

  /** 编辑器内容 - 每个编辑器的代码内容 */
  contents: Record<EditorType, string>;

  /** 编辑器选择状态 - 每个编辑器的文本选择范围 */
  selections: Record<EditorType, { start: number; end: number } | null>;

  /** 编辑器焦点状态 - 当前获得焦点的编辑器 */
  focusedEditor: EditorType | null;

  /** 编辑器可见性 - 每个编辑器的显示/隐藏状态 */
  visibility: Record<EditorType, boolean>;

  /** 编辑器尺寸 - 每个编辑器的宽度和高度 */
  sizes: Record<EditorType, { width: number; height: number }>;

  /** 编辑器错误状态 - 每个编辑器的错误信息列表 */
  errors: Record<EditorType, string[]>;

  /** 编辑器性能指标 */
  performance: {
    /** 加载耗时（毫秒） */
    loadTime: number;
    /** 最后更新时间戳 */
    lastUpdateTime: number;
    /** 更新次数计数 */
    updateCount: number;
  };

  /** 根据语言获取模板代码的辅助函数 */
  getTemplateCode: (language: Language) => string;
}

/**
 * 编辑器操作接口
 * 定义编辑器的所有操作方法
 */
interface EditorActions {
  /** 编辑器配置管理 */
  /** 设置指定编辑器的配置 */
  setEditorConfig: (type: EditorType, config: Partial<EditorConfig>) => void;
  /** 批量设置所有编辑器的配置 */
  setAllEditorConfigs: (configs: Partial<Record<EditorType, EditorConfig>>) => void;
  /** 重置指定编辑器的配置为默认值 */
  resetEditorConfig: (type: EditorType) => void;

  /** 编辑器语言管理 */
  /** 设置指定编辑器的编程语言 */
  setEditorLanguage: (type: EditorType, language: Language) => void;

  /** 编辑器主题管理 */
  /** 设置编辑器主题（深色/浅色） */
  setEditorTheme: (theme: 'vs-dark' | 'vs-light') => void;

  /** 编辑器内容管理 */
  /** 设置指定编辑器的代码内容 */
  setEditorContent: (type: EditorType, content: string) => void;
  /** 批量设置所有编辑器的代码内容 */
  setAllEditorContents: (contents: Partial<Record<EditorType, string>>) => void;

  /** 编辑器状态管理 */
  /** 设置编辑器加载状态 */
  setEditorLoading: (isLoading: boolean) => void;
  /** 设置编辑器已加载状态 */
  setEditorLoaded: (isLoaded: boolean) => void;
  /** 设置编辑器错误信息 */
  setEditorError: (error: string | null) => void;

  /** 编辑器焦点和选择管理 */
  /** 设置当前活动的编辑器 */
  setActiveEditor: (type: EditorType) => void;
  /** 设置获得焦点的编辑器 */
  setFocusedEditor: (type: EditorType | null) => void;
  /** 设置指定编辑器的文本选择范围 */
  setEditorSelection: (type: EditorType, selection: { start: number; end: number } | null) => void;

  /** 编辑器可见性管理 */
  /** 设置指定编辑器的可见性 */
  setEditorVisibility: (type: EditorType, visible: boolean) => void;
  /** 切换指定编辑器的可见性 */
  toggleEditorVisibility: (type: EditorType) => void;

  /** 编辑器尺寸管理 */
  /** 设置指定编辑器的尺寸 */
  setEditorSize: (type: EditorType, size: { width: number; height: number }) => void;

  /** 编辑器错误管理 */
  /** 添加编辑器错误信息 */
  addEditorError: (type: EditorType, error: string) => void;
  /** 移除指定的编辑器错误信息 */
  removeEditorError: (type: EditorType, error: string) => void;
  /** 清除指定编辑器的所有错误信息 */
  clearEditorErrors: (type: EditorType) => void;

  /** 性能监控 */
  /** 更新编辑器性能指标 */
  updatePerformanceMetrics: (metrics: Partial<EditorState['performance']>) => void;

  /** 编辑器操作 */
  /** 格式化指定编辑器的代码 */
  formatCode: (type: EditorType) => void;
  /** 在指定编辑器中插入文本 */
  insertText: (type: EditorType, text: string) => void;
  /** 替换指定编辑器的选中文本 */
  replaceSelection: (type: EditorType, text: string) => void;

  /** 重置和清理 */
  /** 重置指定编辑器到初始状态 */
  resetEditor: (type: EditorType) => void;
  /** 重置所有编辑器到初始状态 */
  resetAllEditors: () => void;

  /** 模板代码管理 */
  /** 根据语言获取模板代码 */
  getTemplateCode: (language: Language) => string;
  /** 切换语言并加载对应的模板代码 */
  switchLanguageWithTemplate: (type: EditorType, language: Language) => void;
}

/** 编辑器 Store 类型 - 状态和操作的组合 */
type EditorStore = EditorState & EditorActions;

/**
 * 编辑器初始状态
 * 定义编辑器的默认配置和初始值
 */
const initialState: EditorState = {
  configs: {
    markup: { ...DEFAULT_EDITOR_CONFIG, language: 'html' },
    style: { ...DEFAULT_EDITOR_CONFIG, language: 'css' },
    script: { ...DEFAULT_EDITOR_CONFIG, language: 'javascript' }
  },
  isLoaded: false,
  isLoading: false,
  loadError: null,
  activeEditor: 'script',
  contents: (() => {
    const defaultContent = templateService.getDefaultContent();
    return {
      markup: defaultContent.markup,
      style: defaultContent.style,
      script: defaultContent.script
    };
  })(),
  selections: {
    markup: null,
    style: null,
    script: null
  },
  focusedEditor: null,
  visibility: {
    markup: true,
    style: true,
    script: true
  },
  sizes: {
    markup: { width: 0, height: 0 },
    style: { width: 0, height: 0 },
    script: { width: 0, height: 0 }
  },
  errors: {
    markup: [],
    style: [],
    script: []
  },
  performance: {
    loadTime: 0,
    lastUpdateTime: 0,
    updateCount: 0
  },
  getTemplateCode: (language) => {
    return templateService.getTemplate(language);
  }
};

/**
 * 编辑器 Store Hook
 * 使用 Zustand 创建的编辑器状态管理 Hook
 * 包含编辑器的所有状态和操作方法
 */
export const useEditorStore = create<EditorStore>()(
  devtools(
    (set, get) => ({
        ...initialState,

        /** 编辑器配置管理 */
        setEditorConfig: (type, config) => {
          set((state) => ({
            configs: {
              ...state.configs,
              [type]: { ...state.configs[type], ...config }
            }
          }), false, `setEditorConfig/${type}`);
        },

        setAllEditorConfigs: (configs) => {
          set((state) => ({
            configs: {
              ...state.configs,
              ...Object.fromEntries(
                Object.entries(configs).map(([type, config]) => [
                  type,
                  { ...state.configs[type as EditorType], ...config }
                ])
              )
            }
          }), false, 'setAllEditorConfigs');
        },

        resetEditorConfig: (type) => {
          set((state) => ({
            configs: {
              ...state.configs,
              [type]: { ...DEFAULT_EDITOR_CONFIG, language: state.configs[type].language }
            }
          }), false, `resetEditorConfig/${type}`);
        },

        /** 编辑器语言管理 */
        setEditorLanguage: (type, language) => {
          set((state) => ({
            configs: {
              ...state.configs,
              [type]: { ...state.configs[type], language }
            }
          }), false, `setEditorLanguage/${type}/${language}`);
        },

        /** 编辑器主题管理 */
        setEditorTheme: (theme) => {
          set((state) => ({
            configs: {
              markup: { ...state.configs.markup, theme },
              style: { ...state.configs.style, theme },
              script: { ...state.configs.script, theme }
            }
          }), false, `setEditorTheme/${theme}`);
        },

        /** 编辑器内容管理 */
        setEditorContent: (type, content) => {
          set((state) => ({
            contents: { ...state.contents, [type]: content },
            performance: {
              ...state.performance,
              lastUpdateTime: Date.now(),
              updateCount: state.performance.updateCount + 1
            }
          }), false, `setEditorContent/${type}`);
        },

        setAllEditorContents: (contents) => {
          set((state) => ({
            contents: { ...state.contents, ...contents },
            performance: {
              ...state.performance,
              lastUpdateTime: Date.now(),
              updateCount: state.performance.updateCount + 1
            }
          }), false, 'setAllEditorContents');
        },

        /** 编辑器状态管理 */
        setEditorLoading: (isLoading) => {
          set({ isLoading }, false, `setEditorLoading/${isLoading}`);
        },

        setEditorLoaded: (isLoaded) => {
          set((state) => ({
            isLoaded,
            performance: isLoaded ? {
              ...state.performance,
              loadTime: Date.now()
            } : state.performance
          }), false, `setEditorLoaded/${isLoaded}`);
        },

        setEditorError: (loadError) => {
          set({ loadError }, false, 'setEditorError');
        },

        /** 编辑器焦点和选择管理 */
        setActiveEditor: (activeEditor) => {
          set({ activeEditor }, false, `setActiveEditor/${activeEditor}`);
        },

        setFocusedEditor: (focusedEditor) => {
          set({ focusedEditor }, false, `setFocusedEditor/${focusedEditor}`);
        },

        setEditorSelection: (type, selection) => {
          set((state) => ({
            selections: { ...state.selections, [type]: selection }
          }), false, `setEditorSelection/${type}`);
        },

        /** 编辑器可见性管理 */
        setEditorVisibility: (type, visible) => {
          set((state) => ({
            visibility: { ...state.visibility, [type]: visible }
          }), false, `setEditorVisibility/${type}/${visible}`);
        },

        toggleEditorVisibility: (type) => {
          set((state) => ({
            visibility: { ...state.visibility, [type]: !state.visibility[type] }
          }), false, `toggleEditorVisibility/${type}`);
        },

        /** 编辑器尺寸管理 */
        setEditorSize: (type, size) => {
          set((state) => ({
            sizes: { ...state.sizes, [type]: size }
          }), false, `setEditorSize/${type}`);
        },

        /** 编辑器错误管理 */
        addEditorError: (type, error) => {
          set((state) => ({
            errors: {
              ...state.errors,
              [type]: [...state.errors[type], error]
            }
          }), false, `addEditorError/${type}`);
        },

        removeEditorError: (type, error) => {
          set((state) => ({
            errors: {
              ...state.errors,
              [type]: state.errors[type].filter(e => e !== error)
            }
          }), false, `removeEditorError/${type}`);
        },

        clearEditorErrors: (type) => {
          set((state) => ({
            errors: { ...state.errors, [type]: [] }
          }), false, `clearEditorErrors/${type}`);
        },

        /** 性能监控 */
        updatePerformanceMetrics: (metrics) => {
          set((state) => ({
            performance: { ...state.performance, ...metrics }
          }), false, 'updatePerformanceMetrics');
        },

        /** 编辑器操作 */
        formatCode: (type) => {
          /** 调用 Monaco Editor 的格式化功能 */
          console.log(`[EditorStore] 格式化代码: ${type}`);
        },

        insertText: (type, text) => {
          /** 调用 Monaco Editor 的插入文本功能 */
          console.log(`[EditorStore] 插入文本: ${type}`, text);
        },

        replaceSelection: (type, text) => {
          /** 调用 Monaco Editor 的替换选择功能 */
          console.log(`[EditorStore] 替换选择: ${type}`, text);
        },

        /** 重置和清理 */
        resetEditor: (type) => {
          set((state) => {
            const newContents = { ...state.contents };
            const newConfigs = { ...state.configs };
            const language = newConfigs[type].language;

            /** 重置为该语言的模板代码 */
            newContents[type] = templateService.getTemplate(language);
            newConfigs[type] = { ...DEFAULT_EDITOR_CONFIG, language };

            return {
              contents: newContents,
              configs: newConfigs,
              selections: { ...state.selections, [type]: null },
              errors: { ...state.errors, [type]: [] }
            };
          }, false, `resetEditor/${type}`);
        },

        resetAllEditors: () => {
          const defaultContent = templateService.getDefaultContent();
          set({
            configs: {
              markup: { ...DEFAULT_EDITOR_CONFIG, language: 'html' },
              style: { ...DEFAULT_EDITOR_CONFIG, language: 'css' },
              script: { ...DEFAULT_EDITOR_CONFIG, language: 'javascript' }
            },
            contents: {
              markup: defaultContent.markup,
              style: defaultContent.style,
              script: defaultContent.script
            },
            selections: {
              markup: null,
              style: null,
              script: null
            },
            errors: {
              markup: [],
              style: [],
              script: []
            }
          }, false, 'resetAllEditors');
        },

        /** 模板代码管理 */
        getTemplateCode: (language) => {
          return templateService.getTemplate(language);
        },

        /** 切换语言并加载示例代码 */
        switchLanguageWithTemplate: (type: EditorType, language: Language) => {
          const { setEditorLanguage, setEditorContent, getTemplateCode } = get();

          /** 设置新语言 */
          setEditorLanguage(type, language);

          /** 加载该语言的模板代码 */
          const templateCode = getTemplateCode(language);
          setEditorContent(type, templateCode);
        }
    }),
    { name: 'editor-store' }
  )
);
