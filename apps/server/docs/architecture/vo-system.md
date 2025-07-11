# VO 装饰器系统

## 🎯 作用

自动将 Entity 转换为 VO，过滤敏感字段，格式化数据。

```typescript
// Entity 数据
{ id: 1, username: 'john', password: 'secret', createdAt: Date }

// VO 转换后
{ id: 1, username: 'john', createdAt: '2024-01-01T00:00:00.000Z' }
```

## 🔧 核心组件

- **`@VoTransform`** - 装饰器，配置转换规则
- **`VoTransformUtil`** - 转换工具类
- **`DateTransformUtil`** - 日期格式化工具
- **`TransformInterceptor`** - 自动执行转换

## 📋 工作流程

1. **装饰器配置** - `@VoTransform` 设置转换规则
2. **拦截器检测** - `TransformInterceptor` 读取配置
3. **数据转换** - `VoTransformUtil` 执行转换
4. **响应包装** - 包装为标准 API 格式

## 🛡️ 安全特性

### 自动排除敏感字段
```typescript
const SENSITIVE_FIELDS = [
  'password', 'passwordHash', 'salt', 'secret',
  'token', 'refreshToken', 'privateKey', 'apiKey'
];
```

### 字段控制优先级
1. `includeFields` > `excludeFields` > `excludeSensitive`
