# ABAC 权限控制系统

## 🎯 系统概述

基于 CASL 库实现的 ABAC (Attribute-Based Access Control) 权限控制系统，支持细粒度的权限管理。

## 👥 用户角色体系

### 4种用户角色

| 角色 | 英文名 | 权限范围 | 使用场景 |
|------|--------|----------|----------|
| **超级管理员** | `super_admin` | 系统所有权限 | 系统维护、最高权限 |
| **管理员** | `admin` | 用户、角色、内容管理 | 平台日常管理 |
| **团队开发者** | `team_developer` | 文档、知识库管理 | 内容创建和维护 |
| **访客** | `visitor` | 只读权限 | 内容查看 |

## 📋 权限矩阵

### 操作类型 (Action)
```typescript
CREATE  // 创建
READ    // 读取
UPDATE  // 更新  
DELETE  // 删除
MANAGE  // 管理（包含所有操作）
```

### 资源类型 (Subject)
```typescript
USER           // 用户管理
ROLE           // 角色管理
PERMISSION     // 权限管理
DOCUMENT       // 文档管理
KNOWLEDGE_BASE // 知识库管理
SYSTEM         // 系统管理
ALL            // 所有资源
```

### 详细权限分配

#### 超级管理员 (super_admin)
- ✅ `manage:all` - 拥有系统所有权限

#### 管理员 (admin)
- ✅ `manage:user` - 管理用户
- ✅ `manage:role` - 管理角色
- ✅ `manage:knowledge_base` - 管理知识库
- ✅ `manage:document` - 管理文档
- ✅ `read:system` - 查看系统信息

#### 团队开发者 (team_developer)
- ✅ `manage:document` - 管理文档
- ✅ `manage:knowledge_base` - 管理知识库
- ✅ `read:user` - 查看用户信息

#### 访客 (visitor)
- ✅ `read:document` - 查看文档
- ✅ `read:knowledge_base` - 查看知识库

## 🔧 技术实现

### 核心组件
- **CASL AbilityFactory** - 权限能力工厂
- **PoliciesGuard** - 权限守卫
- **@RequirePermission** - 权限装饰器
- **Permission Entity** - 权限实体

### 权限检查流程
1. 请求到达控制器
2. `PoliciesGuard` 拦截请求
3. 读取 `@RequirePermission` 装饰器配置
4. 通过 `CaslAbilityFactory` 检查用户权限
5. 允许或拒绝访问

## 🚀 使用方式

### 控制器权限控制
```typescript
@Controller('admin/users')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class UserAdminController {
  
  // 管理员以上可访问
  @Get()
  @RequirePermission(Action.READ, Subject.USER)
  async findAll() { ... }
  
  // 只有管理员和超级管理员可访问
  @Post()
  @RequirePermission(Action.MANAGE, Subject.USER)
  async create() { ... }
}
```

### 前端权限检查
```typescript
// 检查是否有权限
const canManageUsers = usePermission('manage', 'user');

// 条件渲染
{canManageUsers && <UserManageButton />}
```

## 🔄 扩展性设计

### 当前阶段：简化权限
```typescript
// 权限实体中 conditions 字段保持为 undefined
{
  action: 'read',
  subject: 'document',
  conditions: undefined  // 预留扩展字段
}
```

### 未来扩展：条件权限
```typescript
// 可以扩展为复杂的条件权限
{
  action: 'read',
  subject: 'document',
  conditions: {
    authorId: 'currentUserId',     // 只能读取自己的文档
    department: 'currentUserDept', // 只能读取本部门文档
    status: 'published'            // 只能读取已发布文档
  }
}
```

## 📊 角色初始化

### 自动初始化
系统启动时自动创建预设角色和权限：

```typescript
// 调用初始化服务
await roleInitService.initializeRoles();
```

### 手动管理
通过管理接口进行角色管理：

```bash
# 初始化角色
POST /admin/role-init/initialize

# 查看角色概览  
GET /admin/role-init/overview

# 重置角色（危险操作）
POST /admin/role-init/reset
```

## 🛡️ 安全特性

### 权限隔离
- 不同角色只能访问授权的资源
- 权限检查在每个请求中进行
- 支持细粒度的操作控制

### 扩展安全
- 预留 `conditions` 字段支持复杂权限
- 支持字段级权限控制
- 支持拒绝权限（inverted）

## 📈 最佳实践

### 权限设计原则
1. **最小权限原则** - 用户只获得必需的权限
2. **角色分离** - 不同角色职责明确
3. **权限继承** - 高级角色包含低级角色权限
4. **扩展预留** - 为未来复杂权限预留空间

### 使用建议
1. **优先使用预设角色** - 满足大部分场景需求
2. **谨慎使用复杂权限** - 避免过度设计
3. **定期权限审计** - 确保权限分配合理
4. **文档同步更新** - 权限变更及时更新文档
