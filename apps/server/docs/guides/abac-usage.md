# ABAC 权限使用指南

## 🚀 快速开始

### 基础权限检查
```typescript
@Get('users')
@RequirePermission(Action.READ, Subject.USER)
async getUsers() {
  return this.userService.findAll();
}
```

## 📋 权限装饰器

### @RequirePermission
| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `action` | `Action` | 操作类型 | `Action.READ` |
| `subject` | `Subject` | 资源类型 | `Subject.USER` |

### 常用权限组合
```typescript
// 用户管理
@RequirePermission(Action.READ, Subject.USER)     // 查看用户
@RequirePermission(Action.MANAGE, Subject.USER)   // 管理用户

// 文档管理  
@RequirePermission(Action.READ, Subject.DOCUMENT)   // 查看文档
@RequirePermission(Action.CREATE, Subject.DOCUMENT) // 创建文档
@RequirePermission(Action.MANAGE, Subject.DOCUMENT) // 管理文档

// 系统管理
@RequirePermission(Action.READ, Subject.SYSTEM)   // 查看系统信息
@RequirePermission(Action.MANAGE, Subject.ALL)    // 超级管理员权限
```

## 🎯 角色权限对照

### 超级管理员权限
```typescript
// 可以访问所有接口
@RequirePermission(Action.MANAGE, Subject.ALL)
@RequirePermission(Action.MANAGE, Subject.SYSTEM)
@RequirePermission(Action.MANAGE, Subject.USER)
// ... 所有权限
```

### 管理员权限
```typescript
// 可以访问
@RequirePermission(Action.MANAGE, Subject.USER)
@RequirePermission(Action.MANAGE, Subject.ROLE)
@RequirePermission(Action.MANAGE, Subject.DOCUMENT)
@RequirePermission(Action.READ, Subject.SYSTEM)

// 不能访问
@RequirePermission(Action.MANAGE, Subject.ALL)     // ❌
@RequirePermission(Action.MANAGE, Subject.SYSTEM)  // ❌
```

### 团队开发者权限
```typescript
// 可以访问
@RequirePermission(Action.MANAGE, Subject.DOCUMENT)
@RequirePermission(Action.MANAGE, Subject.KNOWLEDGE_BASE)
@RequirePermission(Action.READ, Subject.USER)

// 不能访问
@RequirePermission(Action.MANAGE, Subject.USER)    // ❌
@RequirePermission(Action.MANAGE, Subject.ROLE)    // ❌
```

### 访客权限
```typescript
// 可以访问
@RequirePermission(Action.READ, Subject.DOCUMENT)
@RequirePermission(Action.READ, Subject.KNOWLEDGE_BASE)

// 不能访问
@RequirePermission(Action.CREATE, Subject.DOCUMENT) // ❌
@RequirePermission(Action.MANAGE, Subject.USER)     // ❌
```

## 🔧 控制器示例

### 用户管理控制器
```typescript
@Controller('admin/users')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class UserAdminController {
  
  // 管理员、超级管理员可访问
  @Get()
  @RequirePermission(Action.READ, Subject.USER)
  async findAll() { ... }
  
  // 管理员、超级管理员可访问
  @Post()
  @RequirePermission(Action.MANAGE, Subject.USER)
  async create() { ... }
  
  // 只有超级管理员可访问
  @Delete(':id')
  @RequirePermission(Action.MANAGE, Subject.USER)
  async remove(@Param('id') id: string) { ... }
}
```

### 文档管理控制器
```typescript
@Controller('admin/documents')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class DocumentAdminController {
  
  // 所有角色都可访问
  @Get()
  @RequirePermission(Action.READ, Subject.DOCUMENT)
  async findAll() { ... }
  
  // 团队开发者以上可访问
  @Post()
  @RequirePermission(Action.CREATE, Subject.DOCUMENT)
  async create() { ... }
  
  // 团队开发者以上可访问
  @Put(':id')
  @RequirePermission(Action.UPDATE, Subject.DOCUMENT)
  async update() { ... }
}
```

### 系统管理控制器
```typescript
@Controller('admin/system')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class SystemAdminController {
  
  // 管理员以上可访问
  @Get('info')
  @RequirePermission(Action.READ, Subject.SYSTEM)
  async getSystemInfo() { ... }
  
  // 只有超级管理员可访问
  @Post('settings')
  @RequirePermission(Action.MANAGE, Subject.SYSTEM)
  async updateSettings() { ... }
}
```

## 🔄 角色管理

### 初始化系统角色
```bash
# 初始化预设角色和权限
POST /admin/role-init/initialize

# 查看角色权限概览
GET /admin/role-init/overview
```

### 为用户分配角色
```typescript
// 创建用户时分配角色
const user = await this.userService.create({
  username: 'newuser',
  email: 'user@example.com',
  roles: ['team_developer']  // 分配团队开发者角色
});

// 更新用户角色
await this.userService.updateRoles(userId, ['admin']);
```

## 🛡️ 权限检查

### 守卫组合使用
```typescript
// 标准权限检查
@UseGuards(JwtAuthGuard, PoliciesGuard)
@RequirePermission(Action.READ, Subject.USER)

// 公开接口（跳过权限检查）
@Public()
@Get('public-info')
```

### 获取当前用户
```typescript
@Get('profile')
@UseGuards(JwtAuthGuard, PoliciesGuard)
@RequirePermission(Action.READ, Subject.USER)
async getProfile(@CurrentUser() user: User) {
  return user;
}
```

## ⚠️ 注意事项

### 权限设计原则
1. **最小权限** - 用户只获得必需的权限
2. **明确边界** - 不同角色权限边界清晰
3. **安全优先** - 默认拒绝，明确授权

### 常见错误
```typescript
// ❌ 错误：忘记添加守卫
@Get('sensitive-data')
@RequirePermission(Action.READ, Subject.USER)
async getSensitiveData() { ... }

// ✅ 正确：添加完整的守卫
@Get('sensitive-data')
@UseGuards(JwtAuthGuard, PoliciesGuard)
@RequirePermission(Action.READ, Subject.USER)
async getSensitiveData() { ... }
```

### 调试技巧
```typescript
// 检查用户权限
const ability = this.caslAbilityFactory.createForUser(user);
console.log('Can read user:', ability.can('read', 'user'));
console.log('Can manage all:', ability.can('manage', 'all'));
```

## 📚 相关文档

- [ABAC 系统架构](../architecture/abac-system.md)
- [装饰器参考](../reference/decorators.md)
- [JWT 认证系统](../architecture/jwt-auth-system.md)
