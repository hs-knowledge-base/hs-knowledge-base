import type { Language } from '@/types';

/** 编译器配置 */
export const COMPILER_CONFIG = {
  autoRun: false,
  delay: 1000,
  timeout: 10000
} as const;

/** 需要编译器的语言 */
export const LANGUAGES_NEED_COMPILER: Language[] = [
  'typescript',
  'markdown', 
  'scss',
  'less'
] as const;

/** 编译器超时配置 */
export const COMPILER_TIMEOUTS = {
  TYPESCRIPT: 5000,
  SCSS: 3000,
  LESS: 3000,
  MARKDOWN: 2000,
  DEFAULT: 5000
} as const;

/** 编译器选项 */
export const COMPILER_OPTIONS = {
  TYPESCRIPT: {
    target: 'ES2020',
    module: 'ESNext',
    moduleResolution: 'node',
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true
  },
  SCSS: {
    outputStyle: 'expanded',
    sourceMap: true,
    includePaths: []
  },
  LESS: {
    compress: false,
    sourceMap: {},
    javascriptEnabled: true
  },
  MARKDOWN: {
    html: true,
    linkify: true,
    typographer: true,
    breaks: false
  }
} as const;
