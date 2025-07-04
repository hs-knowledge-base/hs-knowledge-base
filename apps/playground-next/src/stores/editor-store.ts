import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { EditorConfig, EditorType, Language } from '@/types';
import { DEFAULT_EDITOR_CONFIG, STORAGE_KEYS } from '@/constants';

interface EditorState {
  // 编辑器配置
  configs: Record<EditorType, EditorConfig>;
  
  // 编辑器实例状态
  isLoaded: boolean;
  isLoading: boolean;
  loadError: string | null;
  
  // 当前活动的编辑器
  activeEditor: EditorType;
  
  // 编辑器内容
  contents: Record<EditorType, string>;
  
  // 编辑器选择状态
  selections: Record<EditorType, { start: number; end: number } | null>;
  
  // 编辑器焦点状态
  focusedEditor: EditorType | null;
  
  // 编辑器可见性
  visibility: Record<EditorType, boolean>;
  
  // 编辑器尺寸
  sizes: Record<EditorType, { width: number; height: number }>;
  
  // 编辑器错误状态
  errors: Record<EditorType, string[]>;
  
  // 编辑器性能指标
  performance: {
    loadTime: number;
    lastUpdateTime: number;
    updateCount: number;
  };
}

interface EditorActions {
  // 编辑器配置
  setEditorConfig: (type: EditorType, config: Partial<EditorConfig>) => void;
  setAllEditorConfigs: (configs: Partial<Record<EditorType, EditorConfig>>) => void;
  resetEditorConfig: (type: EditorType) => void;
  
  // 编辑器语言
  setEditorLanguage: (type: EditorType, language: Language) => void;
  
  // 编辑器主题
  setEditorTheme: (theme: 'vs-dark' | 'vs-light') => void;
  
  // 编辑器内容
  setEditorContent: (type: EditorType, content: string) => void;
  setAllEditorContents: (contents: Partial<Record<EditorType, string>>) => void;
  
  // 编辑器状态
  setEditorLoading: (isLoading: boolean) => void;
  setEditorLoaded: (isLoaded: boolean) => void;
  setEditorError: (error: string | null) => void;
  
  // 编辑器焦点和选择
  setActiveEditor: (type: EditorType) => void;
  setFocusedEditor: (type: EditorType | null) => void;
  setEditorSelection: (type: EditorType, selection: { start: number; end: number } | null) => void;
  
  // 编辑器可见性
  setEditorVisibility: (type: EditorType, visible: boolean) => void;
  toggleEditorVisibility: (type: EditorType) => void;
  
  // 编辑器尺寸
  setEditorSize: (type: EditorType, size: { width: number; height: number }) => void;
  
  // 编辑器错误
  addEditorError: (type: EditorType, error: string) => void;
  removeEditorError: (type: EditorType, error: string) => void;
  clearEditorErrors: (type: EditorType) => void;
  
  // 性能监控
  updatePerformanceMetrics: (metrics: Partial<EditorState['performance']>) => void;
  
  // 编辑器操作
  formatCode: (type: EditorType) => void;
  insertText: (type: EditorType, text: string) => void;
  replaceSelection: (type: EditorType, text: string) => void;
  
  // 重置和清理
  resetEditor: (type: EditorType) => void;
  resetAllEditors: () => void;
}

type EditorStore = EditorState & EditorActions;

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
  contents: {
    markup: '',
    style: '',
    script: ''
  },
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
  }
};

export const useEditorStore = create<EditorStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // 编辑器配置
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
        
        // 编辑器语言
        setEditorLanguage: (type, language) => {
          set((state) => ({
            configs: {
              ...state.configs,
              [type]: { ...state.configs[type], language }
            }
          }), false, `setEditorLanguage/${type}/${language}`);
        },
        
        // 编辑器主题
        setEditorTheme: (theme) => {
          set((state) => ({
            configs: {
              markup: { ...state.configs.markup, theme },
              style: { ...state.configs.style, theme },
              script: { ...state.configs.script, theme }
            }
          }), false, `setEditorTheme/${theme}`);
        },
        
        // 编辑器内容
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
        
        // 编辑器状态
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
        
        // 编辑器焦点和选择
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
        
        // 编辑器可见性
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
        
        // 编辑器尺寸
        setEditorSize: (type, size) => {
          set((state) => ({
            sizes: { ...state.sizes, [type]: size }
          }), false, `setEditorSize/${type}`);
        },
        
        // 编辑器错误
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
        
        // 性能监控
        updatePerformanceMetrics: (metrics) => {
          set((state) => ({
            performance: { ...state.performance, ...metrics }
          }), false, 'updatePerformanceMetrics');
        },
        
        // 编辑器操作
        formatCode: (type) => {
          // 这里会调用 Monaco Editor 的格式化功能
          console.log(`[EditorStore] 格式化代码: ${type}`);
        },
        
        insertText: (type, text) => {
          // 这里会调用 Monaco Editor 的插入文本功能
          console.log(`[EditorStore] 插入文本: ${type}`, text);
        },
        
        replaceSelection: (type, text) => {
          // 这里会调用 Monaco Editor 的替换选择功能
          console.log(`[EditorStore] 替换选择: ${type}`, text);
        },
        
        // 重置和清理
        resetEditor: (type) => {
          set((state) => ({
            contents: { ...state.contents, [type]: '' },
            selections: { ...state.selections, [type]: null },
            errors: { ...state.errors, [type]: [] },
            configs: {
              ...state.configs,
              [type]: { ...DEFAULT_EDITOR_CONFIG, language: state.configs[type].language }
            }
          }), false, `resetEditor/${type}`);
        },
        
        resetAllEditors: () => {
          set({
            ...initialState,
            configs: {
              markup: { ...DEFAULT_EDITOR_CONFIG, language: 'html' },
              style: { ...DEFAULT_EDITOR_CONFIG, language: 'css' },
              script: { ...DEFAULT_EDITOR_CONFIG, language: 'javascript' }
            }
          }, false, 'resetAllEditors');
        }
      }),
      {
        name: STORAGE_KEYS.SETTINGS + '_editor',
        partialize: (state) => ({
          configs: state.configs,
          activeEditor: state.activeEditor,
          visibility: state.visibility,
          contents: state.contents
        })
      }
    ),
    { name: 'editor-store' }
  )
);
