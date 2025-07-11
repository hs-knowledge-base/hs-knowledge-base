# VO 装饰器使用指南

## 🚀 基础用法

```typescript
@Get('users/:id')
@VoTransform({ voClass: UserVo })
async getUser(@Param('id') id: string) {
  return await this.userService.findOne(id);
}
```

## 📋 配置参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `voClass` | `Type<any>` | 目标 VO 类 | `UserVo` |
| `excludeSensitive` | `boolean` | 排除敏感字段 | `true` |
| `excludeFields` | `string[]` | 排除指定字段 | `['email']` |
| `includeFields` | `string[]` | 只包含指定字段 | `['id', 'name']` |
| `deep` | `boolean` | 深度转换嵌套对象 | `true` |
| `transform` | `function` | 自定义转换函数 | `(data) => data` |

## 🎯 常用场景

### 排除敏感字段
```typescript
@VoTransform({ voClass: UserVo, excludeSensitive: true })
async getProfile() { return user; }
```

### 只返回指定字段
```typescript
@VoTransform({ voClass: UserVo, includeFields: ['id', 'username'] })
async getBasic() { return user; }
```

### 处理嵌套对象
```typescript
@VoTransform({ voClass: UserVo, deep: true })
async getDetail() { return userWithRoles; }
```

### 自定义转换
```typescript
@VoTransform({
  voClass: UserVo,
  transform: (data) => {
    data.displayName = `${data.firstName} ${data.lastName}`;
    return data;
  }
})
async getUser() { return user; }
```

## 🔧 VO 类设计

```typescript
import { Expose, Transform } from 'class-transformer';
import { DateTransformUtil } from '@/core/utils';

export class UserVo {
  @Expose() id: string;
  @Expose() username: string;

  @Expose()
  @Transform(({ value }) => DateTransformUtil.toISOString(value))
  createdAt: string;

  // 计算字段
  @Expose()
  @Transform(({ obj }) => `${obj.firstName}${obj.lastName}`)
  fullName?: string;
}
```

## 📅 日期格式化

```typescript
// ISO 格式：2024-01-01T12:30:45.123Z
DateTransformUtil.toISOString(value)

// 本地格式：2024/1/1
DateTransformUtil.toLocaleDateString(value)

// 相对时间：3小时前
DateTransformUtil.toRelativeTime(value)
```

## ⚠️ 注意事项

- VO 字段必须使用 `@Expose()` 装饰器
- 优先级：`includeFields` > `excludeFields` > `excludeSensitive`
- 嵌套转换需要 `@Type()` 装饰器
