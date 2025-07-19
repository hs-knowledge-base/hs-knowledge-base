/**
 * API 响应接口定义
 * 统一的响应格式规范
 */

/**
 * 标准 API 响应接口
 * @template T - 响应数据的类型
 */
export interface ApiResponseInterfaces<T = any> {
  /**
   * 状态码
   * - 成功时：HTTP 状态码 (200, 201, 204 等)
   * - 异常时：业务错误码 (1001, 2001, 4001 等)
   */
  code: number;

  /**
   * 响应数据
   */
  data: T;

  /**
   * 响应消息
   */
  message: string;

  /**
   * 错误信息（如果有）
   */
  errors: any;

  /**
   * 请求追踪ID（可选，异常时提供）
   */
  requestId?: string;

  /**
   * 时间戳（可选，异常时提供）
   */
  timestamp?: string;

  /**
   * 请求路径（可选，异常时提供）
   */
  path?: string;
}

/**
 * 分页响应接口
 * @template T - 列表项的类型
 */
export interface PaginatedResponse<T = any> {
  /**
   * 数据列表
   */
  items: T[];

  /**
   * 总数量
   */
  total: number;

  /**
   * 当前页码
   */
  page: number;

  /**
   * 每页数量
   */
  pageSize: number;

  /**
   * 总页数
   */
  totalPages: number;

  /**
   * 是否有下一页
   */
  hasNext: boolean;

  /**
   * 是否有上一页
   */
  hasPrev: boolean;
}
