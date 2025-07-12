# 拦截器系统

## 🎯 作用

自动将控制器返回的数据包装成标准格式：

```typescript
// 控制器返回
return { id: 1, name: 'test' };

// 拦截器自动包装为
{
  "code": 200,
  "data": { "id": 1, "name": "test" },
  "message": "请求成功",
  "errors": null
}
```

## 🔧 核心功能

1. **统一响应格式** - 所有 API 返回相同结构
2. **自动 VO 转换** - 配合 `@VoTransform` 装饰器
3. **智能跳过** - 文件下载、流式响应等自动跳过
4. **状态码处理** - 根据 HTTP 状态码生成对应消息

## 🚫 自动跳过场景

- **文件下载** - `application/pdf`, `application/zip` 等
- **流式响应** - `text/event-stream`
- **媒体文件** - `image/*`, `video/*`, `audio/*`
- **重定向** - 3xx 状态码
- **手动跳过** - `@SkipResponseTransform()` 装饰器

## 📋 响应格式

```typescript
interface ApiResponse<T> {
  code: number;     // HTTP 状态码
  data: T;         // 实际数据
  message: string; // 响应消息
  errors: any;     // 错误信息
}
```

## 🎛️ 使用方式

### 默认行为（推荐）
```typescript
@Get('users')
async getUsers() {
  return users; // 自动包装
}
```

### 跳过包装
```typescript
@Get('download')
@SkipResponseTransform()
async download() {
  return fileStream; // 直接返回
}
```

### 手动包装
```typescript
@Post('users')
@SkipResponseTransform()
async create() {
  return ResponseUtil.created(user, '创建成功');
}
```
