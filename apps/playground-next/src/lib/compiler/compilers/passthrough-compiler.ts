import type { Language, CompileResult } from '@/types';
import { BaseCompiler, type CompileOptions } from '../base-compiler';

/**
 * 直通编译器
 * 用于不需要编译的语言（如 HTML、CSS、JavaScript）
 */
export class PassthroughCompiler extends BaseCompiler {
  readonly name: string;
  readonly language: Language;

  constructor(language: Language, name?: string) {
    super();
    this.language = language;
    this.name = name || `${language.toUpperCase()} Passthrough Compiler`;
  }

  async compile(code: string, options: CompileOptions = {}): Promise<CompileResult> {
    this.validateCode(code);
    
    // 对于直通编译器，直接返回原代码
    return this.createSuccessResult(code);
  }
}

/**
 * HTML 编译器（直通）
 */
export class HtmlCompiler extends PassthroughCompiler {
  constructor() {
    super('html', 'HTML Compiler');
  }
}

/**
 * CSS 编译器（直通）
 */
export class CssCompiler extends PassthroughCompiler {
  constructor() {
    super('css', 'CSS Compiler');
  }
}

/**
 * JavaScript 编译器（直通）
 */
export class JavaScriptCompiler extends PassthroughCompiler {
  constructor() {
    super('javascript', 'JavaScript Compiler');
  }
}

/**
 * JSON 编译器（直通）
 */
export class JsonCompiler extends PassthroughCompiler {
  constructor() {
    super('json', 'JSON Compiler');
  }
}

/**
 * XML 编译器（直通）
 */
export class XmlCompiler extends PassthroughCompiler {
  constructor() {
    super('xml', 'XML Compiler');
  }
}

/**
 * YAML 编译器（直通）
 */
export class YamlCompiler extends PassthroughCompiler {
  constructor() {
    super('yaml', 'YAML Compiler');
  }
}
