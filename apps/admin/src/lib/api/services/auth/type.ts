import { QueryParams } from "@/lib/api/types";
import { UserRes } from "@/types/auth";

export interface UserReq extends QueryParams {
  isActive?: boolean;
  level?: number;
}

export interface updateUserAttributesReq {
  level?: number;
  skills?: string[];
  [key: string]: any;
}

/**
 * 刷新令牌响应
 */
export interface RefreshTokenRes {
  accessToken: string;
  refreshToken: string;
}

/**
 * 注册请求 - 对应服务端 RegisterDto
 */
export interface RegisterReq {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * 注册响应 - 对应服务端 RegisterResponseVo
 */
export interface RegisterRes {
  user: UserRes;
  accessToken: string;
  refreshToken: string;
}