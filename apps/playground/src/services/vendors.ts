import { modulesService } from './modules';

const { getUrl, getModuleUrl } = modulesService;

/** Monaco Editor 基础 URL - 使用 unpkg CDN 和稳定版本 */
export const monacoBaseUrl = 'https://unpkg.com/monaco-editor@0.45.0/min';

/** Monaco Editor 核心模块 URLs - 使用 AMD 版本 */
export const monacoLoaderUrl = 'https://unpkg.com/monaco-editor@0.45.0/min/vs/loader.js';

/** Monaco Editor Worker 主文件 */
export const monacoWorkerMainUrl = 'https://unpkg.com/monaco-editor@0.45.0/min/vs/base/worker/workerMain.js';



/** Monaco Editor 主题 URLs */
export const monacoThemesBaseUrl = /* @__PURE__ */ getUrl('monaco-themes@0.4.4/themes/');

/** Monaco Editor 扩展 URLs */
export const monacoEmacsUrl = /* @__PURE__ */ getUrl('monaco-emacs@0.3.0/dist/monaco-emacs.js');

export const monacoVimUrl = /* @__PURE__ */ getUrl('monaco-vim@0.4.1/dist/monaco-vim.js');

export const emmetMonacoUrl = /* @__PURE__ */ getUrl('emmet-monaco-es@5.5.0/dist/emmet-monaco.js');

/** 编译器相关 URLs */
export const typescriptUrl = /* @__PURE__ */ getUrl('typescript@5.6.2/lib/typescript.js');

export const babelUrl = /* @__PURE__ */ getUrl('@babel/standalone@7.26.4/babel.js');

export const postcssUrl = /* @__PURE__ */ getModuleUrl('postcss@8.4.47');

export const autoprefixerUrl = /* @__PURE__ */ getModuleUrl('autoprefixer@10.4.20');

/** 工具库 URLs */
export const prettierUrl = /* @__PURE__ */ getModuleUrl('prettier@3.3.3');

export const prettierParserBabelUrl = /* @__PURE__ */ getModuleUrl('prettier@3.3.3/plugins/babel');

export const prettierParserTypescriptUrl = /* @__PURE__ */ getModuleUrl('prettier@3.3.3/plugins/typescript');

export const prettierParserHtmlUrl = /* @__PURE__ */ getModuleUrl('prettier@3.3.3/plugins/html');

export const prettierParserCssUrl = /* @__PURE__ */ getModuleUrl('prettier@3.3.3/plugins/postcss');

/** 测试框架 URLs */
export const jestUrl = /* @__PURE__ */ getModuleUrl('jest@29.7.0');

export const vitestUrl = /* @__PURE__ */ getModuleUrl('vitest@2.1.8');

/** 常用库 URLs */
export const lodashUrl = /* @__PURE__ */ getModuleUrl('lodash@4.17.21');

export const axiosUrl = /* @__PURE__ */ getModuleUrl('axios@1.7.9');

export const dayJsUrl = /* @__PURE__ */ getModuleUrl('dayjs@1.11.13');

/** React 相关 URLs */
export const reactUrl = /* @__PURE__ */ getModuleUrl('react@18.3.1');

export const reactDomUrl = /* @__PURE__ */ getModuleUrl('react-dom@18.3.1');

/** Vue 相关 URLs */
export const vueUrl = /* @__PURE__ */ getModuleUrl('vue@3.5.13');

export const vueCompilerSfcUrl = /* @__PURE__ */ getModuleUrl('@vue/compiler-sfc@3.5.13');

/** 样式处理 URLs */
export const sassUrl = /* @__PURE__ */ getModuleUrl('sass@1.82.0');

export const lessUrl = /* @__PURE__ */ getModuleUrl('less@4.2.1');

export const stylusUrl = /* @__PURE__ */ getModuleUrl('stylus@0.63.0');

/** 模板引擎 URLs */
export const handlebarsUrl = /* @__PURE__ */ getModuleUrl('handlebars@4.7.8');

export const mustacheUrl = /* @__PURE__ */ getModuleUrl('mustache@4.2.0');

export const pugUrl = /* @__PURE__ */ getModuleUrl('pug@3.0.3');

/** 图表库 URLs */
export const chartJsUrl = /* @__PURE__ */ getModuleUrl('chart.js@4.4.7');

export const d3Url = /* @__PURE__ */ getModuleUrl('d3@7.9.0');

export const echartsUrl = /* @__PURE__ */ getModuleUrl('echarts@5.5.1');

/** 动画库 URLs */
export const gsapUrl = /* @__PURE__ */ getModuleUrl('gsap@3.12.8');

export const animejsUrl = /* @__PURE__ */ getModuleUrl('animejs@3.2.2');

/** 工具函数 URLs */
export const momentUrl = /* @__PURE__ */ getModuleUrl('moment@2.30.1');

export const uuidUrl = /* @__PURE__ */ getModuleUrl('uuid@11.0.3');

export const validatorUrl = /* @__PURE__ */ getModuleUrl('validator@13.12.0');
