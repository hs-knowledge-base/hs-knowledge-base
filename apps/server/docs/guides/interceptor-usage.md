# 拦截器使用指南

## 🚀 默认行为

拦截器已全局注册，自动包装所有响应：

```typescript
@Get('users')
async getUsers() {
  return [{ id: 1, username: 'john' }];
}

// 自动转换为：
{
  "code": 200,
  "data": [{ "id": 1, "username": "john" }],
  "message": "请求成功",
  "errors": null
}
```

## 🎛️ 控制行为

### 跳过自动包装
```typescript
@Get('download')
@SkipResponseTransform()
async downloadFile() {
  return fileStream; // 直接返回
}
```

### 手动构建响应
```typescript
@Post('users')
@SkipResponseTransform()
async createUser() {
  return ResponseUtil.created(user, '创建成功');
}
```

### 结合 VO 转换
```typescript
@Get('users/:id')
@VoTransform({ voClass: UserVo, excludeSensitive: true })
async getUser() {
  return user; // 自动 VO 转换 + 响应包装
}
```

## 📊 响应格式

### 成功响应
```json
{
  "code": 200,
  "data": { /* 实际数据 */ },
  "message": "请求成功",
  "errors": null
}
```

### 错误响应
```json
{
  "code": 400,
  "data": null,
  "message": "请求失败",
  "errors": "具体错误信息"
}
```

## 🔄 特殊场景

### 文件下载
```typescript
@Get('download')
@SkipResponseTransform() // 必须跳过
async downloadFile() {
  return fileStream;
}
```

### 流式响应
```typescript
@Get('events')
@SkipResponseTransform() // 必须跳过
async getEvents() {
  return eventStream;
}
```

### 自定义状态码
```typescript
@Post('users')
@HttpCode(201)
async createUser() {
  return user; // 响应码 201，消息 "创建成功"
}
```

## 🎯 最佳实践

- **普通 API**：让拦截器自动处理
- **文件操作**：使用 `@SkipResponseTransform()`
- **自定义响应**：使用 `ResponseUtil` 工具类
- **错误处理**：抛出异常，让全局过滤器处理
