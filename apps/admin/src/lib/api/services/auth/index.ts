import { UserRes } from "@/types/auth";
import { alovaClient } from "@/lib/api/client";
import { ApiResponse } from "@/lib/api/types";
import { RefreshTokenRes } from "./type";
import { LoginReq, LoginRes } from "../users/type";

export const authApi = {
  /**
   * 用户登录
   */
  login: (loginData: LoginReq) =>
    alovaClient.Post<ApiResponse<LoginRes>>("/auth/login", loginData),

  /**
   * 刷新访问令牌
   */
  refreshToken: (refreshToken: string) =>
    alovaClient.Post<ApiResponse<RefreshTokenRes>>("/auth/refresh", {
      refreshToken,
    }),

  /**
   * 用户登出
   */
  logout: () => 
    alovaClient.Post<ApiResponse<null>>("/auth/logout"),

  /**
   * 获取当前用户信息
   */
  getProfile: () => 
    alovaClient.Get<ApiResponse<UserRes>>("/auth/profile"),

  /**
   * 检查令牌有效性
   */
  checkToken: () =>
    alovaClient.Get<ApiResponse<{ valid: boolean }>>("/auth/check"),

  /**
   * 检查用户权限
   */
  checkPermission: (permissionCode: string) =>
    alovaClient.Post<ApiResponse<{ hasPermission: boolean }>>("/auth/check-permission", {
      permissionCode,
    }),

  /**
   * 获取用户菜单权限
   */
  getMenuPermissions: () =>
    alovaClient.Get<ApiResponse<any[]>>("/auth/menu-permissions"),
};
