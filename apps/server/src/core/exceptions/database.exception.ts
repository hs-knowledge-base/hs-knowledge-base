import { BaseException, ExceptionSeverity, ExceptionContext } from './base.exception';
import { DatabaseErrorCode } from './error-codes.enum';

/**
 * 数据库异常类
 * 用于处理数据库相关的异常
 */
export class DatabaseException extends BaseException {
  constructor(
    errorCode: DatabaseErrorCode,
    message: string,
    context: ExceptionContext = {},
    severity: ExceptionSeverity = ExceptionSeverity.HIGH,
  ) {
    super(errorCode, message, severity, context, true, true);
  }

  /**
   * 从原生数据库错误创建异常
   */
  static fromNativeError(error: any, context?: ExceptionContext): DatabaseException {
    // 根据不同数据库的错误码进行映射
    if (error.code) {
      switch (error.code) {
        case 'ER_DUP_ENTRY':
        case '23000':
          return new DatabaseException(
            DatabaseErrorCode.CONSTRAINT_VIOLATION,
            `数据重复: ${error.message}`,
            context,
            ExceptionSeverity.MEDIUM,
          );

        case 'ER_NO_REFERENCED_ROW_2':
        case '23503':
          return new DatabaseException(
            DatabaseErrorCode.CONSTRAINT_VIOLATION,
            `外键约束违反: ${error.message}`,
            context,
            ExceptionSeverity.MEDIUM,
          );

        case 'ER_LOCK_DEADLOCK':
        case '40001':
          return new DatabaseException(
            DatabaseErrorCode.TRANSACTION_ERROR,
            `检测到死锁: ${error.message}`,
            context,
            ExceptionSeverity.HIGH,
          );

        default:
          return new DatabaseException(
            DatabaseErrorCode.QUERY_ERROR,
            `数据库操作失败: ${error.message}`,
            context,
            ExceptionSeverity.HIGH,
          );
      }
    }

    return new DatabaseException(
      DatabaseErrorCode.QUERY_ERROR,
      `数据库操作失败: ${error.message}`,
      {
        ...context,
        metadata: {
          ...context?.metadata,
          originalError: error,
        },
      },
      ExceptionSeverity.HIGH,
    );
  }
}
