import { alovaClient } from '../client';
import { ApiResponse } from '../types';
import { UserRes, LoginReq, LoginRes, RegisterReq, RefreshTokenRes } from '../../../types/auth';

/**
 * 认证相关 API 服务
 * 处理登录、注册、令牌管理等认证功能
 */



/**
 * 认证 API 服务
 */
export const authApi = {
  /**
   * 用户登录
   */
  login: (loginData: LoginReq) =>
    alovaClient.Post<ApiResponse<LoginRes>>('/auth/login', loginData),

  /**
   * 用户注册
   */
  register: (registerData: RegisterReq) =>
    alovaClient.Post<ApiResponse<LoginRes>>('/auth/register', registerData),

  /**
   * 刷新访问令牌
   */
  refreshToken: (refreshToken: string) =>
    alovaClient.Post<ApiResponse<RefreshTokenRes>>('/auth/refresh', { refreshToken }),

  /**
   * 用户登出
   */
  logout: () =>
    alovaClient.Post<ApiResponse<null>>('/auth/logout'),

  /**
   * 获取当前用户信息
   */
  getProfile: () =>
    alovaClient.Get<ApiResponse<UserRes>>('/auth/profile'),

  /**
   * 检查令牌有效性
   */
  checkToken: () =>
    alovaClient.Get<ApiResponse<{ valid: boolean }>>('/auth/check'),
};
