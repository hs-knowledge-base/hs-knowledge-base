import { createAlova } from 'alova';
import adapterFetch from 'alova/fetch';
import ReactHook from 'alova/react';
import { authInterceptor, responseInterceptor, errorInterceptor } from './interceptors';

/**
 * 创建 Alova 客户端实例
 * 统一配置请求适配器、状态管理和拦截器
 */
export const alovaClient = createAlova({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  statesHook: ReactHook,
  requestAdapter: adapterFetch(),
  beforeRequest: authInterceptor,
  responded: {
    onSuccess: responseInterceptor,
    onError: errorInterceptor,
  },
});