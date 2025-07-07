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
} as const;

/** CDN 资源路径 */
export const CDN_RESOURCES = {
  // Monaco Editor
  MONACO: {
    VERSION: '0.44.0',
    BASE_PATH: 'monaco-editor@{version}/min/vs',
    LOADER: 'loader.js',
    EDITOR: 'editor/editor.main.js'
  },
  
  // 编译器
  COMPILERS: {
    TYPESCRIPT: 'typescript@5.0.4/lib/typescript.js',
    SASS: 'sass@1.69.5/sass.js',
    LESS: 'less@4.2.0/dist/less.min.js',
    MARKDOWN_IT: 'markdown-it@13.0.2/dist/markdown-it.min.js'
  },
  
  // 运行时
  RUNTIMES: {
    BRYTHON: 'brython@3.11.0/brython.js',
    PYODIDE: 'pyodide@0.24.1/pyodide.js'
  }
} as const;

/** CDN 加载配置 */
export const CDN_LOAD_CONFIG = {
  TIMEOUT: 10000,
  RETRIES: 3,
  RETRY_DELAY: 1000,
  PARALLEL_LIMIT: 3
} as const;
