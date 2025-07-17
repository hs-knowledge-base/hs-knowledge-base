import { QueryParams } from "@/lib/api/types";

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
