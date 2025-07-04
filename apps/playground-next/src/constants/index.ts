import type { Language, EditorConfig, LayoutConfig, Settings } from '@/types';

/** 支持的语言列表 */
export const SUPPORTED_LANGUAGES: Record<string, Language[]> = {
  markup: ['html', 'markdown'],
  style: ['css', 'scss', 'less'],
  script: ['javascript', 'typescript', 'python']
};

/** 语言显示名称 */
export const LANGUAGE_NAMES: Record<Language, string> = {
  html: 'HTML',
  markdown: 'Markdown',
  css: 'CSS',
  scss: 'SCSS',
  less: 'Less',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  json: 'JSON',
  xml: 'XML',
  yaml: 'YAML'
};

/** 语言文件扩展名 */
export const LANGUAGE_EXTENSIONS: Record<Language, string> = {
  html: '.html',
  markdown: '.md',
  css: '.css',
  scss: '.scss',
  less: '.less',
  javascript: '.js',
  typescript: '.ts',
  python: '.py',
  json: '.json',
  xml: '.xml',
  yaml: '.yaml'
};

/** 默认编辑器配置 */
export const DEFAULT_EDITOR_CONFIG: EditorConfig = {
  language: 'javascript',
  theme: 'vs-dark',
  fontSize: 14,
  wordWrap: true,
  minimap: false,
  lineNumbers: true
};

/** 默认布局配置 */
export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  direction: 'horizontal',
  editorWidth: 50,
  resultWidth: 50,
  showPreview: true,
  showConsole: true,
  showCompiled: false
};

/** 默认设置 */
export const DEFAULT_SETTINGS: Settings = {
  theme: {
    mode: 'dark',
    primary: '#006fee',
    secondary: '#808085',
    background: '#0d1117',
    foreground: '#e6edf3'
  },
  editor: {
    fontSize: 14,
    wordWrap: true,
    minimap: false,
    lineNumbers: true,
    autoSave: true
  },
  layout: DEFAULT_LAYOUT_CONFIG,
  compiler: {
    autoRun: false,
    delay: 1000
  }
};

/** 默认代码模板 */
export const DEFAULT_CODE = {
  markup: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Playground</title>
</head>
<body>
    <div id="app">
        <h1>Hello, World!</h1>
        <p>欢迎使用代码演练场！</p>
    </div>
</body>
</html>`,
  style: `body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    min-height: 100vh;
}

#app {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
    padding: 40px 20px;
}

h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

p {
    font-size: 1.2rem;
    opacity: 0.9;
}`,
  script: `console.log('🚀 代码演练场已启动！');

// 添加交互功能
document.addEventListener('DOMContentLoaded', function() {
    const app = document.getElementById('app');
    
    if (app) {
        const button = document.createElement('button');
        button.textContent = '点击我！';
        button.style.cssText = \`
            background: rgba(255,255,255,0.2);
            border: 2px solid white;
            color: white;
            padding: 12px 24px;
            font-size: 16px;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 20px;
            transition: all 0.3s ease;
        \`;
        
        button.addEventListener('click', function() {
            alert('Hello from Code Playground! 🎉');
            console.log('按钮被点击了！');
        });
        
        button.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(255,255,255,0.3)';
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(255,255,255,0.2)';
            this.style.transform = 'translateY(0)';
        });
        
        app.appendChild(button);
    }
});`
};

/** Monaco Editor 主题 */
export const MONACO_THEMES = {
  'vs-dark': 'vs-dark',
  'vs-light': 'vs'
};

/** CDN 配置 */
export const CDN_CONFIGS = {
  unpkg: {
    name: 'unpkg',
    baseUrl: 'https://unpkg.com',
    timeout: 10000,
    retries: 3
  },
  jsdelivr: {
    name: 'jsdelivr',
    baseUrl: 'https://cdn.jsdelivr.net/npm',
    timeout: 10000,
    retries: 3
  },
  cdnjs: {
    name: 'cdnjs',
    baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs',
    timeout: 10000,
    retries: 3
  }
};

/** 快捷键配置 */
export const KEYBOARD_SHORTCUTS = [
  { key: 'Ctrl+Enter', command: 'run', description: '运行代码' },
  { key: 'Ctrl+S', command: 'save', description: '保存项目' },
  { key: 'Ctrl+Shift+F', command: 'format', description: '格式化代码' },
  { key: 'F11', command: 'fullscreen', description: '切换全屏' },
  { key: 'Ctrl+/', command: 'comment', description: '切换注释' },
  { key: 'Ctrl+D', command: 'duplicate', description: '复制行' },
  { key: 'Alt+Up', command: 'move-up', description: '向上移动行' },
  { key: 'Alt+Down', command: 'move-down', description: '向下移动行' }
];

/** 错误消息 */
export const ERROR_MESSAGES = {
  MONACO_LOAD_FAILED: 'Monaco Editor 加载失败',
  COMPILER_LOAD_FAILED: '编译器加载失败',
  COMPILE_ERROR: '代码编译失败',
  RUNTIME_ERROR: '代码运行时错误',
  NETWORK_ERROR: '网络连接错误',
  UNKNOWN_ERROR: '未知错误'
};

/** 成功消息 */
export const SUCCESS_MESSAGES = {
  CODE_COMPILED: '代码编译成功',
  CODE_EXECUTED: '代码执行成功',
  PROJECT_SAVED: '项目保存成功',
  PROJECT_LOADED: '项目加载成功',
  SETTINGS_SAVED: '设置保存成功'
};

/** 本地存储键名 */
export const STORAGE_KEYS = {
  PROJECT: 'playground_project',
  SETTINGS: 'playground_settings',
  RECENT_PROJECTS: 'playground_recent_projects',
  USER_PREFERENCES: 'playground_user_preferences'
};

/** 事件名称 */
export const EVENT_NAMES = {
  CODE_CHANGE: 'code-change',
  LANGUAGE_CHANGE: 'language-change',
  RUN_CODE: 'run-code',
  COMPILE_COMPLETE: 'compile-complete',
  CONSOLE_MESSAGE: 'console-message',
  LAYOUT_CHANGE: 'layout-change',
  THEME_CHANGE: 'theme-change',
  SETTINGS_CHANGE: 'settings-change'
} as const;

/** 组件尺寸 */
export const COMPONENT_SIZES = {
  HEADER_HEIGHT: 60,
  SIDEBAR_WIDTH: 280,
  MIN_PANEL_WIDTH: 200,
  MIN_PANEL_HEIGHT: 150,
  TOOLBAR_HEIGHT: 40
};

/** 动画配置 */
export const ANIMATION_CONFIG = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out'
  }
};

/** 响应式断点 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
};

/** 颜色配置 */
export const COLORS = {
  PRIMARY: '#006fee',
  SECONDARY: '#808085',
  SUCCESS: '#17c964',
  WARNING: '#f5a524',
  DANGER: '#f31260',
  BACKGROUND: '#0d1117',
  FOREGROUND: '#e6edf3',
  BORDER: '#30363d'
};

/** 字体配置 */
export const FONTS = {
  MONO: ['Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'monospace'],
  SANS: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
};
