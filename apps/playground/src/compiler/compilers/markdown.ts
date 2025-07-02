import { BaseCompiler } from '../base-compiler';
import type { CompilerOptions, CompileResult } from '@/types';
import { markdownItUrl } from '@/services/vendors.ts';

/** Markdown 编译器 */
export class MarkdownCompiler extends BaseCompiler {
  private markdownIt: any = null;

  constructor() {
    super('markdown');
  }

  async compile(code: string, options: CompilerOptions): Promise<CompileResult> {
    try {
      this.validate(code);

      // 动态导入 markdown-it（只加载一次）
      if (!this.markdownIt) {
        this.logger.info('开始加载 markdown-it 库:', markdownItUrl);

        // 使用动态 import，像 Monaco Editor 一样
        const markdownItModule = await import(/* @vite-ignore */ markdownItUrl);

        this.logger.info('markdown-it 模块加载成功，类型:', typeof markdownItModule);
        this.logger.info('markdown-it 模块内容:', Object.keys(markdownItModule));

        // 尝试多种方式获取 MarkdownIt 构造函数
        let MarkdownIt = null;

        // 方式1: 检查 default 导出
        if (typeof markdownItModule.default === 'function') {
          MarkdownIt = markdownItModule.default;
          this.logger.info('找到 MarkdownIt 构造函数: markdownItModule.default');
        }
        // 方式2: 检查直接导出
        else if (typeof markdownItModule === 'function') {
          MarkdownIt = markdownItModule;
          this.logger.info('找到 MarkdownIt 构造函数: markdownItModule');
        }
        // 方式3: 检查命名导出
        else if (typeof markdownItModule.markdownit === 'function') {
          MarkdownIt = markdownItModule.markdownit;
          this.logger.info('找到 MarkdownIt 构造函数: markdownItModule.markdownit');
        }
        // 方式4: 检查其他可能的属性
        else {
          const possibleKeys = ['MarkdownIt', 'markdownIt', 'markdown_it', 'md'];
          for (const key of possibleKeys) {
            if (typeof markdownItModule[key] === 'function') {
              MarkdownIt = markdownItModule[key];
              this.logger.info(`找到 MarkdownIt 构造函数: markdownItModule.${key}`);
              break;
            }
          }
        }

        if (!MarkdownIt) {
          this.logger.error('未找到 MarkdownIt 构造函数，模块内容:', markdownItModule);
          throw new Error('markdown-it 模块加载失败：未找到构造函数');
        }

        this.markdownIt = new MarkdownIt({
          html: true,
          breaks: true,
          linkify: true,
          typographer: true,
        });

        this.logger.info('markdown-it 实例创建成功');
      }

      // 直接使用 markdown-it 转换
      const html = this.markdownIt.render(code);

      return this.createSuccessResult(html);

    } catch (error) {
      return this.handleError(error);
    }
  }



  /** 创建成功结果 - 输出 HTML */
  protected createSuccessResult(html: string): CompileResult {
    return {
      code: html,
      language: 'html'
    };
  }
}
