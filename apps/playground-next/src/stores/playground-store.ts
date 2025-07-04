import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { 
  CodeContent, 
  CompilerConfig, 
  RunStatus, 
  ConsoleMessage,
  CompileResult,
  EditorType,
  Language
} from '@/types';
import { DEFAULT_CODE, DEFAULT_EDITOR_CONFIG, STORAGE_KEYS } from '@/constants';

interface PlaygroundState {
  // 代码内容
  code: CodeContent;
  
  // 编译器配置
  config: CompilerConfig;
  
  // 运行状态
  runStatus: RunStatus;
  
  // 控制台消息
  consoleMessages: ConsoleMessage[];
  
  // 编译结果
  compileResults: Record<EditorType, CompileResult>;
  
  // 是否显示编译结果
  showCompiledOutput: boolean;
  
  // 当前活动的编辑器
  activeEditor: EditorType;
  
  // 是否自动运行
  autoRun: boolean;
  
  // 运行延迟（毫秒）
  runDelay: number;
}

interface PlaygroundActions {
  // 代码操作
  setCode: (type: EditorType, code: string) => void;
  setAllCode: (code: CodeContent) => void;
  resetCode: () => void;
  
  // 语言配置
  setLanguage: (type: EditorType, language: Language) => void;
  
  // 运行控制
  setRunStatus: (status: RunStatus) => void;
  runCode: () => Promise<void>;
  
  // 控制台操作
  addConsoleMessage: (message: Omit<ConsoleMessage, 'id' | 'timestamp'>) => void;
  clearConsole: () => void;
  
  // 编译结果
  setCompileResult: (type: EditorType, result: CompileResult) => void;
  clearCompileResults: () => void;
  toggleCompiledOutput: () => void;
  
  // 编辑器操作
  setActiveEditor: (type: EditorType) => void;
  
  // 设置操作
  setAutoRun: (autoRun: boolean) => void;
  setRunDelay: (delay: number) => void;
  
  // 项目操作
  loadProject: (project: { code: CodeContent; config: CompilerConfig }) => void;
  exportProject: () => { code: CodeContent; config: CompilerConfig };
}

type PlaygroundStore = PlaygroundState & PlaygroundActions;

const initialState: PlaygroundState = {
  code: DEFAULT_CODE,
  config: {
    markup: { ...DEFAULT_EDITOR_CONFIG, language: 'html' },
    style: { ...DEFAULT_EDITOR_CONFIG, language: 'css' },
    script: { ...DEFAULT_EDITOR_CONFIG, language: 'javascript' }
  },
  runStatus: 'idle',
  consoleMessages: [],
  compileResults: {
    markup: { code: '' },
    style: { code: '' },
    script: { code: '' }
  },
  showCompiledOutput: false,
  activeEditor: 'script',
  autoRun: false,
  runDelay: 1000
};

export const usePlaygroundStore = create<PlaygroundStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // 代码操作
        setCode: (type, code) => {
          set((state) => ({
            code: { ...state.code, [type]: code }
          }), false, `setCode/${type}`);
          
          // 如果启用自动运行，延迟执行
          const { autoRun, runDelay } = get();
          if (autoRun) {
            setTimeout(() => {
              get().runCode();
            }, runDelay);
          }
        },
        
        setAllCode: (code) => {
          set({ code }, false, 'setAllCode');
        },
        
        resetCode: () => {
          set({ code: DEFAULT_CODE }, false, 'resetCode');
        },
        
        // 语言配置
        setLanguage: (type, language) => {
          set((state) => ({
            config: {
              ...state.config,
              [type]: { ...state.config[type], language }
            }
          }), false, `setLanguage/${type}/${language}`);
        },
        
        // 运行控制
        setRunStatus: (runStatus) => {
          set({ runStatus }, false, `setRunStatus/${runStatus}`);
        },
        
        runCode: async () => {
          const { code, config } = get();
          
          try {
            set({ runStatus: 'compiling' }, false, 'runCode/start');
            
            // 清空之前的结果
            get().clearConsole();
            get().clearCompileResults();
            
            // 这里会调用编译器服务
            // 暂时模拟编译过程
            await new Promise(resolve => setTimeout(resolve, 500));
            
            set({ runStatus: 'running' }, false, 'runCode/running');
            
            // 模拟运行过程
            await new Promise(resolve => setTimeout(resolve, 300));
            
            set({ runStatus: 'success' }, false, 'runCode/success');
            
            // 添加成功消息
            get().addConsoleMessage({
              type: 'log',
              message: '代码运行成功！'
            });
            
          } catch (error) {
            set({ runStatus: 'error' }, false, 'runCode/error');
            
            get().addConsoleMessage({
              type: 'error',
              message: error instanceof Error ? error.message : '运行失败'
            });
          }
        },
        
        // 控制台操作
        addConsoleMessage: (message) => {
          const newMessage: ConsoleMessage = {
            ...message,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: Date.now()
          };
          
          set((state) => ({
            consoleMessages: [...state.consoleMessages, newMessage]
          }), false, 'addConsoleMessage');
        },
        
        clearConsole: () => {
          set({ consoleMessages: [] }, false, 'clearConsole');
        },
        
        // 编译结果
        setCompileResult: (type, result) => {
          set((state) => ({
            compileResults: { ...state.compileResults, [type]: result }
          }), false, `setCompileResult/${type}`);
        },
        
        clearCompileResults: () => {
          set({
            compileResults: {
              markup: { code: '' },
              style: { code: '' },
              script: { code: '' }
            }
          }, false, 'clearCompileResults');
        },
        
        toggleCompiledOutput: () => {
          set((state) => ({
            showCompiledOutput: !state.showCompiledOutput
          }), false, 'toggleCompiledOutput');
        },
        
        // 编辑器操作
        setActiveEditor: (activeEditor) => {
          set({ activeEditor }, false, `setActiveEditor/${activeEditor}`);
        },
        
        // 设置操作
        setAutoRun: (autoRun) => {
          set({ autoRun }, false, `setAutoRun/${autoRun}`);
        },
        
        setRunDelay: (runDelay) => {
          set({ runDelay }, false, `setRunDelay/${runDelay}`);
        },
        
        // 项目操作
        loadProject: (project) => {
          set({
            code: project.code,
            config: project.config
          }, false, 'loadProject');
        },
        
        exportProject: () => {
          const { code, config } = get();
          return { code, config };
        }
      }),
      {
        name: STORAGE_KEYS.PROJECT,
        partialize: (state) => ({
          code: state.code,
          config: state.config,
          autoRun: state.autoRun,
          runDelay: state.runDelay,
          showCompiledOutput: state.showCompiledOutput
        })
      }
    ),
    { name: 'playground-store' }
  )
);
