# TypeScript与JavaScript集成

TypeScript作为JavaScript的超集，提供了与现有JavaScript代码无缝集成的能力。本文将深入探讨如何在项目中逐步引入TypeScript，以及如何与各种JavaScript库和框架集成。

## 渐进式类型化

渐进式类型化是指在不重写整个代码库的情况下，逐步将TypeScript引入到现有JavaScript项目中的过程。

### JavaScript迁移策略

将JavaScript项目迁移到TypeScript通常遵循以下策略：

1. **配置项目**：首先设置TypeScript编译器和构建工具
2. **并行迁移**：允许JavaScript和TypeScript文件共存
3. **增量转换**：逐个文件从.js转换为.ts
4. **逐步添加类型**：先使用`any`类型，然后逐步添加更精确的类型

```typescript
// tsconfig.json配置示例
{
  "compilerOptions": {
    "target": "es2020",
    "module": "esnext",
    "moduleResolution": "node",
    "allowJs": true,          // 允许编译JavaScript文件
    "checkJs": true,          // 对JavaScript文件进行类型检查
    "noEmit": false,          // 生成输出文件
    "strict": false,          // 初期可以关闭严格模式
    "noImplicitAny": false,   // 初期允许隐式any类型
    "strictNullChecks": false // 初期不启用严格空值检查
  },
  "include": ["src/**/*.ts", "src/**/*.js"],
  "exclude": ["node_modules"]
}
```

### JSDoc注释与类型

在不转换文件扩展名的情况下，可以使用JSDoc注释为JavaScript文件添加TypeScript类型信息：

```javascript
// 使用JSDoc为JavaScript添加类型
/**
 * 计算两个数的和
 * @param {number} a 第一个数
 * @param {number} b 第二个数
 * @returns {number} 两数之和
 */
function add(a, b) {
  return a + b;
}

/**
 * 用户信息
 * @typedef {Object} User
 * @property {string} id - 用户ID
 * @property {string} name - 用户名
 * @property {number} [age] - 用户年龄（可选）
 */

/**
 * 获取用户信息
 * @param {string} userId - 用户ID
 * @returns {Promise<User>} 用户信息
 */
async function getUser(userId) {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
}

/**
 * @template T
 * @param {T[]} array - 输入数组
 * @param {function(T): boolean} predicate - 过滤函数
 * @returns {T[]} 过滤后的数组
 */
function filter(array, predicate) {
  return array.filter(predicate);
}

// 类的JSDoc类型
/**
 * 表示一个点
 */
class Point {
  /**
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  constructor(x, y) {
    /** @type {number} */
    this.x = x;
    /** @type {number} */
    this.y = y;
  }

  /**
   * 计算到另一个点的距离
   * @param {Point} other - 另一个点
   * @returns {number} 距离
   */
  distanceTo(other) {
    return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
  }
}
```

### allowJs与checkJs

TypeScript编译器提供了两个重要选项来支持JavaScript文件：

- `allowJs`: 允许编译器处理JavaScript文件
- `checkJs`: 对JavaScript文件进行类型检查

这些选项可以在tsconfig.json中配置，也可以在文件级别使用指令：

```javascript
// @ts-check - 启用该文件的类型检查
// @ts-nocheck - 禁用该文件的类型检查
// @ts-ignore - 忽略下一行的类型错误

// 使用@ts-check启用类型检查
// @ts-check
const name = "John";
name = "Jane"; // 错误：无法分配到"name"，因为它是常量

// 使用@ts-ignore忽略特定错误
function legacy() {
  // @ts-ignore: 遗留代码，暂时忽略类型错误
  return window.oldAPI.doSomething();
}
```

### 声明文件生成

TypeScript可以自动为JavaScript库生成声明文件（.d.ts）：

```bash
# 使用tsc生成声明文件
tsc --declaration --emitDeclarationOnly --allowJs file.js
```

也可以使用工具如`dts-gen`为第三方库生成声明文件：

```bash
# 安装dts-gen
npm install -g dts-gen

# 为库生成声明文件
dts-gen -m lodash
```

### 类型检查级别

TypeScript提供了多种类型检查级别，可以根据项目需求逐步提高严格程度：

```json
// tsconfig.json中的严格级别设置
{
  "compilerOptions": {
    // 基本严格设置
    "strict": true,  // 启用所有严格类型检查选项
    
    // 或单独配置各个严格检查选项
    "noImplicitAny": true,           // 禁止隐式any类型
    "strictNullChecks": true,        // 启用严格空值检查
    "strictFunctionTypes": true,     // 启用严格函数类型检查
    "strictBindCallApply": true,     // 检查bind、call和apply方法的参数
    "strictPropertyInitialization": true, // 检查类属性初始化
    "noImplicitThis": true,          // 禁止隐式this类型
    "alwaysStrict": true,            // 以严格模式解析并为每个源文件添加"use strict"
    
    // 额外检查
    "noUnusedLocals": true,          // 报告未使用的局部变量
    "noUnusedParameters": true,      // 报告未使用的参数
    "noImplicitReturns": true,       // 检查函数是否有返回值
    "noFallthroughCasesInSwitch": true // 检查switch语句的fallthrough
  }
}
```

## 库与框架集成

### React与TSX

TypeScript与React的集成通过`.tsx`文件扩展名实现，提供了对JSX语法的支持以及组件props和state的类型检查。

```tsx
// 基本React组件
import React, { useState, useEffect } from 'react';

// Props类型定义
interface UserProfileProps {
  userId: string;
  showDetails?: boolean;
}

// 使用React.FC类型（函数组件）
const UserProfile: React.FC<UserProfileProps> = ({ userId, showDetails = false }) => {
  // 状态类型
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 用户类型
  interface User {
    id: string;
    name: string;
    email: string;
    age?: number;
  }

  // 副作用
  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const userData: User = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }
    
    fetchUser();
  }, [userId]);

  // 事件处理器类型
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Button clicked', event.currentTarget);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      {showDetails && user.age && <p>Age: {user.age}</p>}
      <button onClick={handleClick}>More Details</button>
    </div>
  );
};

export default UserProfile;
```

**使用类组件**：

```tsx
import React, { Component } from 'react';

// Props和State接口
interface CounterProps {
  initialCount: number;
  step?: number;
}

interface CounterState {
  count: number;
}

// 类组件
class Counter extends Component<CounterProps, CounterState> {
  // 默认props
  static defaultProps = {
    step: 1
  };

  constructor(props: CounterProps) {
    super(props);
    this.state = {
      count: props.initialCount
    };
  }

  // 类方法
  increment = (): void => {
    this.setState(prevState => ({
      count: prevState.count + this.props.step!
    }));
  };

  decrement = (): void => {
    this.setState(prevState => ({
      count: prevState.count - this.props.step!
    }));
  };

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.increment}>+</button>
        <button onClick={this.decrement}>-</button>
      </div>
    );
  }
}

export default Counter;
```

### Vue与TypeScript

Vue 3提供了出色的TypeScript支持，特别是通过Composition API：

```typescript
// Vue 3 + TypeScript
<script lang="ts">
import { defineComponent, ref, computed, PropType } from 'vue';

// 用户类型
interface User {
  id: string;
  name: string;
  email: string;
}

export default defineComponent({
  name: 'UserProfile',
  
  props: {
    userId: {
      type: String as PropType<string>,
      required: true
    },
    showEmail: {
      type: Boolean,
      default: true
    }
  },
  
  setup(props, { emit }) {
    // 响应式状态
    const user = ref<User | null>(null);
    const loading = ref(true);
    const error = ref<Error | null>(null);
    
    // 计算属性
    const displayName = computed(() => {
      return user.value ? `${user.value.name} (${user.value.id})` : 'Unknown User';
    });
    
    // 方法
    const fetchUser = async () => {
      try {
        loading.value = true;
        const response = await fetch(`/api/users/${props.userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        user.value = await response.json();
      } catch (err) {
        error.value = err instanceof Error ? err : new Error('Unknown error');
      } finally {
        loading.value = false;
      }
    };
    
    // 生命周期钩子
    onMounted(() => {
      fetchUser();
    });
    
    // 事件处理
    const handleClick = () => {
      emit('user-selected', user.value?.id);
    };
    
    return {
      user,
      loading,
      error,
      displayName,
      handleClick
    };
  }
});
</script>

<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else-if="user">
      <h1>{{ displayName }}</h1>
      <p v-if="showEmail">Email: {{ user.email }}</p>
      <button @click="handleClick">Select User</button>
    </div>
    <div v-else>No user found</div>
  </div>
</template>
```

**使用Vue Class Component**：

```typescript
// Vue 2 + TypeScript + vue-class-component
import { Vue, Component, Prop } from 'vue-property-decorator';

interface User {
  id: string;
  name: string;
  email: string;
}

@Component
export default class UserProfile extends Vue {
  @Prop({ required: true }) readonly userId!: string;
  @Prop({ default: true }) readonly showEmail!: boolean;
  
  user: User | null = null;
  loading = true;
  error: Error | null = null;
  
  get displayName(): string {
    return this.user ? `${this.user.name} (${this.user.id})` : 'Unknown User';
  }
  
  async created() {
    await this.fetchUser();
  }
  
  async fetchUser() {
    try {
      this.loading = true;
      const response = await fetch(`/api/users/${this.userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      this.user = await response.json();
    } catch (err) {
      this.error = err instanceof Error ? err : new Error('Unknown error');
    } finally {
      this.loading = false;
    }
  }
  
  handleClick() {
    this.$emit('user-selected', this.user?.id);
  }
}
```

### Express/Nest.js类型

**Express与TypeScript**：

```typescript
import express, { Request, Response, NextFunction } from 'express';

// 扩展Request类型
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// 创建Express应用
const app = express();

// 中间件类型
const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    // 假设这里验证token
    req.user = { id: '123', role: 'admin' };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// 路由处理器
app.get('/api/profile', authMiddleware, (req: AuthRequest, res: Response) => {
  // 由于使用了AuthRequest，TypeScript知道req.user存在
  res.json({ user: req.user });
});

// 错误处理中间件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 启动服务器
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

**Nest.js与TypeScript**：

```typescript
// Nest.js天生就支持TypeScript
import { Controller, Get, Post, Body, Param, UseGuards, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// DTO类
export class CreateUserDto {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

// 实体类
export class User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// 服务
@Injectable()
export class UsersService {
  private users: User[] = [];

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async findOne(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = {
      id: Date.now().toString(),
      ...createUserDto,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }
}

// 控制器
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }
}
```

### 第三方库类型定义

使用TypeScript时，我们通常需要为第三方库提供类型定义：

1. **内置类型定义**：许多现代库直接提供TypeScript类型定义
2. **DefinitelyTyped**：社区维护的类型定义仓库
3. **自定义声明文件**：为没有类型定义的库创建声明文件

```typescript
// 安装类型定义
// npm install --save-dev @types/lodash

// 使用带有类型的库
import _ from 'lodash';

const result = _.chunk([1, 2, 3, 4, 5], 2);
// TypeScript知道result的类型是number[][]

// 为没有类型的库创建声明文件
// legacy-library.d.ts
declare module 'legacy-library' {
  export function doSomething(value: string): number;
  
  export interface Options {
    timeout?: number;
    cache?: boolean;
  }
  
  export class Helper {
    constructor(options?: Options);
    process(data: any): any;
  }
  
  const defaultExport: Helper;
  export default defaultExport;
}

// 然后在代码中使用
import LegacyLib from 'legacy-library';
const helper = new LegacyLib({ timeout: 1000 });
```

### 框架特定类型工具

各种框架通常提供特定的类型工具来增强TypeScript集成：

**React类型工具**：

```typescript
// 从React类型中提取Props类型
import { ComponentProps, ComponentType } from 'react';

// 获取组件的Props类型
function Button(props: { label: string; onClick: () => void }) {
  return <button onClick={props.onClick}>{props.label}</button>;
}

// 提取Button组件的Props类型
type ButtonProps = ComponentProps<typeof Button>;

// 高阶组件类型
function withLogging<T extends ComponentType<any>>(Component: T) {
  return function LoggingComponent(props: ComponentProps<T>) {
    console.log('Rendering component with props:', props);
    return <Component {...props} />;
  };
}

const LoggedButton = withLogging(Button);
```

**Vue类型工具**：

```typescript
// Vue 3类型工具
import { PropType, ExtractPropTypes } from 'vue';

const props = {
  message: String as PropType<string>,
  count: {
    type: Number as PropType<number>,
    required: true
  },
  callback: Function as PropType<() => void>
};

// 提取props类型
type Props = ExtractPropTypes<typeof props>;

// 组件实例类型
import { ComponentPublicInstance } from 'vue';
type ButtonInstance = ComponentPublicInstance<Props>;
```

## 构建与工具

### TSConfig配置

TypeScript项目的核心是`tsconfig.json`配置文件，它控制编译器行为和类型检查选项：

```json
{
  "compilerOptions": {
    // 目标ECMAScript版本
    "target": "es2020",
    
    // 模块系统
    "module": "esnext",
    "moduleResolution": "node",
    
    // 输出设置
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    
    // 类型检查
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    
    // JavaScript支持
    "allowJs": true,
    "checkJs": true,
    
    // 路径映射
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    
    // 库支持
    "lib": ["dom", "dom.iterable", "esnext"],
    
    // JSX支持
    "jsx": "react-jsx",
    
    // 装饰器支持
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    
    // 源码映射
    "sourceMap": true,
    
    // 导入支持
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    
    // 高级检查
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### TypeScript编译器API

TypeScript编译器API允许以编程方式使用TypeScript：

```typescript
// 使用TypeScript编译器API
import * as ts from 'typescript';

// 创建一个简单的程序
function compile(fileNames: string[], options: ts.CompilerOptions): void {
  // 创建程序
  const program = ts.createProgram(fileNames, options);
  
  // 获取诊断信息
  const diagnostics = ts.getPreEmitDiagnostics(program);
  
  // 报告错误
  diagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
  });
  
  // 发射输出
  const emitResult = program.emit();
  
  // 报告结果
  const exitCode = emitResult.emitSkipped ? 1 : 0;
  console.log(`Process exiting with code '${exitCode}'.`);
  process.exit(exitCode);
}

// 调用编译函数
compile(['file.ts'], {
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.ESNext,
  strict: true
});
```

### Webpack与TS-loader

使用Webpack和ts-loader构建TypeScript项目：

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  // 开发服务器配置
  devServer: {
    static: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
  },
};
```

### ESLint与TypeScript

使用ESLint和TypeScript插件进行代码质量检查：

```javascript
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
    // 自定义规则
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
```

### TSDoc文档生成

使用TSDoc注释和工具如TypeDoc生成API文档：

```typescript
/**
 * 表示用户实体
 * @example
 * ```typescript
 * const user = new User({
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * });
 * ```
 */
export class User {
  /**
   * 用户ID
   * @readonly
   */
  readonly id: string;
  
  /**
   * 用户名
   */
  name: string;
  
  /**
   * 电子邮件
   */
  email: string;
  
  /**
   * 创建用户实例
   * @param data - 用户数据
   */
  constructor(data: { name: string; email: string }) {
    this.id = generateId();
    this.name = data.name;
    this.email = data.email;
  }
  
  /**
   * 更新用户信息
   * @param data - 要更新的数据
   * @returns 更新后的用户实例
   * @throws 如果电子邮件格式无效
   */
  update(data: Partial<Pick<User, 'name' | 'email'>>): this {
    if (data.name) this.name = data.name;
    if (data.email) {
      if (!isValidEmail(data.email)) {
        throw new Error('Invalid email format');
      }
      this.email = data.email;
    }
    return this;
  }
}

/**
 * 检查电子邮件格式是否有效
 * @param email - 要检查的电子邮件
 * @returns 如果格式有效则为true，否则为false
 * @internal 这是一个内部函数，不应在库外部使用
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * 生成唯一ID
 * @returns 生成的ID
 * @internal
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
```

## 总结

TypeScript与JavaScript的集成提供了一条平滑的迁移路径，允许开发者逐步采用类型系统而不必重写整个代码库。通过渐进式类型化、JSDoc注释和灵活的配置选项，TypeScript可以适应各种项目需求和开发风格。

与流行框架如React、Vue和Express的集成使TypeScript成为全栈开发的理想选择，提供端到端的类型安全。丰富的工具生态系统进一步增强了开发体验，使代码更可靠、更易于维护。 