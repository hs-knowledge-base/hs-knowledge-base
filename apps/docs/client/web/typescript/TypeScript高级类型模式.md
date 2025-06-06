# TypeScript高级类型模式

TypeScript的类型系统非常强大，允许开发者创建复杂而精确的类型定义。本文将深入探讨TypeScript中的高级类型模式，包括类型体操、实用类型模式和类型安全实践。

## 类型体操

"类型体操"是指利用TypeScript类型系统进行复杂类型计算和转换的技术。这些技术虽然有时看起来晦涩，但在构建类型安全的复杂系统时非常有价值。

### 递归类型定义

递归类型是指在自身定义中引用自身的类型。这对于表示树形结构、嵌套数据等非常有用。

```typescript
// 递归类型：JSON值
type JSONValue = 
  | string 
  | number 
  | boolean 
  | null 
  | JSONValue[] 
  | { [key: string]: JSONValue };

// 递归类型：嵌套对象
type NestedObject<T> = {
  value: T;
  children?: NestedObject<T>[];
};

// 文件系统示例
interface FileSystemNode {
  name: string;
  path: string;
}

interface File extends FileSystemNode {
  type: 'file';
  content: string;
}

interface Directory extends FileSystemNode {
  type: 'directory';
  children: FileSystemItem[];
}

type FileSystemItem = File | Directory;

// 使用示例
const fileSystem: FileSystemItem = {
  name: 'root',
  path: '/',
  type: 'directory',
  children: [
    {
      name: 'documents',
      path: '/documents',
      type: 'directory',
      children: [
        {
          name: 'resume.txt',
          path: '/documents/resume.txt',
          type: 'file',
          content: 'My professional resume'
        }
      ]
    }
  ]
};
```

### 条件分配类型

条件分配类型结合了条件类型和分配特性，允许我们基于输入类型创建复杂的转换。

```typescript
// 基本条件类型
type IsString<T> = T extends string ? true : false;

// 分配条件类型
type ToArray<T> = T extends any ? T[] : never;
type StrOrNumArr = ToArray<string | number>; // string[] | number[]

// 条件类型中的推断
type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;
type Func = (x: number) => string;
type Result = ReturnTypeOf<Func>; // string

// 提取Promise值类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type ResolvedType = UnwrapPromise<Promise<string>>; // string

// 复杂条件类型：提取函数参数
type Parameters<T> = T extends (...args: infer P) => any ? P : never;
type FuncParams = Parameters<(a: number, b: string) => void>; // [number, string]
```

### 类型推断与模式匹配

使用`infer`关键字进行类型推断和模式匹配是TypeScript高级类型编程的核心技术。

```typescript
// 提取数组元素类型
type ElementOf<T> = T extends Array<infer E> ? E : never;
type NumberArray = number[];
type Element = ElementOf<NumberArray>; // number

// 提取Promise值类型
type PromiseValue<T> = T extends Promise<infer V> ? V : never;
type Value = PromiseValue<Promise<string>>; // string

// 提取函数第一个参数
type FirstParameter<T> = T extends (first: infer F, ...args: any[]) => any ? F : never;
type First = FirstParameter<(x: number, y: string) => void>; // number

// 提取构造函数实例类型
type InstanceType<T> = T extends new (...args: any[]) => infer R ? R : any;
class Person { name: string = ""; }
type PersonType = InstanceType<typeof Person>; // Person

// 提取对象属性类型
type PropType<T, K extends keyof T> = T extends { [P in K]: infer V } ? V : never;
interface User { id: number; name: string; }
type NameType = PropType<User, 'name'>; // string
```

### 联合分布式条件类型

当条件类型作用于泛型类型时，如果泛型参数是联合类型，条件类型会分配到联合的每个成员。

```typescript
// 基本分配
type ToArray<T> = T extends any ? T[] : never;
type Result = ToArray<string | number>; // string[] | number[]

// 过滤联合类型
type Filter<T, U> = T extends U ? T : never;
type FilteredUnion = Filter<string | number | boolean, string | number>; // string | number

// 排除联合类型成员
type Exclude<T, U> = T extends U ? never : T;
type Remaining = Exclude<string | number | boolean, string>; // number | boolean

// 提取联合类型成员
type Extract<T, U> = T extends U ? T : never;
type Extracted = Extract<string | number | boolean, string | boolean>; // string | boolean

// 联合类型转交叉类型
type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
type Intersection = UnionToIntersection<{ a: string } | { b: number }>; // { a: string } & { b: number }
```

### 深度类型转换

深度类型转换允许我们递归地转换嵌套数据结构中的类型。

```typescript
// 深度只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 深度可选
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 深度必填
type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// 深度不可变
type DeepImmutable<T> = T extends Function | primitive
  ? T
  : T extends Array<infer U>
  ? ReadonlyArray<DeepImmutable<U>>
  : { readonly [P in keyof T]: DeepImmutable<T[P]> };

// 使用示例
interface NestedData {
  id: number;
  info: {
    name: string;
    details: {
      age: number;
      addresses: string[];
    }
  }
}

// 完全不可变的数据
const data: DeepReadonly<NestedData> = {
  id: 1,
  info: {
    name: "John",
    details: {
      age: 30,
      addresses: ["Home", "Work"]
    }
  }
};

// 错误：无法修改只读属性
// data.info.details.age = 31;
// data.info.details.addresses.push("Other");
```

## 实用类型模式

### 不可变数据结构

TypeScript提供了多种方式来创建和强制不可变数据结构，这对于函数式编程和可预测的状态管理非常重要。

```typescript
// 只读数组
const numbers: ReadonlyArray<number> = [1, 2, 3];
// 或者
const numbers2: readonly number[] = [1, 2, 3];

// 只读元组
const point: readonly [number, number] = [10, 20];

// 只读对象
interface Point {
  readonly x: number;
  readonly y: number;
}

// 不可变映射
type ReadonlyRecord<K extends keyof any, T> = {
  readonly [P in K]: T;
};

// 递归只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 实现不可变更新（类似Immer）
function produce<T extends object>(baseState: T, recipe: (draft: T) => void): T {
  const copy = { ...baseState };
  recipe(copy as T);
  return copy;
}

// 使用示例
const state = { count: 0, user: { name: "John" } };
const newState = produce(state, draft => {
  draft.count++;
  draft.user.name = "Jane";
});
```

### 深度只读/部分类型

这些工具类型允许我们递归地转换对象的属性。

```typescript
// 深度只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 深度部分
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 深度必填
type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// 深度可变
type DeepMutable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? DeepMutable<T[P]> : T[P];
};

// 使用示例
interface Config {
  readonly server: {
    readonly host: string;
    readonly port: number;
    readonly options: {
      readonly timeout: number;
      readonly cache: boolean;
    }
  }
}

// 创建部分配置
const partialConfig: DeepPartial<Config> = {
  server: {
    host: "localhost"
    // 其他字段是可选的
  }
};

// 创建可变配置副本
const mutableConfig: DeepMutable<Config> = {
  server: {
    host: "localhost",
    port: 8080,
    options: {
      timeout: 3000,
      cache: true
    }
  }
};

// 现在可以修改
mutableConfig.server.options.timeout = 5000;
```

### 字符串模板操作

TypeScript 4.1+引入了模板字面量类型，允许我们基于字符串字面量类型进行高级操作。

```typescript
// 基本模板字面量类型
type Greeting = `Hello, ${string}`;
const g1: Greeting = "Hello, World"; // 有效
// const g2: Greeting = "Hi, World"; // 错误

// 联合类型的分配
type Direction = "top" | "right" | "bottom" | "left";
type VerticalPosition = "top" | "bottom";
type HorizontalAlignment = "left" | "center" | "right";
type Alignment = `${VerticalPosition}-${HorizontalAlignment}`;
// "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"

// 大小写转换
type Cases<T extends string> = {
  uppercase: Uppercase<T>;
  lowercase: Lowercase<T>;
  capitalize: Capitalize<T>;
  uncapitalize: Uncapitalize<T>;
};

type TestCases = Cases<"hello">; 
// { uppercase: "HELLO"; lowercase: "hello"; capitalize: "Hello"; uncapitalize: "hello" }

// 创建事件处理器类型
type EventName = "click" | "change" | "mouseover";
type EventHandlerName = `on${Capitalize<EventName>}`;
// "onClick" | "onChange" | "onMouseover"

// 提取对象方法名
type MethodNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never
}[keyof T];

interface User {
  name: string;
  age: number;
  updateProfile(): void;
  getFullName(): string;
}

type UserMethods = MethodNames<User>; // "updateProfile" | "getFullName"
```

### 类型级数值计算

虽然TypeScript的类型系统不是为了数值计算而设计的，但我们可以通过巧妙的类型操作实现一些基本的计算。

```typescript
// 类型级别的数组
type BuildArray<Length extends number, Element = unknown, Acc extends unknown[] = []> =
  Acc['length'] extends Length
    ? Acc
    : BuildArray<Length, Element, [...Acc, Element]>;

// 加法
type Add<A extends number, B extends number> =
  [...BuildArray<A>, ...BuildArray<B>]['length'];

// 减法
type Subtract<A extends number, B extends number> =
  BuildArray<A> extends [...BuildArray<B>, ...infer Rest]
    ? Rest['length']
    : never;

// 乘法
type Multiply<A extends number, B extends number, Acc extends unknown[] = []> =
  B extends 0
    ? 0
    : A extends 0
    ? 0
    : B extends 1
    ? A
    : Acc['length'] extends B
    ? A extends 1
      ? B
      : [...BuildArray<A>, ...BuildArray<A>, ...BuildArray<A>]['length']
    : Multiply<A, B, [...Acc, unknown]>;

// 示例（仅适用于小数值）
type Result1 = Add<3, 4>; // 7
type Result2 = Subtract<5, 2>; // 3
type Result3 = Multiply<2, 3>; // 6
```

### 类型级状态机

我们可以使用TypeScript的类型系统来模拟状态机，确保状态转换的类型安全。

```typescript
// 定义状态
type State = 'Idle' | 'Loading' | 'Success' | 'Error';

// 定义每个状态允许的转换
type StateTransition = {
  Idle: 'Loading';
  Loading: 'Success' | 'Error';
  Success: 'Idle';
  Error: 'Idle' | 'Loading';
};

// 状态机类型
class StateMachine<S extends State, T extends StateTransition> {
  private currentState: S;

  constructor(initialState: S) {
    this.currentState = initialState;
  }

  public getState(): S {
    return this.currentState;
  }

  public transition<NextState extends T[S]>(nextState: NextState): void {
    // 类型系统确保只能转换到允许的状态
    this.currentState = nextState as any;
  }
}

// 使用示例
const machine = new StateMachine<State, StateTransition>('Idle');
machine.transition('Loading'); // 有效
// machine.transition('Error'); // 错误：'Idle' 状态不能直接转换到 'Error'

machine.transition('Success'); // 从 'Loading' 转换到 'Success'
machine.transition('Idle'); // 从 'Success' 转换到 'Idle'
```

## 类型安全

### 严格空值检查

TypeScript的严格空值检查有助于避免空引用错误，这是最常见的运行时错误之一。

```typescript
// 启用严格空值检查
// tsconfig.json: { "strictNullChecks": true }

// 可空类型
function getLength(text: string | null): number {
  // 需要检查null
  if (text === null) {
    return 0;
  }
  return text.length;
}

// 非空断言
function exclaim(message: string | null): string {
  // 使用非空断言运算符（当你确定值不为null时）
  return message!.toUpperCase() + '!';
}

// 可选链和空值合并
type User = {
  name: string;
  address?: {
    street?: string;
    city?: string;
  };
};

function getCity(user: User): string {
  // 可选链
  const city = user.address?.city;
  // 空值合并
  return city ?? 'Unknown city';
}

// 类型守卫
function processValue(value: string | null | undefined): string {
  if (value == null) { // 同时检查null和undefined
    return 'No value';
  }
  return value.toUpperCase();
}
```

### 严格函数检查

严格函数检查确保函数调用的类型安全，防止参数错误。

```typescript
// 启用严格函数检查
// tsconfig.json: { "strictFunctionTypes": true }

// 函数参数双变性问题
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

// 协变：子类型可以赋值给父类型
let animals: Animal[] = [];
let dogs: Dog[] = [];
animals = dogs; // 有效

// 函数参数是逆变的
type AnimalCallback = (animal: Animal) => void;
type DogCallback = (dog: Dog) => void;

let animalFunc: AnimalCallback = (animal) => console.log(animal.name);
let dogFunc: DogCallback = (dog) => console.log(dog.breed);

// 在严格函数类型下，这是不允许的，因为Dog需要更多信息
// dogFunc = animalFunc; // 错误

// 但这是允许的，因为Animal需要的信息更少
animalFunc = dogFunc; // 有效

// 泛型函数
function identity<T>(arg: T): T {
  return arg;
}

const a: string = identity('hello');
const b: number = identity(42);
// const c: string = identity(42); // 错误
```

### 异常处理类型

TypeScript可以帮助我们更安全地处理异常，尽管它没有像一些语言那样的受检异常机制。

```typescript
// 自定义错误类型
class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = 'ValidationError';
    // 修复原型链
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

// 结果类型模式（类似于Rust的Result）
type Result<T, E = Error> = 
  | { success: true; value: T }
  | { success: false; error: E };

function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return {
      success: false,
      error: new Error('Division by zero')
    };
  }
  
  return {
    success: true,
    value: a / b
  };
}

// 使用
const result = divide(10, 2);
if (result.success) {
  console.log(`Result: ${result.value}`);
} else {
  console.error(`Error: ${result.error.message}`);
}

// 异步错误处理
async function fetchData(url: string): Promise<Result<any>> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return {
        success: false,
        error: new Error(`HTTP error: ${response.status}`)
      };
    }
    const data = await response.json();
    return {
      success: true,
      value: data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}
```

### 类型守卫函数

类型守卫是自定义函数，用于在运行时缩小类型范围。

```typescript
// 用户定义的类型守卫
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

function isArray<T>(value: unknown, itemGuard: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(itemGuard);
}

// 使用类型守卫
function processValue(value: unknown): string {
  if (isString(value)) {
    // 在这个块中，value的类型是string
    return value.toUpperCase();
  } else if (isNumber(value)) {
    // 在这个块中，value的类型是number
    return value.toFixed(2);
  } else if (isArray(value, isString)) {
    // 在这个块中，value的类型是string[]
    return value.join(', ');
  }
  return String(value);
}

// 类守卫
class Bird {
  fly() { console.log('Flying...'); }
}

class Fish {
  swim() { console.log('Swimming...'); }
}

function isBird(pet: Bird | Fish): pet is Bird {
  return (pet as Bird).fly !== undefined;
}

function makeMove(pet: Bird | Fish) {
  if (isBird(pet)) {
    pet.fly();
  } else {
    pet.swim();
  }
}
```

### 可辨识联合类型

可辨识联合是TypeScript中一种强大的模式，用于处理有共同"标签"字段的类型联合。

```typescript
// 基本可辨识联合
type Shape = 
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number }
  | { kind: 'square'; size: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    case 'square':
      return shape.size ** 2;
    default:
      // 穷尽检查：如果添加了新的形状类型但忘记处理，这里会报错
      const _exhaustiveCheck: never = shape;
      return _exhaustiveCheck;
  }
}

// 状态管理中的可辨识联合
type State = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: any }
  | { status: 'error'; error: Error };

function renderUI(state: State) {
  switch (state.status) {
    case 'idle':
      return 'Waiting...';
    case 'loading':
      return 'Loading...';
    case 'success':
      return `Data: ${JSON.stringify(state.data)}`;
    case 'error':
      return `Error: ${state.error.message}`;
  }
}

// Redux风格的Action
type Action = 
  | { type: 'INCREMENT'; amount: number }
  | { type: 'DECREMENT'; amount: number }
  | { type: 'RESET' };

function reducer(state: number, action: Action): number {
  switch (action.type) {
    case 'INCREMENT':
      return state + action.amount;
    case 'DECREMENT':
      return state - action.amount;
    case 'RESET':
      return 0;
  }
}
```

## 总结

TypeScript的高级类型模式为我们提供了强大的工具，用于构建类型安全、可维护的应用程序。通过掌握这些技术，你可以：

1. 创建精确的类型定义，捕获复杂的业务规则
2. 减少运行时错误，提高代码质量
3. 提供更好的开发体验，包括自动完成和类型检查
4. 使重构更安全，因为类型系统会捕获许多潜在问题

虽然高级类型技术有时看起来很复杂，但它们是构建大型TypeScript应用程序的重要工具。随着经验的积累，你会发现这些模式在日常开发中越来越有用。 