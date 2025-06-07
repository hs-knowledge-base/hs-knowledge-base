# TypeScript类与面向对象编程

TypeScript提供了全面的面向对象编程支持，包括类、接口、继承、多态等特性。本文将深入探讨TypeScript中的类与面向对象编程概念。

## 类定义

### 构造函数与属性

在TypeScript中，类的定义包括属性声明、构造函数和方法：

```typescript
class Person {
  // 属性声明
  name: string;
  age: number;
  
  // 构造函数
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
  
  // 方法
  greet(): string {
    return `Hello, my name is ${this.name} and I am ${this.age} years old.`;
  }
}

// 创建实例
const person = new Person('Alice', 30);
console.log(person.greet()); // "Hello, my name is Alice and I am 30 years old."
```

**属性初始化的简写方式**：

```typescript
class Person {
  // 参数属性 - 简化属性声明和初始化
  constructor(public name: string, public age: number) {
    // 不需要额外的赋值语句
  }
  
  greet(): string {
    return `Hello, my name is ${this.name} and I am ${this.age} years old.`;
  }
}
```

### 访问修饰符

TypeScript提供了三种访问修饰符来控制类成员的可见性：

```typescript
class BankAccount {
  // public - 默认，可从任何地方访问
  public accountHolder: string;
  
  // private - 只能在类内部访问
  private balance: number;
  
  // protected - 只能在类内部和子类中访问
  protected accountNumber: string;
  
  constructor(holder: string, initialBalance: number) {
    this.accountHolder = holder;
    this.balance = initialBalance;
    this.accountNumber = this.generateAccountNumber();
  }
  
  // 私有方法
  private generateAccountNumber(): string {
    return Math.random().toString(36).substring(2, 18);
  }
  
  // 公共方法
  public deposit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }
    this.balance += amount;
  }
  
  public withdraw(amount: number): boolean {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }
    
    if (amount > this.balance) {
      return false; // 余额不足
    }
    
    this.balance -= amount;
    return true;
  }
  
  public getBalance(): number {
    return this.balance;
  }
}

const account = new BankAccount('John Doe', 1000);
account.deposit(500);
console.log(account.getBalance()); // 1500

// 错误：属性"balance"为私有属性，只能在类"BankAccount"中访问
// console.log(account.balance);

// 错误：属性"accountNumber"受保护，只能在类"BankAccount"及其子类中访问
// console.log(account.accountNumber);
```

### 静态成员与实例成员

类可以包含静态成员（属于类本身）和实例成员（属于类的实例）：

```typescript
class MathHelper {
  // 静态属性
  static readonly PI: number = 3.14159;
  
  // 实例属性
  precision: number;
  
  constructor(precision: number = 2) {
    this.precision = precision;
  }
  
  // 静态方法
  static square(x: number): number {
    return x * x;
  }
  
  static cube(x: number): number {
    return x * x * x;
  }
  
  // 实例方法
  round(value: number): number {
    const factor = Math.pow(10, this.precision);
    return Math.round(value * factor) / factor;
  }
}

// 使用静态成员
console.log(MathHelper.PI); // 3.14159
console.log(MathHelper.square(4)); // 16
console.log(MathHelper.cube(3)); // 27

// 使用实例成员
const helper = new MathHelper(3);
console.log(helper.round(MathHelper.PI)); // 3.142
```

### 抽象类与方法

抽象类是不能直接实例化的类，它们通常包含抽象方法，这些方法必须在子类中实现：

```typescript
// 抽象类
abstract class Shape {
  // 普通属性
  color: string;
  
  constructor(color: string) {
    this.color = color;
  }
  
  // 抽象方法 - 没有实现，必须在子类中实现
  abstract calculateArea(): number;
  abstract calculatePerimeter(): number;
  
  // 普通方法
  getColor(): string {
    return this.color;
  }
}

// 具体类
class Circle extends Shape {
  radius: number;
  
  constructor(color: string, radius: number) {
    super(color);
    this.radius = radius;
  }
  
  // 实现抽象方法
  calculateArea(): number {
    return Math.PI * this.radius * this.radius;
  }
  
  calculatePerimeter(): number {
    return 2 * Math.PI * this.radius;
  }
}

class Rectangle extends Shape {
  width: number;
  height: number;
  
  constructor(color: string, width: number, height: number) {
    super(color);
    this.width = width;
    this.height = height;
  }
  
  calculateArea(): number {
    return this.width * this.height;
  }
  
  calculatePerimeter(): number {
    return 2 * (this.width + this.height);
  }
}

// 错误：无法创建抽象类的实例
// const shape = new Shape('red');

const circle = new Circle('blue', 5);
console.log(circle.calculateArea()); // 78.54...
console.log(circle.calculatePerimeter()); // 31.42...

const rectangle = new Rectangle('green', 4, 6);
console.log(rectangle.calculateArea()); // 24
console.log(rectangle.calculatePerimeter()); // 20
```

### 方法重载

TypeScript支持方法重载，允许一个方法根据不同的参数类型或数量有不同的行为：

```typescript
class Calculator {
  // 重载签名
  add(a: number, b: number): number;
  add(a: string, b: string): string;
  add(a: Date, b: number): Date;
  
  // 实现
  add(a: number | string | Date, b: number | string): number | string | Date {
    if (typeof a === 'number' && typeof b === 'number') {
      return a + b;
    } else if (typeof a === 'string' && typeof b === 'string') {
      return a.concat(b);
    } else if (a instanceof Date && typeof b === 'number') {
      const date = new Date(a);
      date.setDate(date.getDate() + b);
      return date;
    }
    throw new Error('Invalid arguments');
  }
}

const calc = new Calculator();
console.log(calc.add(5, 3)); // 8
console.log(calc.add('Hello, ', 'World')); // "Hello, World"

const today = new Date();
const future = calc.add(today, 7); // 7天后的日期
```

## 类继承

### 继承机制与super关键字

TypeScript支持单继承，子类可以继承父类的属性和方法：

```typescript
// 基类
class Animal {
  name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  move(distance: number = 0): void {
    console.log(`${this.name} moved ${distance} meters.`);
  }
}

// 派生类
class Dog extends Animal {
  breed: string;
  
  constructor(name: string, breed: string) {
    // 调用父类构造函数
    super(name);
    this.breed = breed;
  }
  
  // 重写父类方法
  move(distance: number = 5): void {
    console.log(`${this.name} is running...`);
    // 调用父类方法
    super.move(distance);
  }
  
  bark(): void {
    console.log('Woof! Woof!');
  }
}

const dog = new Dog('Rex', 'German Shepherd');
dog.bark(); // "Woof! Woof!"
dog.move(10); // "Rex is running..." 然后 "Rex moved 10 meters."
console.log(dog.breed); // "German Shepherd"
```

### 方法重写与多态

子类可以重写父类的方法，实现多态行为：

```typescript
class Animal {
  makeSound(): void {
    console.log('Some generic sound');
  }
  
  sleep(): void {
    console.log('Zzz...');
  }
}

class Dog extends Animal {
  // 重写方法
  makeSound(): void {
    console.log('Woof! Woof!');
  }
}

class Cat extends Animal {
  // 重写方法
  makeSound(): void {
    console.log('Meow!');
  }
}

// 多态
function makeAnimalSound(animal: Animal): void {
  animal.makeSound();
}

const dog = new Dog();
const cat = new Cat();

makeAnimalSound(dog); // "Woof! Woof!"
makeAnimalSound(cat); // "Meow!"

// 父类方法仍然可用
dog.sleep(); // "Zzz..."
cat.sleep(); // "Zzz..."
```

### 接口实现与多接口

类可以实现一个或多个接口，确保它们提供特定的方法和属性：

```typescript
// 定义接口
interface Movable {
  move(distance: number): void;
}

interface Resizable {
  resize(factor: number): void;
}

// 实现单个接口
class Car implements Movable {
  position: number = 0;
  
  move(distance: number): void {
    this.position += distance;
    console.log(`Car moved to position ${this.position}`);
  }
}

// 实现多个接口
class Rectangle implements Movable, Resizable {
  x: number = 0;
  y: number = 0;
  width: number;
  height: number;
  
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
  
  move(distance: number): void {
    this.x += distance;
    this.y += distance;
    console.log(`Rectangle moved to position (${this.x}, ${this.y})`);
  }
  
  resize(factor: number): void {
    this.width *= factor;
    this.height *= factor;
    console.log(`Rectangle resized to ${this.width}x${this.height}`);
  }
}

const car = new Car();
car.move(10); // "Car moved to position 10"

const rect = new Rectangle(5, 10);
rect.move(5); // "Rectangle moved to position (5, 5)"
rect.resize(2); // "Rectangle resized to 10x20"
```

### 混入模式（Mixins）

混入是一种代码复用模式，允许将多个类的功能组合到一个类中：

```typescript
// 混入类 - 只包含要混入的功能
class Timestamped {
  timestamp: Date = new Date();
  
  getTimestamp(): Date {
    return this.timestamp;
  }
}

class Activatable {
  isActive: boolean = false;
  
  activate(): void {
    this.isActive = true;
  }
  
  deactivate(): void {
    this.isActive = false;
  }
}

// 目标类
class User {
  name: string;
  
  constructor(name: string) {
    this.name = name;
  }
}

// 混入函数
function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      if (name !== 'constructor') {
        derivedCtor.prototype[name] = baseCtor.prototype[name];
      }
    });
  });
}

// 接口声明混入的属性和方法
interface User extends Timestamped, Activatable {}

// 应用混入
applyMixins(User, [Timestamped, Activatable]);

// 使用混入后的类
const user = new User('John');
console.log(user.name); // "John"
console.log(user.getTimestamp()); // 当前日期时间
console.log(user.isActive); // false
user.activate();
console.log(user.isActive); // true
```

### 装饰器模式

TypeScript支持装饰器，这是一种特殊类型的声明，可以附加到类、方法、访问器、属性或参数上：

```typescript
// 需要在tsconfig.json中启用 "experimentalDecorators": true

// 类装饰器
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

// 方法装饰器
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    console.log(`Calling ${propertyKey} with:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`Result:`, result);
    return result;
  };
  
  return descriptor;
}

// 属性装饰器
function format(formatString: string) {
  return function(target: any, propertyKey: string) {
    let value: any;
    
    const getter = function() {
      return value;
    };
    
    const setter = function(newVal: any) {
      value = typeof newVal === 'number' 
        ? formatString.replace('{0}', newVal.toString())
        : newVal;
    };
    
    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    });
  };
}

// 参数装饰器
function required(target: any, propertyKey: string, parameterIndex: number) {
  const requiredParams: number[] = Reflect.getMetadata('required', target, propertyKey) || [];
  requiredParams.push(parameterIndex);
  Reflect.defineMetadata('required', requiredParams, target, propertyKey);
}

// 使用装饰器
@sealed
class Greeter {
  @format('Value: {0}')
  greeting: string;
  
  constructor(message: string) {
    this.greeting = message;
  }
  
  @log
  greet(@required name: string): string {
    return `${this.greeting}, ${name}!`;
  }
}

const greeter = new Greeter('Hello');
console.log(greeter.greeting); // "Value: Hello"
greeter.greet('World'); // 日志输出和 "Hello, World!"
```

## 高级特性

### 只读属性与参数属性

TypeScript允许将属性标记为只读，确保它们在初始化后不能被修改：

```typescript
class Point {
  // 只读属性
  readonly x: number;
  readonly y: number;
  
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  
  // 错误：无法分配到"x"，因为它是只读属性
  // moveX(value: number): void {
  //   this.x = value;
  // }
}

// 参数属性简写
class Circle {
  // 使用参数属性简化只读属性声明
  constructor(
    public readonly center: Point,
    public readonly radius: number
  ) {}
  
  calculateArea(): number {
    return Math.PI * this.radius * this.radius;
  }
}

const point = new Point(10, 20);
// 错误：无法分配到"x"，因为它是只读属性
// point.x = 30;

const circle = new Circle(point, 15);
console.log(circle.calculateArea()); // 706.86...
```

### 访问器getter/setter

TypeScript支持属性访问器，允许你拦截属性的读取和写入操作：

```typescript
class Person {
  private _age: number = 0;
  private _firstName: string = '';
  private _lastName: string = '';
  
  // age的getter和setter
  get age(): number {
    return this._age;
  }
  
  set age(value: number) {
    if (value < 0 || value > 120) {
      throw new Error('Age must be between 0 and 120');
    }
    this._age = value;
  }
  
  // firstName的getter和setter
  get firstName(): string {
    return this._firstName;
  }
  
  set firstName(value: string) {
    if (value.length === 0) {
      throw new Error('First name cannot be empty');
    }
    this._firstName = value;
  }
  
  // lastName的getter和setter
  get lastName(): string {
    return this._lastName;
  }
  
  set lastName(value: string) {
    if (value.length === 0) {
      throw new Error('Last name cannot be empty');
    }
    this._lastName = value;
  }
  
  // 只读计算属性
  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }
}

const person = new Person();
person.firstName = 'John';
person.lastName = 'Doe';
person.age = 30;

console.log(person.fullName); // "John Doe"

try {
  person.age = 150; // 抛出错误
} catch (error) {
  console.error(error.message); // "Age must be between 0 and 120"
}
```

### 索引签名

索引签名允许你定义具有动态属性名的类：

```typescript
class Dictionary {
  // 索引签名
  [key: string]: string | number | undefined;
  
  // 固定属性
  readonly name: string;
  count: number = 0;
  
  constructor(name: string) {
    this.name = name;
  }
  
  add(key: string, value: string): void {
    this[key] = value;
    this.count++;
  }
  
  get(key: string): string | undefined {
    return this[key] as string | undefined;
  }
  
  remove(key: string): boolean {
    if (this[key] !== undefined) {
      delete this[key];
      this.count--;
      return true;
    }
    return false;
  }
}

const dict = new Dictionary('MyDictionary');
dict.add('apple', 'A fruit');
dict.add('car', 'A vehicle');

console.log(dict.get('apple')); // "A fruit"
console.log(dict.count); // 2

dict.remove('apple');
console.log(dict.get('apple')); // undefined
console.log(dict.count); // 1
```

### this类型与方法链

`this`类型允许方法返回当前实例，实现方法链：

```typescript
class Calculator {
  private value: number = 0;
  
  add(operand: number): this {
    this.value += operand;
    return this;
  }
  
  subtract(operand: number): this {
    this.value -= operand;
    return this;
  }
  
  multiply(operand: number): this {
    this.value *= operand;
    return this;
  }
  
  divide(operand: number): this {
    if (operand === 0) {
      throw new Error('Division by zero');
    }
    this.value /= operand;
    return this;
  }
  
  getValue(): number {
    return this.value;
  }
}

// 使用方法链
const result = new Calculator()
  .add(10)
  .multiply(2)
  .subtract(5)
  .divide(5)
  .getValue();

console.log(result); // 3
```

**在子类中使用this类型**：

```typescript
class ScientificCalculator extends Calculator {
  square(): this {
    const value = this.getValue();
    return this.multiply(value);
  }
  
  sin(): this {
    const value = this.getValue();
    // 替换当前值为其正弦值
    return this.add(Math.sin(value) - value);
  }
}

// 方法链，包括子类方法
const sciResult = new ScientificCalculator()
  .add(Math.PI / 2)
  .sin()
  .getValue();

console.log(sciResult); // 约为1（sin(π/2) = 1）
```

### 类型守卫与类型断言

类型守卫和类型断言可以帮助TypeScript更精确地推断类的类型：

```typescript
// 基类和子类
class Animal {
  name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  move(): void {
    console.log(`${this.name} is moving`);
  }
}

class Bird extends Animal {
  fly(): void {
    console.log(`${this.name} is flying`);
  }
}

class Fish extends Animal {
  swim(): void {
    console.log(`${this.name} is swimming`);
  }
}

// 类型守卫函数
function isBird(animal: Animal): animal is Bird {
  return (animal as Bird).fly !== undefined;
}

function isFish(animal: Animal): animal is Fish {
  return (animal as Fish).swim !== undefined;
}

// 使用类型守卫
function makeAnimalMove(animal: Animal): void {
  animal.move();
  
  if (isBird(animal)) {
    // 在这个块中，TypeScript知道animal是Bird类型
    animal.fly();
  } else if (isFish(animal)) {
    // 在这个块中，TypeScript知道animal是Fish类型
    animal.swim();
  }
}

// 使用instanceof作为类型守卫
function moveAnimal(animal: Animal): void {
  animal.move();
  
  if (animal instanceof Bird) {
    animal.fly();
  } else if (animal instanceof Fish) {
    animal.swim();
  }
}

// 类型断言
function tryToFly(animal: Animal): void {
  if (animal instanceof Bird) {
    // 不需要类型断言，TypeScript已经知道类型
    animal.fly();
  } else {
    // 使用类型断言（不安全，可能运行时错误）
    try {
      (animal as Bird).fly();
    } catch (error) {
      console.error(`${animal.name} cannot fly!`);
    }
  }
}

const bird = new Bird('Sparrow');
const fish = new Fish('Salmon');

makeAnimalMove(bird); // "Sparrow is moving" 然后 "Sparrow is flying"
makeAnimalMove(fish); // "Salmon is moving" 然后 "Salmon is swimming"

tryToFly(bird); // "Sparrow is flying"
tryToFly(fish); // "Salmon cannot fly!"
```

## 总结

TypeScript的类与面向对象编程特性提供了强大的工具来构建结构化、可维护的代码。通过使用类、继承、接口、访问修饰符和其他高级特性，你可以创建清晰的类型层次结构，确保代码的类型安全，并利用面向对象编程的所有优势。

无论你是构建小型应用还是大型企业系统，TypeScript的面向对象特性都能帮助你组织代码，减少错误，并提高开发效率。 