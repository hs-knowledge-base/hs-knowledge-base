import {UserRes} from "@/types/auth";

/**
 * 更新用户请求 - 对应服务端 CreateUserDto (用于更新)
 */
export interface UpdateUserReq {
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roleIds?: number[];
  attributes?: Record<string, any>;
}

/**
 * 创建用户请求 - 对应服务端 CreateUserDto
 */
export interface CreateUserReq {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roleIds?: number[];
  attributes?: Record<string, any>;
}

/**
 * 登录请求 - 对应服务端 LoginDto
 */
export interface LoginReq {
  usernameOrEmail: string;
  password: string;
}

/**
 * 登录响应 - 对应服务端 LoginResponseVo
 */
export interface LoginRes {
  accessToken: string;
  refreshToken: string;
  user: UserRes;
}

/**
 * 用户分页查询请求
 */
export interface GetUsersReq {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  role?: string;
}
