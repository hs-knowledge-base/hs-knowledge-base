import {UserRes} from "@/types/auth";

/**
 * 更新用户请求
 */
export interface UpdateUserReq {
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roleIds?: number[];
}

/**
 * 创建用户请求
 */
export interface CreateUserReq {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roleIds?: number[];
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
 * 用户分页查询请求
 */
export interface GetUsersReq {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  roleId?: number;
}
