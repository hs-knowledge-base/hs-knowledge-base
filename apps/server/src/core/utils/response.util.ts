import { HttpStatus } from '@nestjs/common';
import { ApiResponseInterfaces } from '@/core';

/**
 * 响应工具类
 * 提供手动构建响应的便捷方法，用于特殊场景
 */
export class ResponseUtil {
  /**
   * 构建成功响应
   * @param data 响应数据
   * @param message 响应消息
   * @param code 状态码
   * @returns 标准响应格式
   */
  static success<T>(
    data: T, 
    message = '请求成功', 
    code = HttpStatus.OK
  ): ApiResponseInterfaces<T> {
    return {
      code,
      data,
      message,
      errors: null,
    };
  }

  /**
   * 构建错误响应
   * @param message 错误消息
   * @param code 业务错误码
   * @param errors 详细错误信息
   * @param requestId 请求ID
   * @returns 标准错误响应格式
   */
  static error(
    message: string,
    code: number,
    errors: any = null,
    requestId?: string
  ): ApiResponseInterfaces<null> {
    return {
      code,
      data: null,
      message,
      errors,
      requestId,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 构建创建成功响应
   * @param data 创建的数据
   * @param message 响应消息
   * @returns 标准响应格式
   */
  static created<T>(
    data: T, 
    message = '创建成功'
  ): ApiResponseInterfaces<T> {
    return this.success(data, message, HttpStatus.CREATED);
  }

  /**
   * 构建无内容响应
   * @param message 响应消息
   * @returns 标准响应格式
   */
  static noContent(message = '操作成功'): ApiResponseInterfaces<null> {
    return {
      code: HttpStatus.NO_CONTENT,
      data: null,
      message,
      errors: null,
    };
  }

  /**
   * 构建分页响应
   * @param items 数据列表
   * @param total 总数量
   * @param page 当前页码
   * @param pageSize 每页数量
   * @param message 响应消息
   * @returns 标准分页响应格式
   */
  static paginated<T>(
    items: T[],
    total: number,
    page: number,
    pageSize: number,
    message = '获取数据成功'
  ): ApiResponseInterfaces<{
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const totalPages = Math.ceil(total / pageSize);
    
    return this.success({
      items,
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }, message);
  }

  /**
   * 检查响应是否为成功响应
   * @param response 响应对象
   * @returns 是否为成功响应
   */
  static isSuccess(response: ApiResponseInterfaces<any>): boolean {
    return response.code >= 200 && response.code < 300;
  }

  /**
   * 检查响应是否为错误响应
   * @param response 响应对象
   * @returns 是否为错误响应
   */
  static isError(response: ApiResponseInterfaces<any>): boolean {
    return response.code >= 400;
  }

  /**
   * 检查响应是否为业务错误码
   * @param response 响应对象
   * @returns 是否为业务错误码（非 HTTP 状态码）
   */
  static isBusinessError(response: ApiResponseInterfaces<any>): boolean {
    // 业务错误码通常是 4 位数，HTTP 状态码是 3 位数
    return response.code >= 1000;
  }
}
