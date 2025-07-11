import { ApiResponseInterfaces } from '@/core/interfaces/response.interfaces';
import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * 响应数据转换拦截器
 * 统一处理响应格式，自动识别并跳过特殊响应类型
 * @template T - 响应数据的类型
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponseInterfaces<T>> {
  /**
   * 拦截并转换响应数据
   * @param context - 执行上下文，包含请求和响应对象
   * @param next - 调用处理器，处理后续逻辑
   * @returns 转换后的响应数据流
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseInterfaces<T>> {
    const response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();

    // 1. 检查是否手动跳过转换
    const skipTransform = Reflect.getMetadata('skipResponseTransform', handler);
    if (skipTransform) {
      return next.handle();
    }

    // 2. 检查特殊响应类型
    if (this.shouldSkipTransform(request, response)) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        // 3. 如果已经是标准 API 响应格式，直接返回
        if (this.isApiResponse(data)) {
          return data;
        }

        // 4. 自动转换为标准格式
        const statusCode = response.statusCode;
        return {
          code: statusCode,
          data,
          message: this.getDefaultMessage(statusCode),
          errors: null,
        };
      }),
    );
  }

  /**
   * 判断是否应该跳过转换
   */
  private shouldSkipTransform(request: any, response: any): boolean {
    const contentType = response.getHeader('Content-Type');
    const accept = request.headers.accept;

    // 流式响应
    if (contentType?.includes('text/event-stream')) {
      return true;
    }

    // 文件下载相关
    if (contentType?.includes('application/octet-stream') ||
        contentType?.includes('application/pdf') ||
        contentType?.includes('application/zip') ||
        contentType?.includes('application/vnd.') ||
        contentType?.includes('image/') ||
        contentType?.includes('video/') ||
        contentType?.includes('audio/')) {
      return true;
    }

    // 文件上传响应
    if (contentType?.includes('multipart/form-data')) {
      return true;
    }

    // WebSocket 升级
    if (request.headers.upgrade === 'websocket') {
      return true;
    }

    // 客户端期望特殊格式
    if (accept?.includes('text/html') || 
        accept?.includes('text/plain') ||
        accept?.includes('application/xml')) {
      return true;
    }

    // 重定向响应
    if (response.statusCode >= 300 && response.statusCode < 400) {
      return true;
    }

    return false;
  }

  /**
   * 检查是否已经是标准 API 响应格式
   */
  private isApiResponse(data: any): boolean {
    return data && 
           typeof data === 'object' && 
           'code' in data && 
           'data' in data && 
           'message' in data;
  }

  /**
   * 获取默认响应消息
   */
  private getDefaultMessage(statusCode: number): string {
    if (statusCode >= 500) return '服务器内部错误';
    if (statusCode >= 400) return '请求失败';
    if (statusCode >= 300) return '重定向';
    if (statusCode === 204) return '操作成功';
    if (statusCode >= 200) return '请求成功';
    return '未知状态';
  }
}
