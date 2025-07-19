# RBAC2 权限使用指南

## 🚀 快速开始

### 控制器权限控制
```typescript
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RbacPermissionsGuard)
export class UserAdminController {
  
  // 查看用户权限
  @Get()
  @RequirePermission('system.user.view')
  async findAll() {
    return this.userService.findAll();
  }
  
  // 添加用户权限
  @Post()
  @RequirePermission('system.user.add')
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }
  
  // 编辑用户权限
  @Patch(':id')
  @RequirePermission('system.user.edit')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }
  
  // 删除用户权限
  @Delete(':id')
  @RequirePermission('system.user.delete')
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
```

## 📋 权限编码规范

### 命名格式
```
模块.功能.操作
```

### 示例权限编码
```typescript
// 模块权限
'dashboard'          // 仪表盘模块
'system'            // 系统管理模块
'content'           // 内容管理模块

// 菜单权限
'system.user'       // 用户管理菜单
'system.role'       // 角色管理菜单
'content.document'  // 文档管理菜单

// 按钮权限
'system.user.view'    // 查看用户
'system.user.add'     // 添加用户
'system.user.edit'    // 编辑用户
'system.user.delete'  // 删除用户
```

## 🎯 角色权限对照

### 访客 (visitor)
```typescript
权限列表：
- dashboard              // 仪表盘
- content               // 内容管理模块
- content.document      // 文档管理菜单
- content.document.view // 查看文档
- content.knowledge     // 知识库管理菜单
- content.knowledge.view // 查看知识库
```

### 团队开发者 (team_developer)
```typescript
继承访客权限，额外拥有：
- content.document.add    // 添加文档
- content.document.edit   // 编辑文档
- content.knowledge.add   // 添加知识库
- content.knowledge.edit  // 编辑知识库
```

### 团队领导 (team_leader)
```typescript
继承开发者权限，额外拥有：
- content.document.delete   // 删除文档
- content.knowledge.delete  // 删除知识库
- system                   // 系统管理模块
- system.user             // 用户管理菜单
- system.user.view        // 查看用户
```

### 管理员 (admin)
```typescript
继承领导权限，额外拥有：
- system.user.add      // 添加用户
- system.user.edit     // 编辑用户
- system.user.delete   // 删除用户
- system.role         // 角色管理菜单
- system.role.view    // 查看角色
- system.role.add     // 添加角色
- system.role.edit    // 编辑角色
- system.role.delete  // 删除角色
```

### 超级管理员 (super_admin)
```typescript
继承管理员权限，额外拥有：
- system.permission      // 权限管理菜单
- system.permission.view // 查看权限
- system.permission.edit // 编辑权限
```

## 🔧 前端权限使用

### 基础权限检查
```typescript
// 获取用户权限
const { ability } = useAuth();

// 检查单个权限
if (ability.can('system.user.add')) {
  // 显示添加用户按钮
}

// 检查多个权限
const canManageUser = ability.can('system.user.edit') || ability.can('system.user.delete');
```

### 组件权限控制
```typescript
// 权限包装组件
<PermissionWrapper permission="system.user.add">
  <Button>添加用户</Button>
</PermissionWrapper>

// 条件渲染
{ability.can('system.user.view') && (
  <UserList />
)}
```

### 菜单权限控制
```typescript
// 获取用户菜单权限
const menuPermissions = ability.getMenuPermissions();

// 构建菜单树
const menuTree = ability.buildPermissionTree();

// 示例菜单数据结构
const menus = [
  {
    code: 'dashboard',
    name: '仪表盘',
    path: '/dashboard',
    icon: 'dashboard'
  },
  {
    code: 'system',
    name: '系统管理',
    path: '/system',
    icon: 'system',
    children: [
      {
        code: 'system.user',
        name: '用户管理',
        path: '/system/user',
        icon: 'user'
      }
    ]
  }
];
```

### 按钮权限控制
```typescript
// 获取用户按钮权限
const buttonPermissions = ability.getButtonPermissions();

// 页面按钮权限检查
const UserManagement = () => {
  const { ability } = useAuth();
  
  return (
    <div>
      <Table dataSource={users}>
        <Column 
          title="操作"
          render={(record) => (
            <Space>
              {ability.can('system.user.edit') && (
                <Button onClick={() => edit(record)}>编辑</Button>
              )}
              {ability.can('system.user.delete') && (
                <Button danger onClick={() => remove(record)}>删除</Button>
              )}
            </Space>
          )}
        />
      </Table>
      
      {ability.can('system.user.add') && (
        <Button type="primary" onClick={() => showAddModal()}>
          添加用户
        </Button>
      )}
    </div>
  );
};
```

## 🛡️ 权限检查

### 守卫组合使用
```typescript
// 标准权限检查
@UseGuards(JwtAuthGuard, RbacPermissionsGuard)
@RequirePermission('system.user.view')

// 公开接口（跳过权限检查）
@Public()
@Get('public-info')
```

### 获取当前用户
```typescript
@Get('profile')
@UseGuards(JwtAuthGuard, RbacPermissionsGuard)
@RequirePermission('system.user.view')
async getProfile(@CurrentUser() user: User) {
  return user;
}
```

## 🔄 权限管理API

### 获取权限树
```bash
GET /admin/permissions/tree
```

### 角色权限分配
```bash
# 获取角色详情（包含权限）
GET /admin/roles/:id

# 更新角色权限
PATCH /admin/roles/:id
{
  "permissionIds": ["permission-1", "permission-2"]
}
```

### 初始化系统
```bash
# 初始化RBAC2系统
POST /admin/role-init/initialize

# 获取角色权限概览
GET /admin/role-init/overview
```

## ⚠️ 注意事项

### 权限设计原则
1. **层次清晰** - 模块 → 菜单 → 按钮的三层结构
2. **命名规范** - 使用点号分隔的权限编码
3. **继承机制** - 高级角色自动继承低级角色权限
4. **最小权限** - 只分配必要的权限

### 常见错误
```typescript
// ❌ 错误：忘记添加守卫
@Get('sensitive-data')
@RequirePermission('system.user.view')
async getSensitiveData() { ... }

// ✅ 正确：添加完整的守卫
@Get('sensitive-data')
@UseGuards(JwtAuthGuard, RbacPermissionsGuard)
@RequirePermission('system.user.view')
async getSensitiveData() { ... }
```

### 调试技巧
```typescript
// 检查用户权限
const userPermissions = ability.getPermissionCodes();
console.log('用户权限:', userPermissions);

// 检查特定权限
console.log('是否有用户管理权限:', ability.can('system.user.view'));

// 获取权限树
const permissionTree = ability.buildPermissionTree();
console.log('权限树:', permissionTree);
```

## 📊 权限数据结构

### 权限实体
```typescript
interface Permission {
  id: string;
  code: string;        // 权限编码
  name: string;        // 权限名称
  type: PermissionType; // 权限类型
  path?: string;       // 前端路由
  icon?: string;       // 图标
  sort: number;        // 排序
  parent?: Permission; // 父权限
  children: Permission[]; // 子权限
}
```

### 角色实体
```typescript
interface Role {
  id: string;
  name: string;           // 角色名称
  level: number;          // 角色层级
  parent?: Role;          // 父角色
  children: Role[];       // 子角色
  permissions: Permission[]; // 角色权限
}
```

### 用户实体
```typescript
interface User {
  id: string;
  username: string;
  roles: Role[];         // 用户角色
}
```

## 🎉 最佳实践

### 权限分配建议
1. **按职责分配** - 根据用户实际工作职责分配角色
2. **定期审查** - 定期检查用户权限是否合理
3. **权限最小化** - 遵循最小权限原则
4. **层次管理** - 利用角色继承简化权限管理

### 开发建议
1. **统一命名** - 使用一致的权限编码命名规范
2. **文档维护** - 及时更新权限说明文档
3. **测试覆盖** - 确保权限控制的测试覆盖率
4. **日志记录** - 记录重要的权限操作日志 