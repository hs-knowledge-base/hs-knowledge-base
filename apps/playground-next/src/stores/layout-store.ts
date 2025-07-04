import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { LayoutConfig } from '@/types';
import { DEFAULT_LAYOUT_CONFIG, STORAGE_KEYS, BREAKPOINTS } from '@/constants';

interface LayoutState {
  // 布局配置
  config: LayoutConfig;
  
  // 响应式状态
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // 面板状态
  isLeftPanelCollapsed: boolean;
  isRightPanelCollapsed: boolean;
  isBottomPanelCollapsed: boolean;
  
  // 全屏状态
  isFullscreen: boolean;
  
  // 当前活动的结果标签
  activeResultTab: 'preview' | 'console' | 'compiled';
  
  // 面板尺寸
  leftPanelWidth: number;
  rightPanelWidth: number;
  bottomPanelHeight: number;
  
  // 是否正在调整大小
  isResizing: boolean;
}

interface LayoutActions {
  // 布局配置
  setLayoutConfig: (config: Partial<LayoutConfig>) => void;
  setDirection: (direction: 'horizontal' | 'vertical') => void;
  setEditorWidth: (width: number) => void;
  setResultWidth: (width: number) => void;
  
  // 面板显示控制
  togglePreview: () => void;
  toggleConsole: () => void;
  toggleCompiled: () => void;
  
  // 面板折叠控制
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleBottomPanel: () => void;
  
  // 全屏控制
  toggleFullscreen: () => void;
  enterFullscreen: () => void;
  exitFullscreen: () => void;
  
  // 结果标签切换
  setActiveResultTab: (tab: 'preview' | 'console' | 'compiled') => void;
  
  // 面板尺寸调整
  setLeftPanelWidth: (width: number) => void;
  setRightPanelWidth: (width: number) => void;
  setBottomPanelHeight: (height: number) => void;
  
  // 响应式处理
  updateScreenSize: (width: number) => void;
  
  // 调整大小状态
  setResizing: (isResizing: boolean) => void;
  
  // 重置布局
  resetLayout: () => void;
  
  // 预设布局
  applyPreset: (preset: 'default' | 'mobile' | 'focus' | 'debug') => void;
}

type LayoutStore = LayoutState & LayoutActions;

const initialState: LayoutState = {
  config: DEFAULT_LAYOUT_CONFIG,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isLeftPanelCollapsed: false,
  isRightPanelCollapsed: false,
  isBottomPanelCollapsed: false,
  isFullscreen: false,
  activeResultTab: 'preview',
  leftPanelWidth: 320,
  rightPanelWidth: 320,
  bottomPanelHeight: 200,
  isResizing: false
};

export const useLayoutStore = create<LayoutStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // 布局配置
        setLayoutConfig: (newConfig) => {
          set((state) => ({
            config: { ...state.config, ...newConfig }
          }), false, 'setLayoutConfig');
        },
        
        setDirection: (direction) => {
          set((state) => ({
            config: { ...state.config, direction }
          }), false, `setDirection/${direction}`);
        },
        
        setEditorWidth: (editorWidth) => {
          set((state) => ({
            config: { ...state.config, editorWidth, resultWidth: 100 - editorWidth }
          }), false, `setEditorWidth/${editorWidth}`);
        },
        
        setResultWidth: (resultWidth) => {
          set((state) => ({
            config: { ...state.config, resultWidth, editorWidth: 100 - resultWidth }
          }), false, `setResultWidth/${resultWidth}`);
        },
        
        // 面板显示控制
        togglePreview: () => {
          set((state) => ({
            config: { ...state.config, showPreview: !state.config.showPreview }
          }), false, 'togglePreview');
        },
        
        toggleConsole: () => {
          set((state) => ({
            config: { ...state.config, showConsole: !state.config.showConsole }
          }), false, 'toggleConsole');
        },
        
        toggleCompiled: () => {
          set((state) => ({
            config: { ...state.config, showCompiled: !state.config.showCompiled }
          }), false, 'toggleCompiled');
        },
        
        // 面板折叠控制
        toggleLeftPanel: () => {
          set((state) => ({
            isLeftPanelCollapsed: !state.isLeftPanelCollapsed
          }), false, 'toggleLeftPanel');
        },
        
        toggleRightPanel: () => {
          set((state) => ({
            isRightPanelCollapsed: !state.isRightPanelCollapsed
          }), false, 'toggleRightPanel');
        },
        
        toggleBottomPanel: () => {
          set((state) => ({
            isBottomPanelCollapsed: !state.isBottomPanelCollapsed
          }), false, 'toggleBottomPanel');
        },
        
        // 全屏控制
        toggleFullscreen: () => {
          const { isFullscreen } = get();
          if (isFullscreen) {
            get().exitFullscreen();
          } else {
            get().enterFullscreen();
          }
        },
        
        enterFullscreen: () => {
          set({ isFullscreen: true }, false, 'enterFullscreen');
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
          }
        },
        
        exitFullscreen: () => {
          set({ isFullscreen: false }, false, 'exitFullscreen');
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        },
        
        // 结果标签切换
        setActiveResultTab: (activeResultTab) => {
          set({ activeResultTab }, false, `setActiveResultTab/${activeResultTab}`);
        },
        
        // 面板尺寸调整
        setLeftPanelWidth: (leftPanelWidth) => {
          set({ leftPanelWidth }, false, `setLeftPanelWidth/${leftPanelWidth}`);
        },
        
        setRightPanelWidth: (rightPanelWidth) => {
          set({ rightPanelWidth }, false, `setRightPanelWidth/${rightPanelWidth}`);
        },
        
        setBottomPanelHeight: (bottomPanelHeight) => {
          set({ bottomPanelHeight }, false, `setBottomPanelHeight/${bottomPanelHeight}`);
        },
        
        // 响应式处理
        updateScreenSize: (width) => {
          const isMobile = width < BREAKPOINTS.MD;
          const isTablet = width >= BREAKPOINTS.MD && width < BREAKPOINTS.LG;
          const isDesktop = width >= BREAKPOINTS.LG;
          
          set({ isMobile, isTablet, isDesktop }, false, 'updateScreenSize');
          
          // 移动端自动调整布局
          if (isMobile) {
            set((state) => ({
              config: {
                ...state.config,
                direction: 'vertical',
                editorWidth: 100,
                resultWidth: 100
              },
              isLeftPanelCollapsed: true,
              isRightPanelCollapsed: true
            }), false, 'updateScreenSize/mobile');
          }
        },
        
        // 调整大小状态
        setResizing: (isResizing) => {
          set({ isResizing }, false, `setResizing/${isResizing}`);
        },
        
        // 重置布局
        resetLayout: () => {
          set({
            config: DEFAULT_LAYOUT_CONFIG,
            isLeftPanelCollapsed: false,
            isRightPanelCollapsed: false,
            isBottomPanelCollapsed: false,
            leftPanelWidth: 320,
            rightPanelWidth: 320,
            bottomPanelHeight: 200
          }, false, 'resetLayout');
        },
        
        // 预设布局
        applyPreset: (preset) => {
          switch (preset) {
            case 'default':
              get().resetLayout();
              break;
              
            case 'mobile':
              set({
                config: {
                  ...get().config,
                  direction: 'vertical',
                  editorWidth: 100,
                  resultWidth: 100,
                  showPreview: true,
                  showConsole: true,
                  showCompiled: false
                },
                isLeftPanelCollapsed: true,
                isRightPanelCollapsed: true,
                activeResultTab: 'preview'
              }, false, 'applyPreset/mobile');
              break;
              
            case 'focus':
              set({
                config: {
                  ...get().config,
                  direction: 'horizontal',
                  editorWidth: 70,
                  resultWidth: 30,
                  showPreview: true,
                  showConsole: false,
                  showCompiled: false
                },
                isLeftPanelCollapsed: true,
                isRightPanelCollapsed: true,
                isBottomPanelCollapsed: true
              }, false, 'applyPreset/focus');
              break;
              
            case 'debug':
              set({
                config: {
                  ...get().config,
                  direction: 'horizontal',
                  editorWidth: 50,
                  resultWidth: 50,
                  showPreview: true,
                  showConsole: true,
                  showCompiled: true
                },
                isLeftPanelCollapsed: false,
                isRightPanelCollapsed: false,
                isBottomPanelCollapsed: false,
                activeResultTab: 'console'
              }, false, 'applyPreset/debug');
              break;
          }
        }
      }),
      {
        name: STORAGE_KEYS.SETTINGS + '_layout',
        partialize: (state) => ({
          config: state.config,
          leftPanelWidth: state.leftPanelWidth,
          rightPanelWidth: state.rightPanelWidth,
          bottomPanelHeight: state.bottomPanelHeight,
          activeResultTab: state.activeResultTab
        })
      }
    ),
    { name: 'layout-store' }
  )
);
