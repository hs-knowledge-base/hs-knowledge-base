# 异常处理系统

## 概述

项目采用统一的异常处理系统，自动将异常转换为标准的 API 响应格式。

### 系统异常错误码枚举
错误码规则：XXYY
- XX: 模块代码 (10=系统, 20=用户, 30=权限, 40=业务, 50=数据库)
- YY: 错误序号 (01-99)

## 异常分类

### 1. 系统异常 (10xx)
- `1001` - 内部错误
- `1002` - 配置错误  
- `1003` - 服务不可用

### 2. 用户异常 (20xx)
- `2001` - 用户不存在
- `2002` - 用户已存在
- `2003` - 用户被禁用
- `2004` - 密码错误

### 3. 权限异常 (30xx)
- `3001` - Token 无效
- `3002` - Token 过期
- `3003` - 权限不足
- `3004` - 访问被禁止

### 4. 业务异常 (40xx)
- `4001` - 资源不存在
- `4002` - 资源已存在
- `4003` - 操作不允许
- `4004` - 业务规则违反

### 5. 数据库异常 (50xx)
- `5001` - 连接错误
- `5002` - 查询错误
- `5003` - 约束违反
- `5004` - 事务错误

## 使用方法

### 抛出异常

```typescript
import { BusinessException, BusinessErrorCode } from '@/core';

// 资源不存在
throw new BusinessException(
  BusinessErrorCode.RESOURCE_NOT_FOUND,
  '用户不存在',
  { resourceId: 123 }
);

// 权限不足
throw new AuthException(
  AuthErrorCode.PERMISSION_DENIED,
  '权限不足',
  { userId: 456, operation: 'deleteUser' }
);
```

### Controller 中使用

```typescript
@Controller('users')
export class UserController {
  
  @Get(':id')
  async getUser(@Param('id') id: number) {
    // 直接返回数据或抛出异常，系统自动处理响应格式
    return await this.userService.findById(id);
  }
}
```

## 响应格式

### 成功响应
```json
{
  "code": 200,
  "data": { "id": 1, "username": "john" },
  "message": "请求成功",
  "errors": null
}
```

### 异常响应
```json
{
  "code": 4001,
  "data": null,
  "message": "用户不存在",
  "errors": null,
  "requestId": "req_1234567890_abc123",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "path": "/api/users/123"
}
```

### 开发环境异常响应
```json
{
  "code": 5001,
  "data": null,
  "message": "数据库连接失败",
  "errors": {
    "severity": "HIGH",
    "context": { "userId": 123, "operation": "findById" },
    "stack": "Error: Connection failed...",
    "httpStatus": 500
  },
  "requestId": "req_1234567890_def456",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "path": "/api/users/123"
}
```

## 注意事项

1. **code 字段含义**：
   - 成功时：HTTP 状态码 (200, 201, 204 等)
   - 异常时：业务错误码 (1001, 2001, 4001 等)

2. **自动处理**：
   - 成功响应由 `TransformInterceptor` 自动包装
   - 异常响应由 `GlobalExceptionFilter` 自动处理

3. **调试信息**：
   - 生产环境只返回基本错误信息
   - 开发环境在 `errors` 字段中提供详细调试信息

4. **数据库异常**：
   - 原生数据库错误会自动转换为自定义异常
   - 使用 `DatabaseException.fromNativeError()` 进行转换
