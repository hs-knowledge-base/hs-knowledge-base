/**
 * 系统异常错误码枚举
 * 错误码规则：XXYY
 * XX: 模块代码 (10=系统, 20=用户, 30=权限, 40=业务, 50=数据库)
 * YY: 错误序号 (01-99)
 */

/**
 * 系统异常 (10xx)
 */
export enum SystemErrorCode {
  INTERNAL_ERROR = 1001,
  CONFIG_ERROR = 1002,
  SERVICE_UNAVAILABLE = 1003,
}

/**
 * 用户异常 (20xx)
 */
export enum UserErrorCode {
  USER_NOT_FOUND = 2001,
  USER_ALREADY_EXISTS = 2002,
  USER_DISABLED = 2003,
  PASSWORD_INCORRECT = 2004,
}

/**
 * 权限异常 (30xx)
 */
export enum AuthErrorCode {
  TOKEN_INVALID = 3001,
  TOKEN_EXPIRED = 3002,
  PERMISSION_DENIED = 3003,
  ACCESS_FORBIDDEN = 3004,
}

/**
 * 业务异常 (40xx)
 */
export enum BusinessErrorCode {
  RESOURCE_NOT_FOUND = 4001,
  RESOURCE_ALREADY_EXISTS = 4002,
  OPERATION_NOT_ALLOWED = 4003,
  BUSINESS_RULE_VIOLATION = 4004,
}

/**
 * 数据库异常 (50xx)
 */
export enum DatabaseErrorCode {
  CONNECTION_ERROR = 5001,
  QUERY_ERROR = 5002,
  CONSTRAINT_VIOLATION = 5003,
  TRANSACTION_ERROR = 5004,
}

/**
 * 错误码类型联合
 */
export type ErrorCode =
  | SystemErrorCode
  | UserErrorCode
  | AuthErrorCode
  | BusinessErrorCode
  | DatabaseErrorCode;

/**
 * 错误码到HTTP状态码的映射
 */
export const ERROR_CODE_TO_HTTP_STATUS: Record<number, number> = {
  // 系统错误 -> 500
  [SystemErrorCode.INTERNAL_ERROR]: 500,
  [SystemErrorCode.CONFIG_ERROR]: 500,
  [SystemErrorCode.SERVICE_UNAVAILABLE]: 503,

  // 用户错误 -> 400/404/409
  [UserErrorCode.USER_NOT_FOUND]: 404,
  [UserErrorCode.USER_ALREADY_EXISTS]: 409,
  [UserErrorCode.PASSWORD_INCORRECT]: 400,
  [UserErrorCode.USER_DISABLED]: 403,

  // 权限错误 -> 401/403
  [AuthErrorCode.TOKEN_INVALID]: 401,
  [AuthErrorCode.TOKEN_EXPIRED]: 401,
  [AuthErrorCode.PERMISSION_DENIED]: 403,
  [AuthErrorCode.ACCESS_FORBIDDEN]: 403,

  // 业务错误 -> 400/404/409
  [BusinessErrorCode.RESOURCE_NOT_FOUND]: 404,
  [BusinessErrorCode.RESOURCE_ALREADY_EXISTS]: 409,
  [BusinessErrorCode.OPERATION_NOT_ALLOWED]: 400,
  [BusinessErrorCode.BUSINESS_RULE_VIOLATION]: 400,

  // 数据库错误 -> 500/409
  [DatabaseErrorCode.CONNECTION_ERROR]: 500,
  [DatabaseErrorCode.QUERY_ERROR]: 500,
  [DatabaseErrorCode.CONSTRAINT_VIOLATION]: 409,
  [DatabaseErrorCode.TRANSACTION_ERROR]: 500,
};
