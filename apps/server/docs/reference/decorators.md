# 装饰器参考

## 🎯 VO 转换装饰器

### @VoTransform
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `voClass` | `Type<any>` | ✅ | 目标 VO 类 |
| `excludeSensitive` | `boolean` | ❌ | 排除敏感字段 |
| `excludeFields` | `string[]` | ❌ | 排除指定字段 |
| `includeFields` | `string[]` | ❌ | 只包含指定字段 |
| `deep` | `boolean` | ❌ | 深度转换嵌套对象 |
| `transform` | `function` | ❌ | 自定义转换函数 |

## 🔑 用户信息装饰器

### @CurrentUser
| 参数 | 类型 | 说明 |
|------|------|------|
| `field` | `keyof User` | 可选，指定用户字段 |

### @UserId
无参数，直接返回用户ID。

### @Username
无参数，直接返回用户名。

### @OptionalCurrentUser
| 参数 | 类型 | 说明 |
|------|------|------|
| `field` | `keyof User` | 可选，指定用户字段 |

## 🛡️ 权限装饰器

### @RequirePermission
| 参数 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| `action` | `Action` | ✅ | 操作类型 | `Action.READ` |
| `subject` | `Subject` | ✅ | 资源类型 | `Subject.USER` |

**Action 枚举值**：
- `CREATE` - 创建操作
- `READ` - 读取操作
- `UPDATE` - 更新操作
- `DELETE` - 删除操作
- `MANAGE` - 管理操作（包含所有）

**Subject 枚举值**：
- `USER` - 用户管理
- `ROLE` - 角色管理
- `PERMISSION` - 权限管理
- `DOCUMENT` - 文档管理
- `KNOWLEDGE_BASE` - 知识库管理
- `SYSTEM` - 系统管理
- `ALL` - 所有资源

## 🔄 响应控制装饰器

### @SkipResponseTransform
无参数，跳过自动响应包装。

## 🔓 认证装饰器

### @Public
无参数，标记公开路由。

### @UseGuards
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `...guards` | `Guard[]` | ✅ | 守卫类列表 |
