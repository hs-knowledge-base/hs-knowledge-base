import type { PlaygroundConfig } from './config-manager';
import { Logger } from './logger';

/**
 * 配置验证器
 */
export class ConfigValidator {
  private readonly logger = new Logger(ConfigValidator.name);

  /** 验证配置 */
  validate(config: PlaygroundConfig): void {
    const errors: string[] = [];

    // 基本必需字段验证
    if (!config.compiler) {
      errors.push('编译器配置缺失');
    } else {
      this.validateCompilerConfig(config.compiler, errors);
    }

    // 验证其他配置
    this.validateDelayConfig(config.delay, errors);
    this.validateAutoRunConfig(config.autoRun, errors);

    if (errors.length > 0) {
      this.logger.error('配置验证失败:', errors);
      throw new Error(`配置验证失败: ${errors.join(', ')}`);
    }

    this.logger.debug('配置验证通过');
  }

  /** 验证编译器配置 */
  private validateCompilerConfig(compiler: any, errors: string[]): void {
    const requiredTypes = ['markup', 'style', 'script'] as const;
    
    requiredTypes.forEach(type => {
      if (!compiler[type]?.language) {
        errors.push(`${type} 语言配置缺失`);
      }
      
      // 验证字体大小
      const fontSize = compiler[type]?.fontSize;
      if (fontSize && (fontSize < 8 || fontSize > 72)) {
        errors.push(`${type} 字体大小必须在 8-72 之间`);
      }
    });
  }

  /** 验证延迟配置 */
  private validateDelayConfig(delay: number, errors: string[]): void {
    if (delay < 0 || delay > 10000) {
      errors.push('延迟时间必须在 0-10000ms 之间');
    }
  }

  /** 验证自动运行配置 */
  private validateAutoRunConfig(autoRun: boolean, errors: string[]): void {
    if (typeof autoRun !== 'boolean') {
      errors.push('autoRun 必须是布尔值');
    }
  }
}
