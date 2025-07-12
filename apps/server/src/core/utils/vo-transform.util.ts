import { plainToInstance, instanceToPlain, Transform } from 'class-transformer';
import { Type } from '@nestjs/common';
import { VoTransformOptions } from '../decorators/vo-transform.decorator';

/**
 * VO 转换工具类
 * 提供数据转换的核心功能
 */
export class VoTransformUtil {
  /**
   * 敏感字段列表
   */
  private static readonly SENSITIVE_FIELDS = [
    'password',
    'passwordHash',
    'salt',
    'secret',
    'token',
    'refreshToken',
    'privateKey',
    'apiKey'
  ];

  /**
   * 转换数据为 VO
   * @param data 原始数据
   * @param options 转换配置
   * @returns 转换后的 VO 数据
   */
  static transform<T>(data: any, options: VoTransformOptions): T | T[] {
    if (!data) {
      return data;
    }

    // 处理数组
    if (Array.isArray(data)) {
      return data.map(item => this.transformSingle<T>(item, options)) as T[];
    }

    // 处理单个对象
    return this.transformSingle<T>(data, options);
  }

  /**
   * 转换单个对象
   * @param data 原始数据
   * @param options 转换配置
   * @returns 转换后的 VO 对象
   */
  private static transformSingle<T>(data: any, options: VoTransformOptions): T {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // 1. 应用自定义转换函数
    if (options.transform) {
      data = options.transform(data);
    }

    // 2. 字段过滤
    const filteredData = this.filterFields(data, options);

    // 3. 使用 class-transformer 转换为目标 VO 类
    const voInstance = plainToInstance(options.voClass, filteredData, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
      exposeDefaultValues: true,
    });

    // 4. 处理嵌套对象（如果启用）
    if (options.deep) {
      return this.transformNested(voInstance, options);
    }

    return voInstance;
  }

  /**
   * 字段过滤
   * @param data 原始数据
   * @param options 转换配置
   * @returns 过滤后的数据
   */
  private static filterFields(data: any, options: VoTransformOptions): any {
    const result = { ...data };

    // 排除敏感字段
    if (options.excludeSensitive) {
      this.SENSITIVE_FIELDS.forEach(field => {
        delete result[field];
      });
    }

    // 排除自定义字段
    if (options.excludeFields?.length) {
      options.excludeFields.forEach(field => {
        delete result[field];
      });
    }

    // 只包含指定字段（优先级最高）
    if (options.includeFields?.length) {
      const filteredResult: any = {};
      options.includeFields.forEach(field => {
        if (field in result) {
          filteredResult[field] = result[field];
        }
      });
      return filteredResult;
    }

    return result;
  }

  /**
   * 处理嵌套对象转换
   * @param voInstance VO 实例
   * @param options 转换配置
   * @returns 处理后的 VO 实例
   */
  private static transformNested<T>(voInstance: T, options: VoTransformOptions): T {
    // 这里可以根据需要实现嵌套对象的递归转换
    // 例如：处理关联实体、嵌套数组等
    
    // 简单实现：遍历对象属性，对嵌套对象应用相同的转换逻辑
    if (typeof voInstance === 'object' && voInstance !== null) {
      Object.keys(voInstance).forEach(key => {
        const value = (voInstance as any)[key];
        if (value && typeof value === 'object') {
          if (Array.isArray(value)) {
            // 处理数组类型的嵌套对象
            (voInstance as any)[key] = value.map(item => 
              typeof item === 'object' ? this.transformSingle(item, options) : item
            );
          } else {
            // 处理单个嵌套对象
            (voInstance as any)[key] = this.transformSingle(value, options);
          }
        }
      });
    }

    return voInstance;
  }

  /**
   * 检查数据是否需要转换
   * @param data 数据
   * @param voClass VO 类
   * @returns 是否需要转换
   */
  static needsTransform(data: any, voClass: Type<any>): boolean {
    if (!data) return false;
    
    // 如果已经是目标 VO 类的实例，则不需要转换
    return !(data instanceof voClass);
  }
}
