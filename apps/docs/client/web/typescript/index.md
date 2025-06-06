# TypeScript类型编程

## 简介

TypeScript是JavaScript的超集，添加了静态类型系统和其他高级特性，由Microsoft开发和维护。它通过在开发阶段提供类型检查，提高了代码质量、可读性和可维护性，同时保持与JavaScript的完全兼容性。TypeScript代码最终会编译为标准JavaScript在各种环境中运行。

## 类型系统基础

### 基本类型
- 原始类型（string, number, boolean）
- 特殊类型（null, undefined, void, any, unknown, never）
- 字面量类型与联合类型
- 类型别名与类型断言
- 枚举类型

### 复合类型
- 数组与元组
- 对象类型
- 函数类型
- 联合类型（Union）与交叉类型（Intersection）
- 类型推断与类型兼容性

### 类型注解
- 变量类型注解
- 函数参数与返回值
- 对象属性类型
- 数组与泛型类型
- 可选与只读修饰符

## 接口与类型

### 接口定义
- 对象接口
- 函数接口
- 可索引类型
- 类实现接口
- 接口继承与组合

### 类型别名
- 类型别名与接口对比
- 联合类型与交叉类型
- 字面量类型与模板字面量
- 工具类型封装
- 条件类型表达

### 类型兼容性
- 结构化类型系统
- 子类型与赋值兼容性
- 函数参数双变性
- 泛型与类型兼容性
- 类型保护与类型收窄

## 高级类型特性

### 泛型编程
- 泛型函数与方法
- 泛型类与接口
- 泛型约束与默认值
- 泛型条件类型
- 泛型工具类型

### 类型操作
- 映射类型
- 条件类型
- 索引访问类型
- 类型推断infer
- 模板字面量类型

### 内置工具类型
- Partial<T>与Required<T>
- Readonly<T>与Pick<T, K>
- Omit<T, K>与Record<K, T>
- Exclude<T, U>与Extract<T, U>
- NonNullable<T>与ReturnType<F>

## 类与面向对象

### 类定义
- 构造函数与属性
- 访问修饰符（public, private, protected）
- 静态成员与实例成员
- 抽象类与方法
- 方法重载

### 类继承
- 继承机制与super关键字
- 方法重写与多态
- 接口实现与多接口
- 混入模式（Mixins）
- 装饰器模式

### 高级特性
- 只读属性与参数属性
- 访问器getter/setter
- 索引签名
- this类型与方法链
- 类型守卫与类型断言

## 模块与命名空间

### ES模块
- 导入与导出语法
- 默认导出与命名导出
- 类型导入与导出
- 动态导入
- 模块解析策略

### 命名空间
- 命名空间定义与嵌套
- 命名空间合并
- 命名空间导出
- 与模块的对比
- 三斜线指令

### 声明文件
- 全局声明与模块声明
- 命名空间声明
- 类型定义文件（.d.ts）
- 第三方库类型定义
- DefinitelyTyped与@types

## 高级类型模式

### 类型体操
- 递归类型定义
- 条件分配类型
- 类型推断与模式匹配
- 联合分布式条件类型
- 深度类型转换

### 实用类型模式
- 不可变数据结构
- 深度只读/部分类型
- 字符串模板操作
- 类型级数值计算
- 类型级状态机

### 类型安全
- 严格空值检查
- 严格函数检查
- 异常处理类型
- 类型守卫函数
- 可辨识联合类型

## 与JavaScript集成

### 渐进式类型化
- JavaScript迁移策略
- JSDoc注释与类型
- allowJs与checkJs
- 声明文件生成
- 类型检查级别

### 库与框架集成
- React与TSX
- Vue与TypeScript
- Express/Nest.js类型
- 第三方库类型定义
- 框架特定类型工具

### 构建与工具
- TSConfig配置
- TypeScript编译器API
- Webpack与TS-loader
- ESLint与TypeScript
- TSDoc文档生成

## 实践与优化

### 性能优化
- 类型检查性能
- 编译速度优化
- 类型推断限制
- 增量编译
- 项目参考

### 最佳实践
- 类型设计原则
- 错误处理模式
- 状态管理类型
- API接口类型
- 类型测试

## 代码示例

```typescript
// 高级TypeScript类型示例

// 通用响应类型
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: Date;
}

// 用户相关类型
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profile?: UserProfile;
  createdAt: Date;
}

// 枚举类型
enum UserRole {
  Admin = 'ADMIN',
  Editor = 'EDITOR',
  Viewer = 'VIEWER',
}

interface UserProfile {
  avatar: string;
  bio: string;
  socialLinks: Record<SocialPlatform, string>;
}

// 字符串字面量联合类型
type SocialPlatform = 'twitter' | 'facebook' | 'linkedin' | 'github';

// 泛型工具类型
type Nullable<T> = T | null;
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 条件类型
type ArrayElement<T> = T extends Array<infer U> ? U : never;
type FunctionReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// 映射类型
type OptionalProps<T> = {
  [K in keyof T]?: T[K];
};

// 实用的服务类型
interface UserService {
  getUser(id: string): Promise<ApiResponse<User>>;
  getUsers(params: UserQueryParams): Promise<ApiResponse<User[]>>;
  createUser(data: CreateUserDto): Promise<ApiResponse<User>>;
  updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>>;
  deleteUser(id: string): Promise<ApiResponse<void>>;
}

// 请求参数类型
interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
  sortBy?: keyof User;
  sortOrder?: 'asc' | 'desc';
}

// DTO类型，使用Omit和Pick
type CreateUserDto = Omit<User, 'id' | 'createdAt'>;
type UserSummary = Pick<User, 'id' | 'name' | 'role'>;

// 类实现
class UserServiceImpl implements UserService {
  constructor(private apiClient: ApiClient) {}

  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.apiClient.get<User>(`/users/${id}`);
  }

  async getUsers(params: UserQueryParams): Promise<ApiResponse<User[]>> {
    return this.apiClient.get<User[]>('/users', { params });
  }

  async createUser(data: CreateUserDto): Promise<ApiResponse<User>> {
    return this.apiClient.post<User>('/users', data);
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return this.apiClient.patch<User>(`/users/${id}`, data);
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(`/users/${id}`);
  }
}

// 泛型工厂函数
function createState<T>(initialState: T) {
  let state: T = initialState;
  
  function getState(): DeepReadonly<T> {
    return state as DeepReadonly<T>;
  }
  
  function setState<K extends keyof T>(key: K, value: T[K]): void;
  function setState(newState: Partial<T>): void;
  function setState(keyOrState: keyof T | Partial<T>, value?: any): void {
    if (typeof keyOrState === 'object') {
      state = { ...state, ...keyOrState };
    } else {
      state = { ...state, [keyOrState]: value };
    }
  }
  
  return {
    getState,
    setState,
  };
}

// 使用示例
const userState = createState<User>({
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: UserRole.Editor,
  createdAt: new Date(),
});

const user = userState.getState();
// Error: Cannot assign to 'name' because it is a read-only property.
// user.name = 'Jane Doe'; 

userState.setState('name', 'Jane Doe');
// 或者更新多个属性
userState.setState({
  name: 'Jane Doe',
  role: UserRole.Admin,
});
