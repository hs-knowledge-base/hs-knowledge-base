import { BaseException, ExceptionSeverity, ExceptionContext } from './base.exception';
import { AuthErrorCode, UserErrorCode } from './error-codes.enum';

/**
 * 认证授权异常类
 * 用于处理认证和授权相关的异常
 */
export class AuthException extends BaseException {
  constructor(
    errorCode: AuthErrorCode | UserErrorCode,
    message: string,
    context: ExceptionContext = {},
    severity: ExceptionSeverity = ExceptionSeverity.MEDIUM,
  ) {
    super(errorCode, message, severity, context, true, false);
  }
}
