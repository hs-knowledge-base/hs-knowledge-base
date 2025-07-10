/**
 * 业务异常枚举
 */
export enum BusinessErrorCodeEnum {
  // 参数错误相关 100xx
  PARAM_ERROR = 10001,
  PARAM_MISSING = 10002,

  // 用户相关 200xx
  USER_NOT_FOUND = 20001,
  USER_ALREADY_EXISTS = 20002,
  PASSWORD_ERROR = 20003,

  // 权限相关 300xx
  UNAUTHORIZED = 30001,
  FORBIDDEN = 30002,

  // 其他业务错误 900xx
  BUSINESS_ERROR = 90001,
}
