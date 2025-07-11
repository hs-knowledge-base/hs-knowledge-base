/**
 * API 相关的通用类型定义
 */

/**
 * 标准 API 响应格式
 */
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
  errors: any;
}

/**
 * 分页数据格式
 */
export interface PaginatedData<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 分页响应格式
 */
export interface PaginatedResponse<T = any> extends ApiResponse<PaginatedData<T>> {}

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
