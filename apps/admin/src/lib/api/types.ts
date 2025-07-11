/**
 * API 相关的通用类型定义
 */

/**
 * 标准 API 响应格式
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
}

/**
 * 分页响应格式
 */
export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 分页查询参数
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 通用查询参数
 */
export interface QueryParams extends PaginationParams {
  search?: string;
  filters?: Record<string, any>;
}

/**
 * API 错误响应格式
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  details?: any;
  timestamp?: string;
}
