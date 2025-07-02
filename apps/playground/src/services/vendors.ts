import { modulesService } from './modules';

const { getUrl, getModuleUrl } = modulesService;

/** Monaco Editor 基础 URL */
export const monacoBaseUrl = /* @__PURE__ */ getUrl('monaco-editor@0.52.2/');

/** Monaco Editor 核心模块 URLs */
export const monacoEditorMainUrl = /* @__PURE__ */ getUrl(
  'monaco-editor@0.52.2/esm/vs/editor/editor.main.js'
);

export const monacoLanguagesUrl = /* @__PURE__ */ getUrl(
  'monaco-editor@0.52.2/esm/vs/basic-languages/monaco.contribution.js'
);

/** Monaco Editor Workers URLs */
export const monacoEditorWorkerUrl = /* @__PURE__ */ getUrl(
  'monaco-editor@0.52.2/esm/vs/editor/editor.worker.js'
);

export const monacoTypescriptWorkerUrl = /* @__PURE__ */ getUrl(
  'monaco-editor@0.52.2/esm/vs/language/typescript/ts.worker.js'
);

export const monacoJsonWorkerUrl = /* @__PURE__ */ getUrl(
  'monaco-editor@0.52.2/esm/vs/language/json/json.worker.js'
);

export const monacoCssWorkerUrl = /* @__PURE__ */ getUrl(
  'monaco-editor@0.52.2/esm/vs/language/css/css.worker.js'
);

export const monacoHtmlWorkerUrl = /* @__PURE__ */ getUrl(
  'monaco-editor@0.52.2/esm/vs/language/html/html.worker.js'
);

/** Monaco Editor 语言支持 URLs */
export const monacoTypescriptUrl = /* @__PURE__ */ getUrl(
  'monaco-editor@0.52.2/esm/vs/language/typescript/monaco.contribution.js'
);

export const monacoJsonUrl = /* @__PURE__ */ getUrl(
  'monaco-editor@0.52.2/esm/vs/language/json/monaco.contribution.js'
);

export const monacoCssUrl = /* @__PURE__ */ getUrl(
  'monaco-editor@0.52.2/esm/vs/language/css/monaco.contribution.js'
);

export const monacoHtmlUrl = /* @__PURE__ */ getUrl(
  'monaco-editor@0.52.2/esm/vs/language/html/monaco.contribution.js'
);

/** Monaco Editor 基础语言支持 URLs */
export const monacoJavascriptUrl = /* @__PURE__ */ getUrl(
  'monaco-editor@0.52.2/esm/vs/basic-languages/javascript/javascript.js'
);

export const monacoMarkdownUrl = /* @__PURE__ */ getUrl(
  'monaco-editor@0.52.2/esm/vs/basic-languages/markdown/markdown.js'
);

export const monacoXmlUrl = /* @__PURE__ */ getUrl(
  'monaco-editor@0.52.2/esm/vs/basic-languages/xml/xml.js'
);

export const monacoYamlUrl = /* @__PURE__ */ getUrl(
  'monaco-editor@0.52.2/esm/vs/basic-languages/yaml/yaml.js'
);

export const monacoSqlUrl = /* @__PURE__ */ getUrl(
  'monaco-editor@0.52.2/esm/vs/basic-languages/sql/sql.js'
);

export const monacoPythonUrl = /* @__PURE__ */ getUrl(
  'monaco-editor@0.52.2/esm/vs/basic-languages/python/python.js'
);

export const monacoShellUrl = /* @__PURE__ */ getUrl(
  'monaco-editor@0.52.2/esm/vs/basic-languages/shell/shell.js'
);

/** 编译器相关 URLs */
export const typescriptUrl = /* @__PURE__ */ getModuleUrl('typescript@5.3.3');

export const babelUrl = /* @__PURE__ */ getModuleUrl('@babel/standalone@7.26.4');

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
