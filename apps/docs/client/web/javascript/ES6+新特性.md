# ES6+新特性

ECMAScript 6（也称为ES2015）及后续版本为JavaScript引入了大量新特性，极大地增强了语言的表达能力和开发效率。本文将详细介绍ES6+中的关键特性及其实际应用。

## 解构赋值深入应用

解构赋值允许从数组或对象中提取值并赋给变量，是ES6中最实用的特性之一。

### 数组解构

```javascript
// 基本数组解构
const [a, b] = [1, 2];
console.log(a); // 1
console.log(b); // 2

// 跳过元素
const [a, , c] = [1, 2, 3];
console.log(a, c); // 1 3

// 剩余模式
const [first, ...rest] = [1, 2, 3, 4, 5];
console.log(first); // 1
console.log(rest);  // [2, 3, 4, 5]

// 默认值
const [a = 5, b = 7] = [1];
console.log(a); // 1 (被赋值的值)
console.log(b); // 7 (默认值)

// 交换变量
let a = 1, b = 2;
[a, b] = [b, a];
console.log(a, b); // 2 1
```

### 对象解构

```javascript
// 基本对象解构
const { name, age } = { name: '张三', age: 30 };
console.log(name); // '张三'
console.log(age);  // 30

// 赋予新变量名
const { name: userName, age: userAge } = { name: '张三', age: 30 };
console.log(userName); // '张三'
console.log(userAge);  // 30

// 嵌套解构
const user = {
  name: '张三',
  age: 30,
  address: {
    city: '北京',
    street: '朝阳区'
  }
};

const { name, address: { city } } = user;
console.log(name); // '张三'
console.log(city); // '北京'

// 默认值与新变量名结合
const { name = '匿名', role: userRole = '访客' } = { role: '管理员' };
console.log(name);     // '匿名' (默认值)
console.log(userRole); // '管理员' (被赋值的值)
```

### 函数参数解构

```javascript
// 对象参数解构
function printUser({ name, age, role = '用户' }) {
  console.log(`${name}, ${age}岁, 角色: ${role}`);
}

printUser({ name: '张三', age: 30 });
// 输出: "张三, 30岁, 角色: 用户"

// 数组参数解构
function getFirstAndLast([first, ...rest]) {
  return { first, last: rest.pop() };
}

console.log(getFirstAndLast([1, 2, 3, 4, 5])); 
// { first: 1, last: 5 }
```

### 实际应用场景

```javascript
// 1. API响应处理
fetch('/api/user')
  .then(response => response.json())
  .then(({ id, name, permissions }) => {
    // 只提取需要的字段
    console.log(id, name, permissions);
  });

// 2. React组件props
function UserProfile({ user, loading, error }) {
  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  
  const { name, avatar, bio } = user;
  return (
    <div>
      <img src={avatar} alt={name} />
      <h2>{name}</h2>
      <p>{bio}</p>
    </div>
  );
}

// 3. 导入模块
import { useState, useEffect, useRef } from 'react';
```

## 生成器和迭代器

生成器和迭代器为JavaScript提供了全新的控制流方式，特别适合处理序列和异步操作。

### 迭代器基础

迭代器是一个特殊对象，它提供了一种按顺序访问集合元素的方法。

```javascript
// 自定义迭代器
function createIterator(array) {
  let index = 0;
  
  return {
    next() {
      if (index < array.length) {
        return { value: array[index++], done: false };
      } else {
        return { done: true };
      }
    }
  };
}

const iterator = createIterator([1, 2, 3]);
console.log(iterator.next()); // { value: 1, done: false }
console.log(iterator.next()); // { value: 2, done: false }
console.log(iterator.next()); // { value: 3, done: false }
console.log(iterator.next()); // { done: true }
```

### 生成器函数

生成器是一种特殊的函数，可以暂停执行并稍后恢复。

```javascript
// 基本生成器
function* simpleGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

const generator = simpleGenerator();
console.log(generator.next()); // { value: 1, done: false }
console.log(generator.next()); // { value: 2, done: false }
console.log(generator.next()); // { value: 3, done: false }
console.log(generator.next()); // { value: undefined, done: true }

// 使用for...of循环
for (const value of simpleGenerator()) {
  console.log(value); // 依次输出: 1, 2, 3
}
```

### 生成器高级用法

```javascript
// 接收参数的生成器
function* twoWayGenerator() {
  const a = yield 1;
  const b = yield a + 2;
  yield b + 3;
}

const gen = twoWayGenerator();
console.log(gen.next());      // { value: 1, done: false }
console.log(gen.next(10));    // { value: 12, done: false }
console.log(gen.next(20));    // { value: 23, done: false }
console.log(gen.next());      // { value: undefined, done: true }

// 无限序列生成器
function* fibonacci() {
  let [prev, curr] = [0, 1];
  while (true) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
  }
}

const fib = fibonacci();
for (let i = 0; i < 10; i++) {
  console.log(fib.next().value); // 输出前10个斐波那契数
}

// 生成器委托
function* gen1() {
  yield 1;
  yield 2;
}

function* gen2() {
  yield* gen1();
  yield 3;
}

for (const value of gen2()) {
  console.log(value); // 依次输出: 1, 2, 3
}
```

### 异步生成器

```javascript
// 使用生成器处理异步操作
function fetchData(url) {
  return fetch(url).then(response => response.json());
}

function* fetchMultipleData() {
  try {
    const users = yield fetchData('/api/users');
    const posts = yield fetchData('/api/posts');
    const comments = yield fetchData(`/api/comments?postId=${posts[0].id}`);
    
    return { users, posts, comments };
  } catch (error) {
    console.error('Error:', error);
  }
}

// 执行生成器的函数
function runGenerator(generator) {
  const gen = generator();
  
  function handle(result) {
    if (result.done) return Promise.resolve(result.value);
    
    return Promise.resolve(result.value)
      .then(res => handle(gen.next(res)))
      .catch(err => handle(gen.throw(err)));
  }
  
  return handle(gen.next());
}

runGenerator(fetchMultipleData)
  .then(data => console.log('All data:', data));
```

## Proxy和Reflect

Proxy允许拦截和自定义对象的基本操作，Reflect提供了执行这些操作的标准方法。

### Proxy基础

```javascript
// 基本的Proxy用法
const target = {
  name: '张三',
  age: 30
};

const handler = {
  get(target, prop, receiver) {
    console.log(`访问属性: ${prop}`);
    return target[prop];
  },
  set(target, prop, value, receiver) {
    console.log(`设置属性: ${prop} = ${value}`);
    target[prop] = value;
    return true; // 设置成功
  }
};

const proxy = new Proxy(target, handler);

console.log(proxy.name); // 访问属性: name 张三
proxy.age = 31;         // 设置属性: age = 31
```

### 常用Proxy拦截器

```javascript
const handler = {
  // 属性访问拦截
  get(target, prop, receiver) {
    return Reflect.get(target, prop, receiver);
  },
  
  // 属性设置拦截
  set(target, prop, value, receiver) {
    return Reflect.set(target, prop, value, receiver);
  },
  
  // 属性删除拦截
  deleteProperty(target, prop) {
    console.log(`删除属性: ${prop}`);
    return Reflect.deleteProperty(target, prop);
  },
  
  // 函数调用拦截
  apply(target, thisArg, args) {
    console.log(`函数调用，参数: ${args}`);
    return Reflect.apply(target, thisArg, args);
  },
  
  // 构造函数调用拦截
  construct(target, args, newTarget) {
    console.log(`构造函数调用，参数: ${args}`);
    return Reflect.construct(target, args, newTarget);
  },
  
  // 属性存在性检查拦截
  has(target, prop) {
    console.log(`检查属性: ${prop}`);
    return Reflect.has(target, prop);
  }
};
```

### 实际应用场景

```javascript
// 1. 数据验证
function createValidator(target, validations) {
  return new Proxy(target, {
    set(target, prop, value) {
      if (validations[prop]) {
        const validation = validations[prop];
        if (!validation.validator(value)) {
          throw new Error(validation.message);
        }
      }
      target[prop] = value;
      return true;
    }
  });
}

const user = createValidator({}, {
  age: {
    validator: value => Number.isInteger(value) && value >= 18,
    message: '年龄必须是大于等于18的整数'
  },
  name: {
    validator: value => typeof value === 'string' && value.length >= 2,
    message: '名字必须是至少2个字符的字符串'
  }
});

user.name = '李四'; // 有效
// user.age = 17;  // 抛出错误: 年龄必须是大于等于18的整数

// 2. 实现响应式系统 (类似Vue原理)
function reactive(obj) {
  const deps = new Map();
  
  function track(target, prop) {
    const effect = window.currentEffect;
    if (effect) {
      let depsForProp = deps.get(prop);
      if (!depsForProp) {
        depsForProp = new Set();
        deps.set(prop, depsForProp);
      }
      depsForProp.add(effect);
    }
  }
  
  function trigger(target, prop) {
    const depsForProp = deps.get(prop);
    if (depsForProp) {
      depsForProp.forEach(effect => effect());
    }
  }
  
  return new Proxy(obj, {
    get(target, prop, receiver) {
      track(target, prop);
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      const result = Reflect.set(target, prop, value, receiver);
      trigger(target, prop);
      return result;
    }
  });
}

// 3. 私有属性模拟
function createPrivateStore() {
  const privateData = new WeakMap();
  
  return {
    getPrivate(target, prop) {
      const data = privateData.get(target) || {};
      return data[prop];
    },
    setPrivate(target, prop, value) {
      const data = privateData.get(target) || {};
      data[prop] = value;
      privateData.set(target, data);
    }
  };
}

const privateStore = createPrivateStore();
const obj = {};

privateStore.setPrivate(obj, 'secret', '密码123');
console.log(privateStore.getPrivate(obj, 'secret')); // '密码123'
console.log(obj.secret); // undefined (不能直接访问)
```

### Reflect API

Reflect对象提供了与Proxy拦截器对应的方法，使得开发者可以以函数式的方式调用对象的操作。

```javascript
// 基本用法
const obj = { name: '张三' };

// 传统方式
console.log('name' in obj);         // true
console.log(Object.keys(obj));      // ['name']
console.log(delete obj.name);       // true

// Reflect方式
console.log(Reflect.has(obj, 'name'));      // true
console.log(Reflect.ownKeys(obj));          // ['name']
console.log(Reflect.deleteProperty(obj, 'name')); // true

// 构造函数调用
function Person(name) {
  this.name = name;
}

// 传统方式
const p1 = new Person('李四');

// Reflect方式
const p2 = Reflect.construct(Person, ['李四']);
```

## 新的数据结构

ES6引入了新的数据结构，用于解决JavaScript开发中的特定问题。

### Map

Map是键值对集合，与对象不同，它的键可以是任何类型。

```javascript
// 创建Map
const userMap = new Map();

// 添加键值对
userMap.set('name', '张三');
userMap.set(123, '数字ID');
userMap.set(true, '布尔值键');

const obj = { id: 1 };
userMap.set(obj, '对象作为键');

// 获取值
console.log(userMap.get('name')); // '张三'
console.log(userMap.get(123));    // '数字ID'
console.log(userMap.get(obj));    // '对象作为键'

// 检查键是否存在
console.log(userMap.has('name')); // true
console.log(userMap.has('age'));  // false

// 删除键值对
userMap.delete('name');
console.log(userMap.has('name')); // false

// 获取大小
console.log(userMap.size); // 3

// 清空Map
userMap.clear();
console.log(userMap.size); // 0

// 初始化Map
const userMap2 = new Map([
  ['name', '李四'],
  ['age', 30],
  ['isAdmin', true]
]);

// 迭代Map
for (const [key, value] of userMap2) {
  console.log(`${key}: ${value}`);
}

// 转换为数组
const keysArray = [...userMap2.keys()];
const valuesArray = [...userMap2.values()];
const entriesArray = [...userMap2.entries()];
```

### Set

Set是值的集合，其中每个值只能出现一次。

```javascript
// 创建Set
const uniqueNumbers = new Set();

// 添加值
uniqueNumbers.add(1);
uniqueNumbers.add(2);
uniqueNumbers.add(3);
uniqueNumbers.add(1); // 重复值会被忽略

// 检查值是否存在
console.log(uniqueNumbers.has(1)); // true
console.log(uniqueNumbers.has(4)); // false

// 删除值
uniqueNumbers.delete(2);
console.log(uniqueNumbers.has(2)); // false

// 获取大小
console.log(uniqueNumbers.size); // 2

// 清空Set
uniqueNumbers.clear();
console.log(uniqueNumbers.size); // 0

// 初始化Set
const uniqueNames = new Set(['张三', '李四', '王五', '张三']);
console.log(uniqueNames.size); // 3 (重复的'张三'被忽略)

// 迭代Set
for (const name of uniqueNames) {
  console.log(name);
}

// 数组去重
const numbers = [1, 2, 3, 4, 2, 3, 5];
const uniqueNumbersArray = [...new Set(numbers)];
console.log(uniqueNumbersArray); // [1, 2, 3, 4, 5]
```

### WeakMap和WeakSet

WeakMap和WeakSet是特殊版本的Map和Set，它们对键的引用是"弱引用"，不会阻止垃圾回收。

```javascript
// WeakMap
const cache = new WeakMap();

(function() {
  const obj = { data: 'sensitive information' };
  cache.set(obj, { lastAccessed: Date.now() });
  
  // 使用缓存
  console.log(cache.get(obj));
})(); // 函数执行完毕后，obj会被垃圾回收，cache中的项也会被自动清理

// WeakSet
const visitedObjects = new WeakSet();

function processObject(obj) {
  if (visitedObjects.has(obj)) {
    console.log('此对象已被处理');
    return;
  }
  
  // 处理对象
  console.log('处理对象:', obj);
  
  // 标记为已处理
  visitedObjects.add(obj);
}

const obj1 = { id: 1 };
processObject(obj1); // "处理对象: {id: 1}"
processObject(obj1); // "此对象已被处理"
```

### WeakMap/WeakSet vs Map/Set

主要区别：

1. **WeakMap/WeakSet只接受对象作为键/值**（不能是原始值）
2. **WeakMap/WeakSet中的键/值是弱引用**，不会阻止垃圾回收
3. **WeakMap/WeakSet不可迭代**，没有`size`属性和清空方法
4. **WeakMap只有`get`、`set`、`has`、`delete`方法**
5. **WeakSet只有`add`、`has`、`delete`方法**

适用场景：

- WeakMap: 存储DOM元素相关数据、缓存计算结果、关联元数据
- WeakSet: 标记对象状态、防止循环引用

## 其他重要ES6+特性

### 箭头函数

```javascript
// 基本语法
const add = (a, b) => a + b;

// 单个参数可以省略括号
const square = x => x * x;

// 返回对象需要用括号包裹
const createUser = (name, age) => ({ name, age });

// 箭头函数不绑定this
function Counter() {
  this.count = 0;
  
  // 箭头函数会捕获构造函数中的this
  this.increment = () => {
    this.count++;
  };
}

const counter = new Counter();
const increment = counter.increment;
increment(); // 在任何上下文中调用都能正确修改counter.count
console.log(counter.count); // 1
```

### 类语法

```javascript
class Person {
  // 构造函数
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  // 实例方法
  sayHello() {
    return `你好，我是${this.name}，今年${this.age}岁`;
  }
  
  // 静态方法
  static createAnonymous() {
    return new Person('匿名', 0);
  }
  
  // Getter
  get profile() {
    return `${this.name} (${this.age})`;
  }
  
  // Setter
  set profile(value) {
    [this.name, this.age] = value.split(' ');
    this.age = Number(this.age);
  }
}

// 继承
class Employee extends Person {
  constructor(name, age, position) {
    super(name, age); // 调用父类构造函数
    this.position = position;
  }
  
  sayHello() {
    return `${super.sayHello()}，我的职位是${this.position}`;
  }
}
```

### 模板字符串

```javascript
const name = '张三';
const greeting = `你好，${name}！`;

// 多行字符串
const html = `
<div>
  <h1>标题</h1>
  <p>段落内容</p>
</div>
`;

// 标签模板
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i] || '';
    return `${result}${str}<span class="highlight">${value}</span>`;
  }, '');
}

const keyword = '重要信息';
const text = highlight`这是一段包含${keyword}的文本。`;
// 结果: "这是一段包含<span class="highlight">重要信息</span>的文本。"
```

### 异步/等待

```javascript
// 基本用法
async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('获取用户数据失败:', error);
    throw error;
  }
}

// 并行执行多个请求
async function fetchAllData() {
  try {
    const [users, posts, comments] = await Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch('/api/posts').then(r => r.json()),
      fetch('/api/comments').then(r => r.json())
    ]);
    
    return { users, posts, comments };
  } catch (error) {
    console.error('获取数据失败:', error);
    throw error;
  }
}

// 顺序迭代异步操作
async function processItems(items) {
  const results = [];
  
  for (const item of items) {
    // 一个接一个处理
    const result = await processItem(item);
    results.push(result);
  }
  
  return results;
}

// 并行迭代异步操作
async function processItemsParallel(items) {
  // 所有任务同时开始
  const promises = items.map(item => processItem(item));
  // 等待所有任务完成
  return await Promise.all(promises);
}
```

## 总结

ES6+引入的新特性极大地提升了JavaScript的表达能力、开发效率和代码质量：

1. **解构赋值**让代码更简洁、更具可读性
2. **生成器和迭代器**提供了新的控制流机制，特别适合处理序列和异步操作
3. **Proxy和Reflect**实现了元编程，为对象操作提供了无限可能
4. **Map、Set、WeakMap、WeakSet**解决了特定的数据结构需求
5. **箭头函数、类语法、模板字符串**改进了日常编码体验
6. **异步/等待**简化了异步编程

这些特性相互配合，形成了现代JavaScript开发的基础，是每个JavaScript开发者都应该掌握的核心技能。 