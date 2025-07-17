import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@/modules/user/entities/user.entity';

/**
 * 当前用户装饰器
 * 从 JWT token 中解析并获取当前登录用户信息
 * 
 * @description 
 * 该装饰器会从请求上下文中提取经过 JWT 验证的用户信息
 * 需要配合 JwtAuthGuard 使用
 * 
 * @example
 * ```typescript
 * // 基础用法 - 获取完整用户对象
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * async getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 * 
 * // 获取用户ID
 * @Get('my-posts')
 * @UseGuards(JwtAuthGuard)
 * async getMyPosts(@CurrentUser('id') userId: number) {
 *   return this.postService.findByUserId(userId);
 * }
 * 
 * // 获取用户名
 * @Post('posts')
 * @UseGuards(JwtAuthGuard)
 * async createPost(
 *   @CurrentUser('username') username: string,
 *   @Body() postData: CreatePostDto
 * ) {
 *   return this.postService.create({ ...postData, author: username });
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext): User | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // 如果没有用户信息，返回 null
    if (!user) {
      return null;
    }

    // 如果指定了字段名，返回对应字段的值
    if (data) {
      return user[data];
    }

    // 否则返回完整的用户对象
    return user;
  },
);

/**
 * 可选的当前用户装饰器
 * 即使没有登录也不会抛出错误，返回 null
 * 
 * @description
 * 用于可选登录的场景，如果用户已登录则返回用户信息，否则返回 null
 * 不需要配合 JwtAuthGuard 使用，但需要确保路由是公开的
 * 
 * @example
 * ```typescript
 * @Public()
 * @Get('posts')
 * async getPosts(@OptionalCurrentUser() user?: User) {
 *   if (user) {
 *     // 已登录用户，可以看到更多内容
 *     return this.postService.findAllWithPrivate(user.id);
 *   } else {
 *     // 未登录用户，只能看到公开内容
 *     return this.postService.findPublic();
 *   }
 * }
 * ```
 */
export const OptionalCurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext): User | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // 如果没有用户信息，返回 null（不抛出错误）
    if (!user) {
      return null;
    }

    // 如果指定了字段名，返回对应字段的值
    if (data) {
      return user[data];
    }

    // 否则返回完整的用户对象
    return user;
  },
);

/**
 * 用户ID装饰器
 * 快捷方式，直接获取当前用户的ID
 * 
 * @example
 * ```typescript
 * @Get('my-profile')
 * @UseGuards(JwtAuthGuard)
 * async getMyProfile(@UserId() userId: number) {
 *   return this.userService.findOne(userId);
 * }
 * ```
 */
export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.id;
  },
);

/**
 * 用户名装饰器
 * 快捷方式，直接获取当前用户的用户名
 * 
 * @example
 * ```typescript
 * @Post('posts')
 * @UseGuards(JwtAuthGuard)
 * async createPost(
 *   @Username() username: string,
 *   @Body() postData: CreatePostDto
 * ) {
 *   return this.postService.create({ ...postData, author: username });
 * }
 * ```
 */
export const Username = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.username;
  },
);
