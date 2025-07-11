# JWT 认证系统

## 🎯 作用

提供完整的用户认证功能，包括登录、注册、令牌刷新和权限验证。

## 🔧 核心组件

- **JwtAuthGuard** - JWT 令牌验证守卫
- **LocalAuthGuard** - 本地用户名密码验证
- **AuthService** - 认证业务逻辑
- **JwtStrategy** - JWT 策略配置

## 📋 配置参数

### 环境变量
```env
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=5d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d
```

### JWT 配置
```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
})
```

## 🔒 守卫使用

### 保护路由
```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@Request() req) {
  return req.user;
}
```

### 公开路由
```typescript
@Public()
@Post('login')
async login() {
  return this.authService.login(user);
}
```

### 本地认证
```typescript
@UseGuards(LocalAuthGuard)
@Post('login')
async login(@Request() req) {
  return this.authService.login(req.user);
}
```

## 🔄 令牌流程

### 登录流程
1. 用户提交用户名密码
2. LocalAuthGuard 验证凭据
3. 生成 access_token 和 refresh_token
4. 返回令牌和用户信息

### 访问流程
1. 客户端携带 access_token
2. JwtAuthGuard 验证令牌
3. 解析用户信息到 req.user
4. 继续执行业务逻辑

### 刷新流程
1. access_token 过期
2. 使用 refresh_token 请求新令牌
3. 验证 refresh_token 有效性
4. 生成新的 access_token 和 refresh_token

## 🛡️ 安全特性

- **令牌过期** - access_token 5天，refresh_token 7天
- **密码加密** - bcrypt 哈希存储
- **令牌签名** - HMAC SHA256 签名验证
- **刷新机制** - 支持令牌自动刷新

## 📊 响应格式

### 登录成功
```json
{
  "code": 200,
  "data": {
    "user": { "id": "1", "username": "john" },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "登录成功",
  "errors": null
}
```

### 令牌验证失败
```json
{
  "code": 401,
  "data": null,
  "message": "未授权访问",
  "errors": "令牌无效或已过期"
}
```
