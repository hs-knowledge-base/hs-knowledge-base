import { BaseException, ExceptionSeverity, ExceptionContext } from './base.exception';
import { SystemErrorCode } from './error-codes.enum';

/**
 * 系统异常类
 * 用于处理系统级别的异常
 */
export class SystemException extends BaseException {
  constructor(
    errorCode: SystemErrorCode,
    message: string,
    context: ExceptionContext = {},
    severity: ExceptionSeverity = ExceptionSeverity.HIGH,
  ) {
    super(errorCode, message, severity, context, true, true);
  }
}
