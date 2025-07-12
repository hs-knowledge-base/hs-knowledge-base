import { SetMetadata, Type } from '@nestjs/common';

/**
 * VO 转换配置接口
 */
export interface VoTransformOptions {
  /**
   * 目标 VO 类
   */
  voClass: Type<any>;
  
  /**
   * 是否排除敏感字段
   */
  excludeSensitive?: boolean;
  
  /**
   * 自定义排除字段
   */
  excludeFields?: string[];
  
  /**
   * 自定义包含字段（优先级高于排除）
   */
  includeFields?: string[];
  
  /**
   * 是否处理嵌套对象
   */
  deep?: boolean;
  
  /**
   * 自定义转换函数
   */
  transform?: (data: any) => any;
}

/**
 * VO 转换装饰器元数据键
 */
export const VO_TRANSFORM_KEY = 'vo-transform';

/**
 * VO 转换装饰器
 * 用于控制器方法的响应数据自动转换为 VO
 * 
 * @param options VO 转换配置
 * @returns 装饰器函数
 * 
 * @example
 * ```typescript
 * // 基础用法
 * @VoTransform({ voClass: UserVo })
 * async findUser() {
 *   return userEntity; // 自动转换为 UserVo
 * }
 * 
 * // 排除敏感字段
 * @VoTransform({ 
 *   voClass: UserVo, 
 *   excludeSensitive: true 
 * })
 * async getProfile() {
 *   return userEntity; // 自动排除密码等敏感字段
 * }
 * 
 * // 自定义字段控制
 * @VoTransform({ 
 *   voClass: UserVo,
 *   includeFields: ['id', 'username', 'email']
 * })
 * async getBasicInfo() {
 *   return userEntity; // 只包含指定字段
 * }
 * ```
 */
export const VoTransform = (options: VoTransformOptions) => 
  SetMetadata(VO_TRANSFORM_KEY, options);
