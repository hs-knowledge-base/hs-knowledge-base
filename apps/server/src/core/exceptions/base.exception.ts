import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, ERROR_CODE_TO_HTTP_STATUS } from './error-codes.enum';

/**
 * 异常严重级别
 */
export enum ExceptionSeverity {
  LOW = 'low',           // 低级别：用户输入错误等
  MEDIUM = 'medium',     // 中级别：业务逻辑错误等
  HIGH = 'high',         // 高级别：系统错误等
  CRITICAL = 'critical', // 严重级别：数据库连接失败等
}

/**
 * 异常上下文信息
 */
export interface ExceptionContext {
  /** 用户ID */
  userId?: string | number;
  /** 请求ID */
  requestId?: string;
  /** 操作类型 */
  operation?: string;
  /** 资源ID */
  resourceId?: string | number;
  /** 额外的上下文数据 */
  metadata?: Record<string, any>;
  /** 堆栈跟踪 */
  stackTrace?: string;
  /** 时间戳 */
  timestamp?: Date;
}

/**
 * 基础异常类
 * 所有自定义异常的基类
 */
export abstract class BaseException extends HttpException {
  /** 异常错误码 */
  public readonly errorCode: ErrorCode;
  
  /** 异常严重级别 */
  public readonly severity: ExceptionSeverity;
  
  /** 异常上下文信息 */
  public readonly context: ExceptionContext;
  
  /** 是否需要记录日志 */
  public readonly shouldLog: boolean;
  
  /** 是否需要通知管理员 */
  public readonly shouldNotify: boolean;

  constructor(
    errorCode: ErrorCode,
    message: string,
    severity: ExceptionSeverity = ExceptionSeverity.MEDIUM,
    context: ExceptionContext = {},
    shouldLog: boolean = true,
    shouldNotify: boolean = false,
  ) {
    // 根据错误码获取HTTP状态码
    const httpStatus = ERROR_CODE_TO_HTTP_STATUS[errorCode] || HttpStatus.INTERNAL_SERVER_ERROR;
    
    super(message, httpStatus);
    
    this.errorCode = errorCode;
    this.severity = severity;
    this.context = {
      ...context,
      timestamp: context.timestamp || new Date(),
      stackTrace: context.stackTrace || this.stack,
    };
    this.shouldLog = shouldLog;
    this.shouldNotify = shouldNotify;
    
    // 设置异常名称
    this.name = this.constructor.name;
  }

  /**
   * 获取异常的完整信息
   */
  getExceptionInfo() {
    return {
      name: this.name,
      message: this.message,
      errorCode: this.errorCode,
      severity: this.severity,
      httpStatus: this.getStatus(),
      context: this.context,
      shouldLog: this.shouldLog,
      shouldNotify: this.shouldNotify,
    };
  }



  /**
   * 判断是否为严重异常
   */
  isCritical(): boolean {
    return this.severity === ExceptionSeverity.CRITICAL;
  }

  /**
   * 判断是否为高级别异常
   */
  isHighSeverity(): boolean {
    return this.severity === ExceptionSeverity.HIGH || this.isCritical();
  }

  /**
   * 添加上下文信息
   */
  withContext(additionalContext: Partial<ExceptionContext>): this {
    Object.assign(this.context, additionalContext);
    return this;
  }

  /**
   * 设置请求ID
   */
  withRequestId(requestId: string): this {
    this.context.requestId = requestId;
    return this;
  }

  /**
   * 设置用户ID
   */
  withUserId(userId: string | number): this {
    this.context.userId = userId;
    return this;
  }

  /**
   * 设置操作类型
   */
  withOperation(operation: string): this {
    this.context.operation = operation;
    return this;
  }

  /**
   * 设置资源ID
   */
  withResourceId(resourceId: string | number): this {
    this.context.resourceId = resourceId;
    return this;
  }

  /**
   * 添加元数据
   */
  withMetadata(metadata: Record<string, any>): this {
    this.context.metadata = { ...this.context.metadata, ...metadata };
    return this;
  }
}
