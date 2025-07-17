import {UserRes} from "@/types/auth";

/**
 * 更新用户请求
 */
export interface UpdateUserReq {
  username?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
  firstName?: string;
  lastName?: string;
  // ABAC 用户属性
  level?: number;
  attributes?: Record<string, any>;
}

/**
 * 登录请求
 */
export interface LoginReq {
  usernameOrEmail: string;
  password: string;
}

/**
 * 登录响应
 */
export interface LoginRes {
  accessToken: string;
  refreshToken: string;
  user: UserRes;
}

/**
 * 注册请求
 */
export interface RegisterReq {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}
