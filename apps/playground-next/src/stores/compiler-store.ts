import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { CompileResult, EditorType, Language } from '@/types';

interface CompilerState {
  // 编译状态
  isCompiling: boolean;
  compilingTypes: Set<EditorType>;
  
  // 编译结果
  results: Record<EditorType, CompileResult>;
  
  // 编译器加载状态
  loadedCompilers: Set<Language>;
  loadingCompilers: Set<Language>;
  compilerErrors: Record<Language, string>;
  
  // 编译历史
  compileHistory: Array<{
    id: string;
    timestamp: number;
    type: EditorType;
    language: Language;
    success: boolean;
    duration: number;
    error?: string;
  }>;
  
  // 编译配置
  autoCompile: boolean;
  compileDelay: number;
  
  // 性能指标
  performance: {
    totalCompiles: number;
    successfulCompiles: number;
    failedCompiles: number;
    averageCompileTime: number;
    lastCompileTime: number;
  };
}

interface CompilerActions {
  // 编译控制
  startCompile: (type: EditorType) => void;
  finishCompile: (type: EditorType, result: CompileResult) => void;
  setCompiling: (isCompiling: boolean) => void;
  
  // 编译结果
  setCompileResult: (type: EditorType, result: CompileResult) => void;
  clearCompileResult: (type: EditorType) => void;
  clearAllCompileResults: () => void;
  
  // 编译器加载
  setCompilerLoading: (language: Language, loading: boolean) => void;
  setCompilerLoaded: (language: Language, loaded: boolean) => void;
  setCompilerError: (language: Language, error: string) => void;
  clearCompilerError: (language: Language) => void;
  
  // 编译配置
  setAutoCompile: (autoCompile: boolean) => void;
  setCompileDelay: (delay: number) => void;
  
  // 编译历史
  addCompileHistory: (entry: Omit<CompilerState['compileHistory'][0], 'id' | 'timestamp'>) => void;
  clearCompileHistory: () => void;
  
  // 性能监控
  updatePerformanceMetrics: (metrics: Partial<CompilerState['performance']>) => void;
  
  // 批量操作
  compileAll: () => Promise<void>;
  resetCompiler: () => void;
  
  // 统计信息
  getCompilerStats: () => {
    totalCompilers: number;
    loadedCompilers: number;
    loadingCompilers: number;
    errorCompilers: number;
    compileSuccessRate: number;
  };
}

type CompilerStore = CompilerState & CompilerActions;

const initialState: CompilerState = {
  isCompiling: false,
  compilingTypes: new Set(),
  results: {
    markup: { code: '' },
    style: { code: '' },
    script: { code: '' }
  },
  loadedCompilers: new Set(),
  loadingCompilers: new Set(),
  compilerErrors: {
    html: '',
    markdown: '',
    css: '',
    scss: '',
    less: '',
    javascript: '',
    typescript: '',
    python: '',
    go: '',
    php: '',
    java: ''
  },
  compileHistory: [],
  autoCompile: false,
  compileDelay: 1000,
  performance: {
    totalCompiles: 0,
    successfulCompiles: 0,
    failedCompiles: 0,
    averageCompileTime: 0,
    lastCompileTime: 0
  }
};

export const useCompilerStore = create<CompilerStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // 编译控制
      startCompile: (type) => {
        const startTime = Date.now();
        
        set((state) => ({
          compilingTypes: new Set([...state.compilingTypes, type]),
          isCompiling: true,
          performance: {
            ...state.performance,
            lastCompileTime: startTime
          }
        }), false, `startCompile/${type}`);
      },
      
      finishCompile: (type, result) => {
        const endTime = Date.now();
        const { performance, compilingTypes } = get();
        const duration = endTime - performance.lastCompileTime;
        
        // 更新编译状态
        const newCompilingTypes = new Set(compilingTypes);
        newCompilingTypes.delete(type);
        
        set((state) => ({
          compilingTypes: newCompilingTypes,
          isCompiling: newCompilingTypes.size > 0,
          results: { ...state.results, [type]: result },
          performance: {
            ...state.performance,
            totalCompiles: state.performance.totalCompiles + 1,
            successfulCompiles: result.error ? state.performance.successfulCompiles : state.performance.successfulCompiles + 1,
            failedCompiles: result.error ? state.performance.failedCompiles + 1 : state.performance.failedCompiles,
            averageCompileTime: (state.performance.averageCompileTime * state.performance.totalCompiles + duration) / (state.performance.totalCompiles + 1)
          }
        }), false, `finishCompile/${type}`);
        
        // 添加到历史记录
        get().addCompileHistory({
          type,
          language: 'javascript', // 这里应该从编辑器状态获取
          success: !result.error,
          duration,
          error: result.error
        });
      },
      
      setCompiling: (isCompiling) => {
        set({ isCompiling }, false, `setCompiling/${isCompiling}`);
      },
      
      // 编译结果
      setCompileResult: (type, result) => {
        set((state) => ({
          results: { ...state.results, [type]: result }
        }), false, `setCompileResult/${type}`);
      },
      
      clearCompileResult: (type) => {
        set((state) => ({
          results: { ...state.results, [type]: { code: '' } }
        }), false, `clearCompileResult/${type}`);
      },
      
      clearAllCompileResults: () => {
        set({
          results: {
            markup: { code: '' },
            style: { code: '' },
            script: { code: '' }
          }
        }, false, 'clearAllCompileResults');
      },
      
      // 编译器加载
      setCompilerLoading: (language, loading) => {
        set((state) => {
          const newLoadingCompilers = new Set(state.loadingCompilers);
          if (loading) {
            newLoadingCompilers.add(language);
          } else {
            newLoadingCompilers.delete(language);
          }
          return { loadingCompilers: newLoadingCompilers };
        }, false, `setCompilerLoading/${language}/${loading}`);
      },
      
      setCompilerLoaded: (language, loaded) => {
        set((state) => {
          const newLoadedCompilers = new Set(state.loadedCompilers);
          const newLoadingCompilers = new Set(state.loadingCompilers);
          
          if (loaded) {
            newLoadedCompilers.add(language);
            newLoadingCompilers.delete(language);
          } else {
            newLoadedCompilers.delete(language);
          }
          
          return {
            loadedCompilers: newLoadedCompilers,
            loadingCompilers: newLoadingCompilers
          };
        }, false, `setCompilerLoaded/${language}/${loaded}`);
      },
      
      setCompilerError: (language, error) => {
        set((state) => ({
          compilerErrors: { ...state.compilerErrors, [language]: error },
          loadingCompilers: new Set([...state.loadingCompilers].filter(l => l !== language))
        }), false, `setCompilerError/${language}`);
      },
      
      clearCompilerError: (language) => {
        set((state) => {
          const newErrors = { ...state.compilerErrors };
          delete newErrors[language];
          return { compilerErrors: newErrors };
        }, false, `clearCompilerError/${language}`);
      },
      
      // 编译配置
      setAutoCompile: (autoCompile) => {
        set({ autoCompile }, false, `setAutoCompile/${autoCompile}`);
      },
      
      setCompileDelay: (compileDelay) => {
        set({ compileDelay }, false, `setCompileDelay/${compileDelay}`);
      },
      
      // 编译历史
      addCompileHistory: (entry) => {
        const newEntry = {
          ...entry,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: Date.now()
        };
        
        set((state) => ({
          compileHistory: [newEntry, ...state.compileHistory].slice(0, 100) // 保留最近100条记录
        }), false, 'addCompileHistory');
      },
      
      clearCompileHistory: () => {
        set({ compileHistory: [] }, false, 'clearCompileHistory');
      },
      
      // 性能监控
      updatePerformanceMetrics: (metrics) => {
        set((state) => ({
          performance: { ...state.performance, ...metrics }
        }), false, 'updatePerformanceMetrics');
      },

      
      resetCompiler: () => {
        set(initialState, false, 'resetCompiler');
      },
    }),
    { name: 'compiler-store' }
  )
);
