import { SetMetadata } from '@nestjs/common';

/**
 * 跳过响应转换装饰器
 * 用于文件下载、流式响应等特殊场景
 * 
 * @example
 * ```typescript
 * @Get('download')
 * @SkipResponseTransform()
 * async downloadFile() {
 *   return fileStream; // 直接返回文件流，不进行响应包装
 * }
 * ```
 */
export const SkipResponseTransform = () => SetMetadata('skipResponseTransform', true);
