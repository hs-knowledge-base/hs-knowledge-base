import { BaseException, ExceptionSeverity, ExceptionContext } from './base.exception';
import { BusinessErrorCode } from './error-codes.enum';

/**
 * 业务异常类
 * 用于处理业务逻辑相关的异常
 */
export class BusinessException extends BaseException {
  constructor(
    errorCode: BusinessErrorCode,
    message: string,
    context: ExceptionContext = {},
    severity: ExceptionSeverity = ExceptionSeverity.MEDIUM,
  ) {
    super(errorCode, message, severity, context, true, false);
  }
}
