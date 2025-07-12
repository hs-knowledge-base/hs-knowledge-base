/**
 * API 请求和响应拦截器
 * 处理认证、错误处理、响应格式化等通用逻辑
 */

/**
 * 认证拦截器 - 自动添加 JWT token
 */
export function authInterceptor(method: any) {
  // 检查是否在浏览器环境中（避免 SSR 问题）
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      method.config.headers = method.config.headers || {};
      method.config.headers.Authorization = `Bearer ${token}`;
    }
  }
}

/**
 * 响应成功拦截器 - 统一处理响应格式
 */
export async function responseInterceptor(response: Response) {
  // 检查 HTTP 状态码
  if (response.status >= 400) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `请求失败: ${response.status}`,
      errorData
    );
  }
  
  // 返回 JSON 数据
  return response.json();
}

/**
 * 错误拦截器 - 统一错误处理
 */
export function errorInterceptor(error: any) {
  console.error('API 请求错误:', error);
  
  // 根据错误类型进行分类处理
  if (error instanceof ApiError) {
    // 处理 API 错误
    handleApiError(error);
  } else if (error.name === 'NetworkError') {
    // 处理网络错误
    console.error('网络连接错误，请检查网络状态');
  } else {
    // 处理其他未知错误
    console.error('未知错误:', error);
  }
  
  throw error;
}

/**
 * 自定义 API 错误类
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 处理特定的 API 错误
 */
function handleApiError(error: ApiError) {
  switch (error.status) {
    case 401:
      // 未授权 - 可能需要重新登录
      console.warn('认证失败，请重新登录');
      // 这里可以触发登出逻辑或跳转到登录页
      break;
    case 403:
      // 禁止访问 - 权限不足
      console.warn('权限不足，无法访问该资源');
      break;
    case 404:
      // 资源不存在
      console.warn('请求的资源不存在');
      break;
    case 422:
      // 验证错误
      console.warn('数据验证失败:', error.data);
      break;
    case 500:
      // 服务器错误
      console.error('服务器内部错误，请稍后重试');
      break;
    default:
      console.error(`API 错误 ${error.status}:`, error.message);
  }
}
