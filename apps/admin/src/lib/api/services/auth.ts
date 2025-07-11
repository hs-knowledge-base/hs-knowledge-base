import { alovaClient } from '../client';
import { User } from '../../../types/auth';

/**
 * 认证相关 API 服务
 * 处理登录、注册、令牌管理等认证功能
 */

/**
 * 登录请求参数
 */
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * 注册请求参数
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * 刷新令牌响应
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * 认证 API 服务
 */
export const authApi = {
  /**
   * 用户登录
   */
  login: (loginData: LoginRequest) =>
    alovaClient.Post<LoginResponse>('/auth/login', loginData),

  /**
   * 用户注册
   */
  register: (registerData: RegisterRequest) =>
    alovaClient.Post<LoginResponse>('/auth/register', registerData),

  /**
   * 刷新访问令牌
   */
  refreshToken: (refreshToken: string) =>
    alovaClient.Post<RefreshTokenResponse>('/auth/refresh', { refreshToken }),

  /**
   * 用户登出
   */
  logout: () =>
    alovaClient.Post('/auth/logout'),

  /**
   * 获取当前用户信息
   */
  getProfile: () =>
    alovaClient.Get<User>('/auth/profile'),

  /**
   * 检查令牌有效性
   */
  checkToken: () =>
    alovaClient.Get('/auth/check'),
};
