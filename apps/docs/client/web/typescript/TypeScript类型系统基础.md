# TypeScript类型系统基础

TypeScript的核心特性是其强大的类型系统，它在JavaScript的基础上增加了静态类型检查。本文将深入探讨TypeScript类型系统的基础概念，帮助你掌握类型声明、推断和操作的基本技巧。

## 基本类型

### 原始类型

TypeScript支持JavaScript中的所有原始类型，并为它们提供了类型注解：

```typescript
// 字符串
let name: string = "Alice";

// 数字（包括整数和浮点数）
let age: number = 30;
let price: number = 99.99;

// 布尔值
let isActive: boolean = true;

// Symbol
let id: symbol = Symbol("id");

// BigInt
let bigNumber: bigint = 100n;
```

### 特殊类型

TypeScript还提供了一些特殊类型来处理各种情况：

```typescript
// null和undefined
let empty: null = null;
let notDefined: undefined = undefined;

// void - 通常用作没有返回值的函数的返回类型
function logMessage(message: string): void {
  console.log(message);
}

// any - 可以是任何类型，绕过类型检查
let anything: any = 42;
anything = "now I'm a string";
anything = { obj: "now I'm an object" };

// unknown - 比any更安全的类型，需要类型检查才能使用
let value: unknown = 10;
// 错误：value是unknown类型，不能直接使用
// console.log(value.length);

// 使用类型守卫后可以安全使用
if (typeof value === "string") {
  console.log(value.length); // 现在可以安全使用了
}

// never - 表示永远不会发生的值的类型
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}
```

### 字面量类型与联合类型

TypeScript允许你使用具体的字面量值作为类型，以及使用联合类型组合多个类型：

```typescript
// 字面量类型
let exactlyFive: 5 = 5;
// 错误：不能将类型"6"分配给类型"5"
// exactlyFive = 6;

let direction: "north" | "south" | "east" | "west";
direction = "north"; // 有效
// 错误：不能将类型"northeast"分配给类型"north" | "south" | "east" | "west"
// direction = "northeast";

// 联合类型
let id: string | number;
id = "abc123"; // 有效
id = 123; // 有效
// 错误：不能将类型"boolean"分配给类型"string | number"
// id = true;

// 字面量联合类型
type Alignment = "left" | "right" | "center";
let textAlign: Alignment = "center";

// 数字字面量联合
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
let roll: DiceRoll = 6;
```

### 类型别名与类型断言

类型别名允许你为类型创建自定义名称，而类型断言允许你告诉编译器某个值的确切类型：

```typescript
// 类型别名
type UserID = string | number;
let userId: UserID = "user123";

type Point = {
  x: number;
  y: number;
};

let position: Point = { x: 10, y: 20 };

// 类型断言
let someValue: unknown = "this is a string";
let strLength: number = (someValue as string).length;
// 或者使用尖括号语法（在JSX中不可用）
let strLength2: number = (<string>someValue).length;

// 非空断言
function getLength(text: string | null): number {
  // 使用!告诉编译器text不会是null
  return text!.length;
}

// const断言
let readonlyArray = [1, 2, 3] as const; // 类型是readonly [1, 2, 3]
// 错误：无法修改只读数组
// readonlyArray[0] = 4;
```

### 枚举类型

枚举允许你定义一组命名常量：

```typescript
// 数字枚举
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right  // 3
}

let move: Direction = Direction.Up;
console.log(move); // 0

// 字符串枚举
enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE"
}

let color: Color = Color.Green;
console.log(color); // "GREEN"

// 异构枚举（混合数字和字符串）
enum Status {
  Success = 200,
  NotFound = 404,
  Error = "ERROR"
}

// 常量枚举（编译时内联）
const enum Size {
  Small,
  Medium,
  Large
}

let size = Size.Medium;
// 编译为：let size = 1;

// 反向映射（仅适用于数字枚举）
console.log(Direction[0]); // "Up"
console.log(Direction["Up"]); // 0
```

## 复合类型

### 数组与元组

TypeScript提供了多种方式来处理数组和固定长度的元组：

```typescript
// 数组
let numbers: number[] = [1, 2, 3, 4, 5];
// 或使用泛型语法
let strings: Array<string> = ["a", "b", "c"];

// 只读数组
const readonlyNumbers: ReadonlyArray<number> = [1, 2, 3];
// 或使用简写语法
const readonlyStrings: readonly string[] = ["a", "b", "c"];

// 多类型数组
let mixed: (string | number)[] = [1, "two", 3, "four"];

// 元组 - 固定长度和类型的数组
let tuple: [string, number, boolean] = ["hello", 42, true];
console.log(tuple[0]); // "hello"
console.log(tuple[1]); // 42

// 可选元素的元组
let optionalTuple: [string, number, boolean?] = ["hello", 42];

// 剩余元素的元组
let restTuple: [string, ...number[]] = ["hello", 1, 2, 3, 4];

// 只读元组
let readonlyTuple: readonly [string, number] = ["hello", 42];
// 错误：无法修改只读元组
// readonlyTuple[0] = "hi";

// 命名元组（提高可读性）
let person: [name: string, age: number] = ["Alice", 30];
```

### 对象类型

对象类型描述了对象的属性和方法：

```typescript
// 基本对象类型
let user: { name: string; age: number } = {
  name: "Alice",
  age: 30
};

// 可选属性
let config: { debug?: boolean; timeout: number } = {
  timeout: 5000
};

// 只读属性
let point: { readonly x: number; readonly y: number } = {
  x: 10,
  y: 20
};
// 错误：无法修改只读属性
// point.x = 5;

// 索引签名
let dictionary: { [key: string]: string } = {};
dictionary.apple = "A fruit";
dictionary.car = "A vehicle";

// 混合属性和索引签名
let user2: {
  id: number;
  name: string;
  [key: string]: string | number;
} = {
  id: 1,
  name: "Alice",
  age: 30,
  city: "New York"
};
```

### 函数类型

TypeScript允许你详细指定函数的参数和返回类型：

```typescript
// 函数声明
function add(a: number, b: number): number {
  return a + b;
}

// 函数表达式
const subtract = function(a: number, b: number): number {
  return a - b;
};

// 箭头函数
const multiply: (a: number, b: number) => number = (a, b) => a * b;

// 可选参数
function greet(name: string, greeting?: string): string {
  return greeting ? `${greeting}, ${name}!` : `Hello, ${name}!`;
}

// 默认参数
function createUser(name: string, age: number = 18): { name: string; age: number } {
  return { name, age };
}

// 剩余参数
function sum(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0);
}

// 函数重载
function process(value: string): string;
function process(value: number): number;
function process(value: string | number): string | number {
  if (typeof value === "string") {
    return value.toUpperCase();
  } else {
    return value * 2;
  }
}

// 回调函数类型
function fetchData(url: string, callback: (data: any) => void): void {
  // 假设这是一个异步操作
  setTimeout(() => {
    const data = { id: 1, name: "Test" };
    callback(data);
  }, 100);
}
```

### 联合类型与交叉类型

联合类型表示值可以是几种类型之一，而交叉类型将多种类型合并为一个：

```typescript
// 联合类型
function formatValue(value: string | number): string {
  if (typeof value === "string") {
    return value.trim();
  }
  return value.toFixed(2);
}

// 判别联合类型
type Circle = {
  kind: "circle";
  radius: number;
};

type Rectangle = {
  kind: "rectangle";
  width: number;
  height: number;
};

type Shape = Circle | Rectangle;

function calculateArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
  }
}

// 交叉类型
type Person = {
  name: string;
  age: number;
};

type Employee = {
  id: number;
  department: string;
};

type EmployeeInfo = Person & Employee;

const employee: EmployeeInfo = {
  name: "Alice",
  age: 30,
  id: 123,
  department: "Engineering"
};

// 交叉类型可能导致的冲突
type A = { prop: string };
type B = { prop: number };
type C = A & B;
// C的prop属性类型是string & number，实际上是never类型
// 无法创建满足这个类型的值
```

### 类型推断与类型兼容性

TypeScript能够在许多情况下自动推断类型，并根据结构而非名称判断类型兼容性：

```typescript
// 类型推断
let name = "Alice"; // 推断为string类型
let age = 30; // 推断为number类型
let active = true; // 推断为boolean类型

let numbers = [1, 2, 3]; // 推断为number[]类型
let mixed = [1, "two", true]; // 推断为(string | number | boolean)[]类型

// 上下文类型推断
window.addEventListener("click", function(event) {
  // event被推断为MouseEvent类型
  console.log(event.button);
});

// 结构类型兼容性
interface Point {
  x: number;
  y: number;
}

const point = { x: 10, y: 20, z: 30 };
// 有效，因为point包含Point所需的所有属性
const p: Point = point;

// 函数参数双变性
type Logger = (message: string | number) => void;

// 参数类型更宽松的函数可以赋值给参数类型更严格的函数类型
const log: Logger = (message: string) => {
  console.log(message);
};

// 返回类型协变
type Factory<T> = () => T;
type NumberFactory = Factory<number>;
type AnyFactory = Factory<any>;

// 返回类型更具体的函数可以赋值给返回类型更宽松的函数类型
const numberFactory: NumberFactory = () => 42;
const anyFactory: AnyFactory = numberFactory; // 有效

// 返回类型更宽松的函数不能赋值给返回类型更具体的函数类型
// const wrongAssignment: NumberFactory = anyFactory; // 错误
```

## 类型注解

### 变量类型注解

类型注解允许你明确指定变量的类型：

```typescript
// 基本类型注解
let name: string = "Alice";
let age: number = 30;
let active: boolean = true;

// 联合类型注解
let id: string | number = "abc123";

// 数组类型注解
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["Alice", "Bob", "Charlie"];

// 对象类型注解
let user: { name: string; age: number } = {
  name: "Alice",
  age: 30
};

// 使用类型别名
type Point = { x: number; y: number };
let position: Point = { x: 10, y: 20 };

// 使用接口
interface User {
  name: string;
  age: number;
}
let admin: User = { name: "Admin", age: 35 };

// 函数类型注解
let greet: (name: string) => string;
greet = (name) => `Hello, ${name}!`;

// 字面量类型注解
let direction: "north" | "south" | "east" | "west" = "north";
```

### 函数参数与返回值

为函数参数和返回值添加类型注解可以提高代码的可读性和安全性：

```typescript
// 基本函数类型注解
function add(a: number, b: number): number {
  return a + b;
}

// 可选参数
function greet(name: string, greeting?: string): string {
  return greeting ? `${greeting}, ${name}!` : `Hello, ${name}!`;
}

// 默认参数
function createUser(name: string, age: number = 18): { name: string; age: number } {
  return { name, age };
}

// 剩余参数
function sum(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0);
}

// 回调函数参数
function fetchData(url: string, callback: (data: any) => void): void {
  // ...
}

// 函数重载
function process(value: string): string;
function process(value: number): number;
function process(value: string | number): string | number {
  if (typeof value === "string") {
    return value.toUpperCase();
  } else {
    return value * 2;
  }
}

// 箭头函数类型注解
const multiply: (a: number, b: number) => number = (a, b) => a * b;

// 方法类型注解
interface Calculator {
  add(a: number, b: number): number;
  subtract(a: number, b: number): number;
}

const calc: Calculator = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b
};
```

### 对象属性类型

对象属性可以有各种类型注解：

```typescript
// 基本对象属性类型
interface User {
  name: string;
  age: number;
  active: boolean;
}

// 可选属性
interface Config {
  debug?: boolean;
  timeout: number;
}

// 只读属性
interface Point {
  readonly x: number;
  readonly y: number;
}

// 索引签名
interface Dictionary {
  [key: string]: string;
}

// 混合属性和索引签名
interface DynamicObject {
  id: number;
  name: string;
  [key: string]: string | number;
}

// 嵌套对象类型
interface Address {
  street: string;
  city: string;
  zipCode: string;
}

interface Person {
  name: string;
  age: number;
  address: Address;
}

const person: Person = {
  name: "Alice",
  age: 30,
  address: {
    street: "123 Main St",
    city: "New York",
    zipCode: "10001"
  }
};
```

### 数组与泛型类型

数组和泛型类型提供了处理集合和可重用类型的方式：

```typescript
// 数组类型注解
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["Alice", "Bob"];

// 只读数组
let readonlyNumbers: ReadonlyArray<number> = [1, 2, 3];
let readonlyNames: readonly string[] = ["Alice", "Bob"];

// 元组类型
let tuple: [string, number] = ["Alice", 30];

// 泛型类型
interface Box<T> {
  value: T;
}

let stringBox: Box<string> = { value: "Hello" };
let numberBox: Box<number> = { value: 42 };

// 泛型函数
function identity<T>(arg: T): T {
  return arg;
}

const result = identity<string>("hello");
// 或者让TypeScript推断类型
const result2 = identity(42);

// 泛型约束
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength("hello"); // 有效，字符串有length属性
logLength([1, 2, 3]); // 有效，数组有length属性
// logLength(123); // 错误，数字没有length属性
```

### 可选与只读修饰符

TypeScript提供了修饰符来控制属性的可选性和可变性：

```typescript
// 可选属性
interface User {
  id: number;
  name: string;
  email?: string; // 可选属性
  phone?: string; // 可选属性
}

const user: User = {
  id: 1,
  name: "Alice"
  // email和phone是可选的，可以省略
};

// 只读属性
interface Point {
  readonly x: number;
  readonly y: number;
}

const point: Point = { x: 10, y: 20 };
// 错误：无法修改只读属性
// point.x = 5;

// 只读数组
const numbers: readonly number[] = [1, 2, 3];
// 错误：readonly数组的方法不可用
// numbers.push(4);

// 只读元组
const tuple: readonly [string, number] = ["Alice", 30];
// 错误：无法修改只读元组
// tuple[0] = "Bob";

// 只读映射类型
type ReadonlyUser = {
  readonly [K in keyof User]: User[K];
};

const readonlyUser: ReadonlyUser = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};
// 错误：无法修改只读属性
// readonlyUser.name = "Bob";
```

## 总结

TypeScript的类型系统提供了丰富的工具来描述和验证代码中的数据结构和行为。通过掌握基本类型、复合类型和类型注解，你可以编写更安全、更可维护的代码，减少运行时错误，并提高开发效率。

随着你对TypeScript的深入了解，你将能够使用更高级的类型特性，如泛型、条件类型和映射类型，来解决更复杂的类型问题。类型系统的强大之处在于它不仅可以捕获错误，还可以作为代码的文档，帮助你和你的团队更好地理解和使用代码。 