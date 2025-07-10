# JavaScript中的call、apply和bind详解

你是否遇到过这样的问题：明明定义了一个方法，但在某些情况下调用时`this`却不是你期望的对象？或者想要借用其他对象的方法，但不知道如何操作？

这些都是JavaScript中`this`绑定的常见困扰。好在JavaScript提供了三个强大的方法：`call`、`apply`和`bind`，它们能让我们精确控制函数执行时的上下文。

## 为什么需要这些方法？

### 常见的this困扰

先来看一个日常开发中的典型场景：

```javascript
// 假设我们有一个用户对象
const user = {
  name: '小明',
  showProfile() {
    console.log(`用户：${this.name}`);
  }
};

user.showProfile(); // 用户：小明

// 但是当我们把方法赋值给变量时...
const showProfile = user.showProfile;
showProfile(); // 用户：undefined

// 或者作为回调函数时...
setTimeout(user.showProfile, 1000); // 用户：undefined
```

看到了吗？同样的方法，在不同的调用方式下，`this`指向了不同的对象。这就是JavaScript中`this`绑定的"陷阱"。

### 更复杂的场景

在实际开发中，这种问题更加常见：

```javascript
class TodoList {
  constructor() {
    this.todos = [];
  }

  addTodo(text) {
    this.todos.push({ text, completed: false });
    console.log(`添加了任务：${text}`);
  }

  bindEvents() {
    // 这样绑定事件会有问题
    document.getElementById('add-btn').addEventListener('click', this.addTodo);
    // 点击按钮时，this.addTodo中的this指向button元素，而不是TodoList实例
  }
}
```

这时候，`call`、`apply`和`bind`就派上用场了！

## call方法：立即借用

`call`方法就像是"立即借用"别人的方法。你可以指定任何对象作为`this`，然后立即执行函数。

### 基本语法

```javascript
function.call(thisArg, arg1, arg2, ...)
```

### 解决开头的问题

还记得开头的用户对象吗？用`call`可以轻松解决：

```javascript
const user = {
  name: '小明',
  showProfile() {
    console.log(`用户：${this.name}`);
  }
};

const anotherUser = { name: '小红' };

// 让小红"借用"小明的showProfile方法
user.showProfile.call(anotherUser); // 用户：小红

// 或者确保在回调中this指向正确
function handleClick() {
  user.showProfile.call(user); // 确保this指向user
}
```

### 实际应用场景

#### 1. 让类数组对象"变身"真数组

有时候我们有一个看起来像数组但不是数组的对象，想要使用数组的方法：

```javascript
// DOM查询返回的NodeList，arguments对象等都是类数组
function handleArguments() {
  console.log(typeof arguments); // object
  console.log(Array.isArray(arguments)); // false

  // 借用数组的slice方法，把arguments转成真数组
  const realArray = Array.prototype.slice.call(arguments);
  console.log(Array.isArray(realArray)); // true

  // 现在可以使用数组方法了
  realArray.forEach(arg => console.log(arg));
}

handleArguments('hello', 'world', 123);
```

#### 2. 精确的类型检测

`typeof`和`instanceof`有时候不够准确，用`call`可以获得最精确的类型：

```javascript
function getType(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1);
}

// 这些用typeof都返回"object"，但实际类型不同
console.log(getType([])); // Array
console.log(getType({})); // Object
console.log(getType(new Date())); // Date
console.log(getType(null)); // Null
console.log(getType(/regex/)); // RegExp

// 在实际项目中很有用
function isArray(obj) {
  return getType(obj) === 'Array';
}
```

#### 3. 构造函数继承

```javascript
function Animal(name) {
  this.name = name;
  this.species = 'animal';
}

function Dog(name, breed) {
  Animal.call(this, name); // 调用父构造函数
  this.breed = breed;
}

const dog = new Dog('旺财', '金毛');
console.log(dog.name); // 旺财
console.log(dog.species); // animal
console.log(dog.breed); // 金毛
```

## apply方法：数组参数的好伙伴

`apply`和`call`几乎一样，唯一的区别是参数传递方式。如果你的参数已经在一个数组里，`apply`就是最佳选择。

### 基本语法

```javascript
function.apply(thisArg, [argsArray])
```

### 基础用法

```javascript
function introduce(age, city) {
  console.log(`我是${this.name}，今年${age}岁，来自${city}`);
}

const person = { name: '王五' };
const args = [28, '广州'];

// 使用apply，参数以数组形式传递
introduce.apply(person, args); // 我是王五，今年28岁，来自广州
```

### 实际应用场景

#### 1. 数组中找最值

想象一下，你有一堆数字，想找出最大值。`Math.max`只接受单个参数，不接受数组，怎么办？

```javascript
const scores = [85, 92, 78, 96, 88];

// 这样不行
// console.log(Math.max(scores)); // NaN

// 用apply就可以了！
const highestScore = Math.max.apply(null, scores);
console.log(`最高分：${highestScore}`); // 最高分：96

const lowestScore = Math.min.apply(null, scores);
console.log(`最低分：${lowestScore}`); // 最低分：78

// 现在有了ES6扩展运算符，写法更简洁
// const highestScore = Math.max(...scores);
```

#### 2. 数组合并

```javascript
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];

// 使用apply合并数组
arr1.push.apply(arr1, arr2);
console.log(arr1); // [1, 2, 3, 4, 5, 6]

// ES6扩展运算符的替代方案
// arr1.push(...arr2);
```

#### 3. 类数组转换

```javascript
function convertToArray() {
  // 将arguments转换为真正的数组
  return Array.prototype.slice.apply(arguments);
}

const result = convertToArray(1, 2, 3, 4);
console.log(result); // [1, 2, 3, 4]
console.log(Array.isArray(result)); // true
```

## bind方法：永久绑定的魔法

`bind`是三个方法中最特别的一个。它不会立即执行函数，而是返回一个新函数，这个新函数的`this`被永久绑定到你指定的对象。

### 基本语法

```javascript
function.bind(thisArg, arg1, arg2, ...)
```

### 基础用法

```javascript
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const person = { name: '赵六' };

// bind返回一个新函数，this永久绑定到person
const boundGreet = greet.bind(person);
boundGreet('你好', '!'); // 你好, 赵六!

// 即使赋值给其他变量，this绑定也不会丢失
const anotherGreet = boundGreet;
anotherGreet('早上好', '.'); // 早上好, 赵六.
```

### 偏函数应用

bind可以预设部分参数，创建偏函数：

```javascript
function multiply(a, b, c) {
  return a * b * c;
}

// 预设第一个参数为2
const double = multiply.bind(null, 2);
console.log(double(3, 4)); // 2 * 3 * 4 = 24

// 预设前两个参数
const multiplyBy6 = multiply.bind(null, 2, 3);
console.log(multiplyBy6(4)); // 2 * 3 * 4 = 24
```

### 实际应用场景

#### 1. 解决事件处理的this问题

还记得开头TodoList的例子吗？用`bind`可以完美解决：

```javascript
class TodoList {
  constructor() {
    this.todos = [];
  }

  addTodo(text) {
    this.todos.push({ text, completed: false });
    console.log(`添加了任务：${text}，当前共${this.todos.length}个任务`);
  }

  bindEvents() {
    // 使用bind确保this指向TodoList实例
    const button = document.getElementById('add-btn');
    button.addEventListener('click', this.handleAddClick.bind(this));
  }

  handleAddClick() {
    const input = document.getElementById('todo-input');
    this.addTodo(input.value); // this正确指向TodoList实例
    input.value = '';
  }
}
```

#### 2. 定时器

```javascript
class Timer {
  constructor() {
    this.seconds = 0;
  }
  
  start() {
    // 使用bind确保回调函数中的this指向Timer实例
    setInterval(this.tick.bind(this), 1000);
  }
  
  tick() {
    this.seconds++;
    console.log(`已运行${this.seconds}秒`);
  }
}

const timer = new Timer();
timer.start();
```

#### 3. 函数柯里化

```javascript
function add(a, b, c) {
  return a + b + c;
}

// 使用bind实现柯里化
const add5 = add.bind(null, 5);
const add5And3 = add5.bind(null, 3);

console.log(add5And3(2)); // 5 + 3 + 2 = 10
```

## 三者对比：什么时候用哪个？

| 方法 | 执行时机 | 参数传递 | 返回值 | 最适合的场景 |
|------|----------|----------|--------|----------|
| call | 立即执行 | 逐个传递 | 函数执行结果 | 借用方法、类型检测 |
| apply | 立即执行 | 数组传递 | 函数执行结果 | 数组操作、参数展开 |
| bind | 返回新函数 | 逐个传递 | 绑定后的新函数 | 事件处理、回调函数 |

### 快速选择指南

```javascript
// 场景1：立即借用方法，参数不多
user.showProfile.call(anotherUser);

// 场景2：立即执行，参数在数组里
Math.max.apply(null, numbers);

// 场景3：需要保存函数供以后调用
button.addEventListener('click', this.handleClick.bind(this));

// 场景4：创建预设参数的函数
const add5 = add.bind(null, 5);
```

## 手动实现

### 实现call

```javascript
Function.prototype.myCall = function(context, ...args) {
  // 如果context为null或undefined，则指向全局对象
  context = context || globalThis;
  
  // 创建唯一的属性名，避免覆盖原有属性
  const fnSymbol = Symbol('fn');
  
  // 将函数作为context的方法
  context[fnSymbol] = this;
  
  // 执行函数并获取结果
  const result = context[fnSymbol](...args);
  
  // 删除临时属性
  delete context[fnSymbol];
  
  return result;
};

// 测试
function greet(greeting) {
  console.log(`${greeting}, ${this.name}`);
}

const person = { name: '张三' };
greet.myCall(person, '你好'); // 你好, 张三
```

### 实现apply

```javascript
Function.prototype.myApply = function(context, args = []) {
  context = context || globalThis;
  const fnSymbol = Symbol('fn');
  context[fnSymbol] = this;
  const result = context[fnSymbol](...args);
  delete context[fnSymbol];
  return result;
};
```

### 实现bind

```javascript
Function.prototype.myBind = function(context, ...args1) {
  const fn = this;
  
  return function(...args2) {
    // 合并预设参数和调用时参数
    return fn.apply(context, args1.concat(args2));
  };
};

// 测试
function add(a, b, c) {
  return a + b + c;
}

const add5 = add.myBind(null, 5);
console.log(add5(3, 2)); // 10
```

## 常见陷阱

### 1. 箭头函数的this

```javascript
const obj = {
  name: '张三',
  regularFunction() {
    console.log(this.name); // 张三
  },
  arrowFunction: () => {
    console.log(this.name); // undefined（箭头函数的this不能被改变）
  }
};

const person = { name: '李四' };

obj.regularFunction.call(person); // 李四
obj.arrowFunction.call(person); // undefined
```

### 2. bind的多次调用

```javascript
function test() {
  console.log(this.name);
}

const obj1 = { name: '第一次' };
const obj2 = { name: '第二次' };

const bound1 = test.bind(obj1);
const bound2 = bound1.bind(obj2); // 无效，this仍然是obj1

bound2(); // 第一次
```

### 3. 严格模式的影响

```javascript
'use strict';

function test() {
  console.log(this);
}

test.call(null); // null（严格模式下）
test.call(undefined); // undefined（严格模式下）

// 非严格模式下会转换为全局对象
```

## 总结

现在你应该明白了，`call`、`apply`和`bind`并不是什么高深的魔法，它们就是解决JavaScript中`this`绑定问题的实用工具：

- **call**：想立即借用别人的方法？用call
- **apply**：参数在数组里？用apply
- **bind**：需要保存函数供以后用？用bind

掌握了这三个方法，你就能轻松应对各种`this`绑定的场景，让代码更加灵活和可控。它们的核心都是一个目的：让你能够精确控制函数执行时的`this`指向。
