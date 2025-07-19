import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseException, ExceptionSeverity } from './base.exception';
import { SystemException } from './system.exception';
import { DatabaseException } from './database.exception';
import { QueryFailedError } from 'typeorm';
import { SystemErrorCode } from './error-codes.enum';
import { ApiResponseInterfaces } from '../interfaces/response.interfaces';

/**
 * 全局异常过滤器
 * 统一处理所有异常，提供标准化的错误响应
 */
@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 生成请求ID（如果没有的话）
    const requestId = request.headers['x-request-id'] as string || this.generateRequestId();

    // 处理不同类型的异常
    const processedException = this.processException(exception, requestId);

    // 记录异常日志
    this.logException(processedException, request);

    // 构建响应
    const errorResponse = this.buildErrorResponse(processedException, request);

    // 设置响应状态码并返回
    response.status(processedException.getStatus()).json(errorResponse);
  }

  /**
   * 处理异常，将各种异常转换为BaseException
   */
  private processException(exception: unknown, requestId: string): BaseException {
    // 如果已经是自定义异常，直接返回
    if (exception instanceof BaseException) {
      return exception.withRequestId(requestId);
    }

    // 处理TypeORM数据库异常
    if (exception instanceof QueryFailedError) {
      return DatabaseException.fromNativeError(exception).withRequestId(requestId);
    }

    // 处理NestJS HTTP异常
    if (exception instanceof HttpException) {
      return new SystemException(
        SystemErrorCode.INTERNAL_ERROR,
        exception.message,
        { requestId },
        ExceptionSeverity.MEDIUM,
      );
    }

    // 处理原生JavaScript错误
    if (exception instanceof Error) {
      return new SystemException(
        SystemErrorCode.INTERNAL_ERROR,
        exception.message,
        { requestId, metadata: { stack: exception.stack } },
        ExceptionSeverity.HIGH,
      );
    }

    // 处理其他类型的异常
    return new SystemException(
      SystemErrorCode.INTERNAL_ERROR,
      '未知错误',
      { requestId, metadata: { originalException: String(exception) } },
      ExceptionSeverity.HIGH,
    );
  }

  /**
   * 记录异常日志
   */
  private logException(exception: BaseException, request: Request): void {
    if (!exception.shouldLog) {
      return;
    }

    const logContext = {
      errorCode: exception.errorCode,
      severity: exception.severity,
      url: request.url,
      method: request.method,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      userId: exception.context.userId,
      requestId: exception.context.requestId,
    };

    const logMessage = `${exception.message} | ${JSON.stringify(logContext)}`;

    // 根据严重级别选择日志级别
    switch (exception.severity) {
      case ExceptionSeverity.LOW:
        this.logger.debug(logMessage);
        break;

      case ExceptionSeverity.MEDIUM:
        this.logger.warn(logMessage);
        break;

      case ExceptionSeverity.HIGH:
        this.logger.error(logMessage, exception.stack);
        break;

      case ExceptionSeverity.CRITICAL:
        this.logger.fatal(logMessage, exception.stack);
        break;

      default:
        this.logger.error(logMessage, exception.stack);
    }
  }

  /**
   * 构建错误响应
   */
  private buildErrorResponse(exception: BaseException, request: Request): ApiResponseInterfaces<null> {
    const isDevelopment = process.env.NODE_ENV === 'development';

    const baseResponse: ApiResponseInterfaces<null> = {
      code: exception.errorCode, // 使用业务错误码，不是 HTTP 状态码
      data: null,
      message: exception.message,
      errors: null,
      requestId: exception.context.requestId,
      timestamp: exception.context.timestamp?.toISOString(),
      path: request.url,
    };

    // 开发环境在 errors 字段中返回更多调试信息
    if (isDevelopment) {
      baseResponse.errors = {
        severity: exception.severity,
        context: exception.context,
        stack: exception.stack,
        httpStatus: exception.getStatus(), // HTTP 状态码放在调试信息中
      };
    }

    return baseResponse;
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
