# LiveCodes 项目深度分析

## 📚 文档导航

本文档提供了 LiveCodes 项目的整体概览和架构分析。更详细的技术实现请参考以下专题文档：

### 🔧 核心模块详解
- **[编译器系统架构详解](./编译器系统架构详解.md)** - 深入解析如何支持 90+ 种语言的编译系统
- **[SDK设计架构详解](./SDK设计架构详解.md)** - 详细介绍多框架 SDK 的设计和实现
- **[语言支持机制详解](./语言支持机制详解.md)** - 全面分析语言支持的实现机制

### 📖 完整文档目录
- **[分析文档总览](./README.md)** - 查看所有分析文档的完整目录和学习路径

---

## 项目概述

LiveCodes 是一个功能丰富的开源客户端代码游乐场，支持 90+ 种编程语言和框架。它是一个完全在浏览器中运行的代码编辑器和执行环境，无需服务器配置，可以作为独立应用使用，也可以嵌入到任何网页中。

### 核心特点

- **客户端运行**：完全在浏览器中运行，无需服务器
- **多语言支持**：支持 90+ 种语言/框架/处理器
- **零配置**：无需安装、配置文件或构建步骤
- **强大的 SDK**：提供 JavaScript/TypeScript、React、Vue、Svelte 等多种 SDK
- **嵌入友好**：可轻松嵌入到任何网页中
- **隐私优先**：代码默认私有，存储在浏览器本地

## 技术架构

### 1. 整体架构设计

LiveCodes 采用模块化的架构设计，主要分为以下几个核心模块：

```
src/livecodes/
├── core.ts              # 核心初始化逻辑
├── main.ts              # 主入口文件
├── app.ts               # 应用入口
├── embed.ts             # 嵌入模式入口
├── compiler/            # 编译器系统
├── languages/           # 语言支持
├── editor/              # 编辑器集成
├── result/              # 结果页面
├── services/            # 外部服务
├── storage/             # 存储系统
├── UI/                  # 用户界面
└── sdk/                 # SDK 实现
```

### 2. 编译器系统架构

LiveCodes 的编译器系统是其核心创新之一，采用了灵活的插件化架构：

> 📖 **详细文档**: [编译器系统架构详解](./编译器系统架构详解.md)

#### 编译器接口设计
```typescript
export interface LanguageSpecs {
  name: Language;
  title: string;
  compiler: Compiler | Language;
  extensions: Language[];
  editor: EditorId;
  // ... 其他配置
}
```

#### 编译流程
1. **语言检测**：根据文件扩展名或用户选择确定语言
2. **编译器加载**：动态加载对应的编译器
3. **代码编译**：使用 Web Workers 进行编译
4. **后处理**：应用处理器（如 PostCSS、Babel 等）
5. **结果输出**：生成可执行的代码

#### 支持的编译方式
- **在线编译器**：如 TypeScript、Babel、Sass 等
- **WebAssembly**：如 Python、Ruby、PHP 等
- **解释执行**：如 JavaScript、HTML、CSS
- **转译器**：如 CoffeeScript、LiveScript 等

### 3. 语言支持机制

LiveCodes 通过统一的语言规范支持 90+ 种语言：

> 📖 **详细文档**: [语言支持机制详解](./语言支持机制详解.md)

#### 语言定义示例
```typescript
export const typescript: LanguageSpecs = {
  name: 'typescript',
  title: 'TS',
  longTitle: 'TypeScript',
  compiler: {
    url: typescriptUrl,
    factory: () => async (code, { config }) =>
      (window as any).ts.transpile(code, {
        ...typescriptOptions,
        ...getLanguageCustomSettings('typescript', config),
      }),
  },
  extensions: ['ts', 'typescript'],
  editor: 'script',
};
```

#### 编译器类型
1. **JavaScript 编译器**：直接在浏览器中运行
2. **WebAssembly 编译器**：编译为 WASM 运行
3. **Web Workers 编译器**：在后台线程中编译
4. **外部服务编译器**：调用外部 API 编译

### 4. SDK 设计架构

LiveCodes 提供了强大的 SDK，支持多种前端框架：

> 📖 **详细文档**: [SDK设计架构详解](./SDK设计架构详解.md)

#### 核心 SDK 接口
```typescript
export interface API {
  run: () => Promise<void>;
  format: (allEditors?: boolean) => Promise<void>;
  getShareUrl: (shortUrl?: boolean) => Promise<string>;
  getConfig: (contentOnly?: boolean) => Promise<Config>;
  setConfig: (config: Partial<Config>) => Promise<Config>;
  getCode: () => Promise<Code>;
  show: (panel: string, options?: any) => Promise<void>;
  runTests: () => Promise<{ results: TestResult[] }>;
  watch: WatchFn;
  exec: (command: APICommands, ...args: any[]) => Promise<any>;
  destroy: () => Promise<void>;
}
```

#### 通信机制
- **PostMessage API**：iframe 与父页面通信
- **事件系统**：基于发布-订阅模式
- **Promise 封装**：异步操作的统一处理

#### 框架集成
1. **React 组件**
```jsx
import LiveCodes from 'livecodes/react';

const Playground = () => (
  <LiveCodes 
    config={config} 
    view="result" 
    onSdkReady={(playground) => {
      // SDK 就绪回调
    }}
  />
);
```

2. **Vue 组件**
```vue
<template>
  <LiveCodes :config="config" view="result" />
</template>

<script setup>
import LiveCodes from 'livecodes/vue';
</script>
```

## 核心功能模块

### 1. 编辑器集成

LiveCodes 集成了多种代码编辑器：

- **Monaco Editor**：VS Code 的编辑器核心
- **CodeMirror**：轻量级代码编辑器
- **CodeJar**：极简代码编辑器
- **Blockly**：可视化编程编辑器
- **Quill**：富文本编辑器

### 2. 结果页面系统

结果页面系统负责执行和显示代码运行结果：

- **沙箱执行**：在 iframe 中安全执行代码
- **实时预览**：代码变更时自动更新结果
- **错误处理**：捕获和显示运行时错误
- **控制台集成**：显示 console 输出

### 3. 存储系统

- **本地存储**：使用 IndexedDB 存储项目
- **云同步**：支持 GitHub 集成
- **导入导出**：支持多种格式的项目导入导出
- **模板系统**：内置和用户自定义模板

### 4. 服务集成

- **GitHub 集成**：项目同步、Gist 导入导出
- **CDN 服务**：模块和资源加载
- **分享服务**：生成分享链接
- **部署服务**：一键部署到多个平台

## 技术栈选择

### 前端技术
- **TypeScript**：类型安全的 JavaScript
- **ESBuild**：快速的构建工具
- **SCSS**：CSS 预处理器
- **Web Workers**：后台编译处理

### 编辑器技术
- **Monaco Editor**：提供 VS Code 级别的编辑体验
- **CodeMirror 6**：现代化的代码编辑器
- **Prism.js**：语法高亮

### 编译技术
- **Babel**：JavaScript 转译
- **TypeScript Compiler**：TypeScript 编译
- **WebAssembly**：高性能语言运行时
- **PostCSS**：CSS 后处理

### 构建和部署
- **ESBuild**：快速构建
- **GitHub Actions**：CI/CD
- **Cloudflare Pages**：静态站点托管
- **jsDelivr**：CDN 服务

## 项目创新点

### 1. 客户端编译架构
- 完全在浏览器中运行，无需服务器
- 支持 90+ 种语言的客户端编译
- WebAssembly 集成实现高性能语言支持

### 2. 模块化语言支持
- 统一的语言规范接口
- 动态加载编译器
- 可扩展的语言插件系统

### 3. 强大的 SDK 设计
- 框架无关的核心 SDK
- 多框架组件封装
- 完善的事件系统和通信机制

### 4. 嵌入式设计
- 轻量级嵌入模式
- 灵活的配置选项
- 无缝集成到任何网页

### 5. 开发者体验
- 零配置启动
- 实时预览
- 丰富的模板库
- 完善的文档和示例

## 开发和构建流程

### 开发环境
```bash
npm start          # 启动开发服务器
npm run docs       # 启动文档服务器
npm run storybook  # 启动 Storybook
```

### 构建流程
```bash
npm run build      # 构建生产版本
npm run build:app  # 构建应用
npm run build:sdk  # 构建 SDK
npm run build:docs # 构建文档
```

### 测试体系
- **单元测试**：Jest + jsdom
- **E2E 测试**：Playwright
- **类型检查**：TypeScript
- **代码质量**：ESLint + Prettier

## 部署架构

### 静态资源部署
- **主应用**：部署到 Cloudflare Pages
- **CDN 资源**：通过 jsDelivr 分发
- **文档站点**：Docusaurus 构建的文档

### 版本管理
- **语义化版本**：遵循 SemVer 规范
- **自动发布**：GitHub Actions 自动化
- **多环境部署**：开发版和生产版

## 总结

LiveCodes 是一个技术先进、架构优雅的代码游乐场项目，其主要优势包括：

1. **技术创新**：客户端编译、WebAssembly 集成、模块化架构
2. **用户体验**：零配置、实时预览、丰富功能
3. **开发者友好**：强大 SDK、多框架支持、完善文档
4. **可扩展性**：插件化语言支持、模块化设计
5. **性能优化**：Web Workers、缓存机制、按需加载

这个项目为构建类似的在线代码编辑器提供了优秀的参考架构和实现方案。

## 详细技术实现

### 1. 编译器系统深度解析

#### 编译器工厂模式
LiveCodes 使用工厂模式来创建不同语言的编译器：

```typescript
// 编译器工厂接口
interface CompilerFactory {
  (config: Config, baseUrl: string): CompilerFunction;
}

// 编译器函数接口
interface CompilerFunction {
  (code: string, options: CompileOptions): Promise<string | CompileResult>;
}
```

#### 动态编译器加载
```typescript
const loadLanguageCompiler = async (language: Language, config: Config) => {
  const specs = getLanguageSpecs(language);
  if (!specs?.compiler) return;

  // 动态加载编译器脚本
  if (typeof specs.compiler === 'object' && specs.compiler.url) {
    await loadScript(specs.compiler.url);

    // 创建编译器实例
    const factory = specs.compiler.factory;
    if (factory) {
      compilers[language] = {
        fn: await factory(config, baseUrl),
        loaded: true
      };
    }
  }
};
```

#### Web Workers 编译
为了避免阻塞主线程，LiveCodes 在 Web Workers 中进行编译：

```typescript
// compile.worker.ts
const compile = async (
  content: string,
  language: LanguageOrProcessor,
  config: Config,
  options: CompileOptions,
) => {
  const compiler = compilers[language]?.fn;
  if (!compiler) {
    throw new Error('Failed to load compiler for: ' + language);
  }

  try {
    return await compiler(content, { config, language, baseUrl, options });
  } catch (err) {
    console.error('Failed compiling: ' + language, err);
    return content;
  }
};
```

### 2. 语言支持实现细节

#### TypeScript 编译器实现
```typescript
export const typescript: LanguageSpecs = {
  name: 'typescript',
  title: 'TS',
  compiler: {
    url: typescriptUrl,
    factory: () => async (code, { config }) =>
      (window as any).ts.transpile(code, {
        target: 'ES2020',
        module: 'ESNext',
        jsx: 'react-jsx',
        ...getLanguageCustomSettings('typescript', config),
      }),
  },
  extensions: ['ts', 'typescript'],
  editor: 'script',
};
```

#### WebAssembly 语言支持（以 Python 为例）
```typescript
export const pythonWasm: LanguageSpecs = {
  name: 'python-wasm',
  title: 'Python (Wasm)',
  compiler: {
    factory: () => async (code) => code,
    scripts: ({ baseUrl }) => [
      baseUrl + 'pyodide/pyodide.js',
    ],
    scriptType: 'text/python-wasm',
    compiledCodeLanguage: 'python',
  },
  extensions: ['py'],
  editor: 'script',
};
```

#### 模板语言支持（以 Vue 为例）
```typescript
export const vue: LanguageSpecs = {
  name: 'vue',
  title: 'Vue 3 SFC',
  compiler: {
    factory: (_config, baseUrl) => {
      // 动态导入 Vue 编译器
      return async (code, { config }) => {
        const { compile } = await import('@vue/compiler-sfc');
        const { descriptor } = compile(code);

        // 编译模板、脚本和样式
        return compileVueComponent(descriptor, config);
      };
    },
  },
  extensions: ['vue'],
  editor: 'script',
};
```

### 3. 编辑器集成架构

#### 编辑器抽象层
```typescript
interface CodeEditor {
  getValue(): string;
  setValue(value: string): void;
  getLanguage(): Language;
  setLanguage(language: Language): void;
  focus(): void;
  format(): Promise<void>;
  destroy(): void;
  // ... 其他方法
}
```

#### Monaco Editor 集成
```typescript
const createMonacoEditor = async (container: HTMLElement): Promise<CodeEditor> => {
  const monaco = await import('monaco-editor');

  const editor = monaco.editor.create(container, {
    value: '',
    language: 'javascript',
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: false },
    // ... 其他配置
  });

  return {
    getValue: () => editor.getValue(),
    setValue: (value) => editor.setValue(value),
    setLanguage: (language) => {
      const model = editor.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    },
    // ... 实现其他方法
  };
};
```

### 4. 结果页面系统实现

#### 沙箱执行环境
```typescript
const createResultPage = async (code: Code, config: Config) => {
  const iframe = document.createElement('iframe');
  iframe.sandbox = 'allow-scripts allow-same-origin allow-forms';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>${code.style.compiled}</style>
    </head>
    <body>
      ${code.markup.compiled}
      <script type="module">${code.script.compiled}</script>
    </body>
    </html>
  `;

  iframe.srcdoc = html;
  return iframe;
};
```

#### 实时预览机制
```typescript
const setupLivePreview = (editors: Editors, resultContainer: HTMLElement) => {
  let debounceTimer: number;

  const updateResult = async () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const code = await getCompiledCode(editors);
      const resultPage = await createResultPage(code, getConfig());

      // 替换结果页面
      resultContainer.innerHTML = '';
      resultContainer.appendChild(resultPage);
    }, 500);
  };

  // 监听编辑器变化
  Object.values(editors).forEach(editor => {
    editor.onChange(updateResult);
  });
};
```

### 5. SDK 通信机制

#### PostMessage 通信
```typescript
// SDK 端
const callAPI = <T>(method: keyof API, args?: any[]) =>
  new Promise<T>((resolve, reject) => {
    const id = generateId();

    // 监听响应
    const handler = (e: MessageEvent) => {
      if (e.data?.id === id && e.data?.method === method) {
        window.removeEventListener('message', handler);
        if (e.data.error) {
          reject(e.data.error);
        } else {
          resolve(e.data.payload);
        }
      }
    };

    window.addEventListener('message', handler);

    // 发送请求
    iframe.contentWindow?.postMessage({ method, id, args }, origin);
  });

// LiveCodes 端
window.addEventListener('message', async (e) => {
  const { method, id, args } = e.data;

  try {
    const result = await api[method](...(args || []));
    e.source?.postMessage({
      type: 'livecodes-api-response',
      method,
      id,
      payload: result
    }, e.origin);
  } catch (error) {
    e.source?.postMessage({
      type: 'livecodes-api-response',
      method,
      id,
      payload: { error: error.message }
    }, e.origin);
  }
});
```

#### 事件系统实现
```typescript
// 发布-订阅模式
const createPub = <T>() => {
  const subscribers = new Set<(data: T) => void>();

  return {
    subscribe: (fn: (data: T) => void) => {
      subscribers.add(fn);
      return {
        remove: () => subscribers.delete(fn)
      };
    },
    publish: (data: T) => {
      subscribers.forEach(fn => fn(data));
    }
  };
};

// SDK 事件监听
const sdkWatchers = {
  load: createPub<void>(),
  ready: createPub<void>(),
  code: createPub<{ code: Code; config: Config }>(),
  tests: createPub<{ results: TestResult[] }>(),
  console: createPub<{ method: string; args: any[] }>(),
  destroy: createPub<void>(),
};
```

### 6. 模块加载和缓存机制

#### 动态模块加载
```typescript
const moduleCache = new Map<string, any>();

const loadModule = async (url: string): Promise<any> => {
  if (moduleCache.has(url)) {
    return moduleCache.get(url);
  }

  try {
    const module = await import(url);
    moduleCache.set(url, module);
    return module;
  } catch (error) {
    console.error(`Failed to load module: ${url}`, error);
    throw error;
  }
};
```

#### 编译缓存
```typescript
interface CompileCache {
  content: string;
  compiled: string;
  processors: string;
  languageSettings: string;
  timestamp: number;
}

const cache = new Map<Language, CompileCache>();

const getCachedResult = (
  language: Language,
  content: string,
  processors: string,
  settings: string
): string | null => {
  const cached = cache.get(language);
  if (
    cached &&
    cached.content === content &&
    cached.processors === processors &&
    cached.languageSettings === settings
  ) {
    return cached.compiled;
  }
  return null;
};

### 7. 存储系统架构

#### 项目存储接口
```typescript
interface ProjectStorage {
  getProject(id: string): Promise<Config | null>;
  saveProject(project: Config): Promise<string>;
  deleteProject(id: string): Promise<void>;
  listProjects(): Promise<Array<{ id: string; title: string; lastModified: number }>>;
}
```

#### IndexedDB 实现
```typescript
class IndexedDBStorage implements ProjectStorage {
  private db: IDBDatabase | null = null;

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('livecodes', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 创建项目存储
        if (!db.objectStoreNames.contains('projects')) {
          const store = db.createObjectStore('projects', { keyPath: 'id' });
          store.createIndex('lastModified', 'lastModified');
        }
      };
    });
  }

  async saveProject(project: Config): Promise<string> {
    if (!this.db) await this.init();

    const id = project.id || generateId();
    const projectData = {
      ...project,
      id,
      lastModified: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['projects'], 'readwrite');
      const store = transaction.objectStore('projects');
      const request = store.put(projectData);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }
}
```

### 8. 国际化系统

#### i18n 架构
```typescript
interface I18nSystem {
  init(language: string): Promise<void>;
  t(key: string, params?: Record<string, any>): string;
  changeLanguage(language: string): Promise<void>;
  getAvailableLanguages(): string[];
}

// 翻译键类型定义
type I18nKeyType =
  | 'app.title'
  | 'editor.run'
  | 'editor.format'
  | 'templates.starter.react'
  // ... 更多键
```

#### 动态语言加载
```typescript
const loadLanguageResources = async (language: string) => {
  try {
    const resources = await import(`./locales/${language}.json`);
    return resources.default;
  } catch (error) {
    console.warn(`Failed to load language: ${language}, falling back to English`);
    return await import('./locales/en.json').then(m => m.default);
  }
};
```

### 9. 测试系统架构

#### 单元测试结构
```typescript
// 测试工具函数
const createMockEditor = (): CodeEditor => ({
  getValue: jest.fn(() => ''),
  setValue: jest.fn(),
  getLanguage: jest.fn(() => 'javascript'),
  setLanguage: jest.fn(),
  focus: jest.fn(),
  format: jest.fn(() => Promise.resolve()),
  destroy: jest.fn(),
});

// 编译器测试
describe('TypeScript Compiler', () => {
  it('should compile TypeScript to JavaScript', async () => {
    const compiler = await createCompiler({ language: 'typescript' });
    const result = await compiler.compile('const x: number = 1;');
    expect(result.code).toContain('const x = 1;');
  });
});
```

#### E2E 测试
```typescript
// Playwright 测试
test('should create and run a React project', async ({ page }) => {
  await page.goto('/');

  // 选择 React 模板
  await page.click('[data-testid="template-react"]');

  // 等待编辑器加载
  await page.waitForSelector('.monaco-editor');

  // 修改代码
  await page.fill('.monaco-editor textarea', 'console.log("Hello World");');

  // 运行代码
  await page.click('[data-testid="run-button"]');

  // 验证结果
  await expect(page.locator('[data-testid="console-output"]')).toContainText('Hello World');
});
```

### 10. 性能优化策略

#### 代码分割
```typescript
// 动态导入大型依赖
const loadMonacoEditor = () => import('monaco-editor');
const loadCodeMirror = () => import('@codemirror/state');

// 按需加载语言编译器
const loadLanguageCompiler = async (language: Language) => {
  switch (language) {
    case 'typescript':
      return import('./languages/typescript/compiler');
    case 'python':
      return import('./languages/python/compiler');
    // ... 其他语言
  }
};
```

#### 虚拟滚动
```typescript
// 大型项目列表的虚拟滚动
const VirtualProjectList = ({ projects }: { projects: Project[] }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });

  const visibleProjects = projects.slice(visibleRange.start, visibleRange.end);

  return (
    <div className="project-list" onScroll={handleScroll}>
      {visibleProjects.map(project => (
        <ProjectItem key={project.id} project={project} />
      ))}
    </div>
  );
};
```

#### 缓存策略
```typescript
// Service Worker 缓存
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/vendors/')) {
    event.respondWith(
      caches.open('livecodes-vendors').then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request).then(fetchResponse => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});
```

## 开发最佳实践

### 1. 代码组织原则

#### 模块化设计
- 每个功能模块独立，职责单一
- 使用 TypeScript 接口定义模块边界
- 依赖注入减少模块间耦合

#### 文件命名规范
```
src/livecodes/
├── languages/
│   ├── typescript/
│   │   ├── lang-typescript.ts          # 语言定义
│   │   ├── lang-typescript-compiler.ts # 编译器实现
│   │   └── __tests__/                  # 测试文件
│   └── index.ts                        # 导出文件
```

### 2. 类型安全

#### 严格的 TypeScript 配置
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

#### 运行时类型检查
```typescript
const validateConfig = (config: unknown): config is Config => {
  return (
    typeof config === 'object' &&
    config !== null &&
    'markup' in config &&
    'style' in config &&
    'script' in config
  );
};
```

### 3. 错误处理

#### 统一错误处理
```typescript
class LiveCodesError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any
  ) {
    super(message);
    this.name = 'LiveCodesError';
  }
}

const handleError = (error: Error, context: string) => {
  console.error(`Error in ${context}:`, error);

  // 发送错误报告
  if (process.env.NODE_ENV === 'production') {
    sendErrorReport(error, context);
  }

  // 显示用户友好的错误信息
  notifications.error(getErrorMessage(error));
};
```

### 4. 可访问性

#### 键盘导航
```typescript
const handleKeyboardNavigation = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'F5':
      event.preventDefault();
      runCode();
      break;
    case 'F8':
      event.preventDefault();
      formatCode();
      break;
    // ... 更多快捷键
  }
};
```

#### ARIA 标签
```html
<button
  aria-label="Run code (F5)"
  aria-describedby="run-button-description"
  onClick={runCode}
>
  Run
</button>
<div id="run-button-description" className="sr-only">
  Executes the current code and displays the result
</div>
```

## 部署和运维

### 1. 构建优化

#### 生产构建配置
```javascript
// esbuild 配置
const buildConfig = {
  entryPoints: ['src/livecodes/main.ts'],
  bundle: true,
  minify: true,
  sourcemap: false,
  target: 'es2020',
  format: 'esm',
  splitting: true,
  chunkNames: 'chunks/[name]-[hash]',
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.VERSION': `"${version}"`,
  },
};
```

#### 资源优化
```javascript
// 图片压缩和格式转换
const optimizeImages = async () => {
  const images = await glob('src/assets/**/*.{png,jpg,jpeg}');

  for (const image of images) {
    await sharp(image)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(image.replace(/\.(png|jpg|jpeg)$/, '.webp'));
  }
};
```

### 2. 监控和分析

#### 性能监控
```typescript
// 性能指标收集
const collectPerformanceMetrics = () => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

  const metrics = {
    loadTime: navigation.loadEventEnd - navigation.fetchStart,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
    firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
    firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
  };

  // 发送到分析服务
  sendAnalytics('performance', metrics);
};
```

#### 错误监控
```typescript
// 全局错误捕获
window.addEventListener('error', (event) => {
  sendErrorReport({
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  sendErrorReport({
    message: 'Unhandled Promise Rejection',
    reason: event.reason,
  });
});
```

## 学习和实践建议

### 1. 如何学习这个项目

#### 学习路径
1. **基础理解**
   - 阅读 README 和文档了解项目概况
   - 运行项目，体验核心功能
   - 查看项目结构，理解模块划分

2. **核心概念**
   - 理解编译器系统的设计思路
   - 学习语言支持的实现机制
   - 掌握 SDK 的通信原理

3. **深入源码**
   - 从 `main.ts` 开始，跟踪代码执行流程
   - 分析编译器的加载和执行过程
   - 研究 SDK 的实现细节

4. **实践扩展**
   - 尝试添加新的语言支持
   - 实现自定义编辑器插件
   - 开发新的功能模块

#### 关键文件学习顺序
```
1. src/livecodes/main.ts          # 入口文件
2. src/livecodes/core.ts          # 核心逻辑
3. src/livecodes/compiler/        # 编译器系统
4. src/livecodes/languages/       # 语言支持
5. src/sdk/                       # SDK 实现
6. src/livecodes/editor/          # 编辑器集成
```

### 2. 构建类似项目的指南

#### 技术选型建议
```typescript
// 推荐的技术栈
const recommendedStack = {
  // 前端框架
  frontend: 'TypeScript + ESBuild',

  // 编辑器
  editor: 'Monaco Editor 或 CodeMirror 6',

  // 编译器
  compiler: 'Web Workers + WebAssembly',

  // 构建工具
  build: 'ESBuild 或 Vite',

  // 测试框架
  testing: 'Jest + Playwright',

  // 部署平台
  deployment: 'Cloudflare Pages 或 Vercel',
};
```

#### 架构设计原则
1. **模块化设计**
   - 每个功能独立成模块
   - 清晰的接口定义
   - 最小化模块间依赖

2. **可扩展性**
   - 插件化的语言支持
   - 可配置的编译器
   - 灵活的 UI 组件

3. **性能优化**
   - 按需加载资源
   - Web Workers 处理重任务
   - 智能缓存机制

#### 核心功能实现步骤

##### 第一阶段：基础框架
```typescript
// 1. 创建基础项目结构
const projectStructure = {
  'src/': {
    'core/': '核心逻辑',
    'editor/': '编辑器集成',
    'compiler/': '编译器系统',
    'ui/': '用户界面',
    'utils/': '工具函数',
  },
  'tests/': '测试文件',
  'docs/': '文档',
};

// 2. 实现基础编辑器
const createBasicEditor = async () => {
  const monaco = await import('monaco-editor');
  return monaco.editor.create(container, {
    value: 'console.log("Hello World");',
    language: 'javascript',
  });
};

// 3. 实现基础编译器
const createBasicCompiler = () => ({
  compile: async (code: string, language: string) => {
    switch (language) {
      case 'javascript':
        return code; // 直接返回
      case 'typescript':
        return transpileTypeScript(code);
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  },
});
```

##### 第二阶段：语言支持
```typescript
// 1. 定义语言规范接口
interface LanguageSpec {
  name: string;
  title: string;
  extensions: string[];
  compiler: CompilerConfig;
  editor: 'markup' | 'style' | 'script';
}

// 2. 实现语言注册系统
class LanguageRegistry {
  private languages = new Map<string, LanguageSpec>();

  register(spec: LanguageSpec) {
    this.languages.set(spec.name, spec);
  }

  get(name: string): LanguageSpec | undefined {
    return this.languages.get(name);
  }

  getAll(): LanguageSpec[] {
    return Array.from(this.languages.values());
  }
}

// 3. 添加新语言支持
const addPythonSupport = () => {
  registry.register({
    name: 'python',
    title: 'Python',
    extensions: ['py'],
    compiler: {
      type: 'wasm',
      url: 'https://cdn.jsdelivr.net/pyodide/pyodide.js',
    },
    editor: 'script',
  });
};
```

##### 第三阶段：SDK 开发
```typescript
// 1. 定义 API 接口
interface PlaygroundAPI {
  run(): Promise<void>;
  getCode(): Promise<string>;
  setCode(code: string): Promise<void>;
  getConfig(): Promise<Config>;
  setConfig(config: Partial<Config>): Promise<void>;
}

// 2. 实现通信机制
class PlaygroundSDK implements PlaygroundAPI {
  private iframe: HTMLIFrameElement;

  constructor(container: string | HTMLElement) {
    this.iframe = this.createIframe(container);
  }

  private async callAPI<T>(method: string, args?: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36);

      const handler = (event: MessageEvent) => {
        if (event.data.id === id) {
          window.removeEventListener('message', handler);
          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data.result);
          }
        }
      };

      window.addEventListener('message', handler);
      this.iframe.contentWindow?.postMessage({ method, args, id }, '*');
    });
  }

  async run(): Promise<void> {
    return this.callAPI('run');
  }

  async getCode(): Promise<string> {
    return this.callAPI('getCode');
  }
}

// 3. 创建 React 组件
const LiveCodesPlayground: React.FC<PlaygroundProps> = ({ config, onReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [playground, setPlayground] = useState<PlaygroundAPI | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const sdk = new PlaygroundSDK(containerRef.current);
      setPlayground(sdk);
      onReady?.(sdk);
    }
  }, [onReady]);

  return <div ref={containerRef} style={{ width: '100%', height: '400px' }} />;
};
```

### 3. 常见问题和解决方案

#### 性能问题
```typescript
// 问题：编译器加载慢
// 解决：懒加载 + 预加载
const preloadCompilers = async (languages: string[]) => {
  const promises = languages.map(lang =>
    import(`./compilers/${lang}`).catch(() => null)
  );
  await Promise.allSettled(promises);
};

// 问题：大文件编译卡顿
// 解决：Web Workers + 分片处理
const compileInChunks = async (code: string, chunkSize = 1000) => {
  const chunks = [];
  for (let i = 0; i < code.length; i += chunkSize) {
    chunks.push(code.slice(i, i + chunkSize));
  }

  const results = await Promise.all(
    chunks.map(chunk => compileInWorker(chunk))
  );

  return results.join('');
};
```

#### 兼容性问题
```typescript
// 问题：浏览器兼容性
// 解决：特性检测 + Polyfill
const checkBrowserSupport = () => {
  const features = {
    webWorkers: typeof Worker !== 'undefined',
    webAssembly: typeof WebAssembly !== 'undefined',
    es6Modules: 'noModule' in HTMLScriptElement.prototype,
  };

  const unsupported = Object.entries(features)
    .filter(([, supported]) => !supported)
    .map(([feature]) => feature);

  if (unsupported.length > 0) {
    throw new Error(`Unsupported features: ${unsupported.join(', ')}`);
  }
};

// 问题：移动端适配
// 解决：响应式设计 + 触摸优化
const setupMobileOptimizations = () => {
  if (isMobile()) {
    // 调整编辑器配置
    editorConfig.fontSize = 14;
    editorConfig.lineHeight = 1.5;

    // 启用触摸手势
    enableTouchGestures();

    // 优化虚拟键盘
    setupVirtualKeyboard();
  }
};
```

### 4. 扩展和定制

#### 添加新语言支持
```typescript
// 1. 创建语言定义文件
// src/languages/mylang/lang-mylang.ts
export const mylang: LanguageSpecs = {
  name: 'mylang',
  title: 'MyLang',
  compiler: {
    factory: () => async (code) => {
      // 实现编译逻辑
      return compileMyLang(code);
    },
  },
  extensions: ['ml'],
  editor: 'script',
};

// 2. 注册语言
// src/languages/index.ts
import { mylang } from './mylang/lang-mylang';

export const languages = [
  // ... 其他语言
  mylang,
];
```

#### 自定义主题
```typescript
// 1. 定义主题接口
interface Theme {
  name: string;
  colors: {
    background: string;
    foreground: string;
    accent: string;
    // ... 更多颜色
  };
  editor: {
    background: string;
    foreground: string;
    // ... 编辑器样式
  };
}

// 2. 实现主题切换
const applyTheme = (theme: Theme) => {
  // 应用 CSS 变量
  Object.entries(theme.colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--color-${key}`, value);
  });

  // 更新编辑器主题
  monaco.editor.defineTheme('custom', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: theme.editor,
  });

  monaco.editor.setTheme('custom');
};
```

## 总结

LiveCodes 项目展示了现代 Web 应用开发的最佳实践，其架构设计具有以下特点：

### 技术亮点
1. **创新的客户端编译架构**：完全在浏览器中实现多语言编译
2. **模块化的语言支持系统**：统一接口，易于扩展
3. **强大的 SDK 设计**：支持多框架，通信机制完善
4. **优秀的性能优化**：Web Workers、缓存、按需加载
5. **完善的开发体验**：TypeScript、测试、文档

### 学习价值
- **架构设计思维**：如何设计可扩展的大型前端应用
- **编译器技术**：Web 端编译器的实现原理
- **SDK 开发**：如何设计易用的开发者工具
- **性能优化**：大型应用的性能优化策略
- **工程化实践**：现代前端工程化的最佳实践

### 应用场景
- 在线代码编辑器
- 教育平台的编程环境
- 技术文档的交互式示例
- 原型开发工具
- 代码分享平台

这个项目为构建类似的在线开发环境提供了完整的解决方案和宝贵的经验，值得深入学习和借鉴。通过分析 LiveCodes 的架构设计和实现细节，我们可以学到如何构建一个功能强大、性能优秀、易于扩展的现代 Web 应用。
```
