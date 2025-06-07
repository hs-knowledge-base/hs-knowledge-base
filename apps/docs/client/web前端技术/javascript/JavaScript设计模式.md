# JavaScript设计模式

设计模式是解决软件设计中常见问题的可复用方案。在JavaScript中，由于其灵活的特性，设计模式的实现往往更加简洁和多样化。本文将介绍JavaScript中常见的设计模式及其实际应用场景。

## 创建型模式

创建型模式关注对象的创建机制，试图以适合当前情况的方式创建对象。

### 工厂模式

工厂模式提供一个创建对象的接口，由子类决定实例化哪个类。

```javascript
// 简单工厂
function createUser(role) {
  const user = {};
  
  if (role === 'admin') {
    user.permissions = ['read', 'write', 'delete'];
    user.accessLevel = 'high';
  } else if (role === 'editor') {
    user.permissions = ['read', 'write'];
    user.accessLevel = 'medium';
  } else {
    user.permissions = ['read'];
    user.accessLevel = 'low';
  }
  
  return user;
}

const adminUser = createUser('admin');
const editorUser = createUser('editor');
const regularUser = createUser('regular');

// 工厂方法
class UserFactory {
  static createAdmin(name) {
    return {
      name,
      permissions: ['read', 'write', 'delete'],
      accessLevel: 'high'
    };
  }
  
  static createEditor(name) {
    return {
      name,
      permissions: ['read', 'write'],
      accessLevel: 'medium'
    };
  }
  
  static createRegular(name) {
    return {
      name,
      permissions: ['read'],
      accessLevel: 'low'
    };
  }
}

const admin = UserFactory.createAdmin('张三');
const editor = UserFactory.createEditor('李四');
const user = UserFactory.createRegular('王五');
```

**适用场景**：

- 当对象的创建逻辑比较复杂时
- 当需要根据不同条件创建不同但相关的对象时
- 当想要将对象的创建与使用分离时

### 单例模式

单例模式确保一个类只有一个实例，并提供全局访问点。

```javascript
// ES5实现
const Singleton = (function() {
  let instance;
  
  function createInstance() {
    // 私有属性和方法
    const privateVariable = 'I am private';
    
    function privateMethod() {
      console.log('This is private');
    }
    
    return {
      // 公有属性和方法
      publicProperty: 'I am public',
      
      publicMethod: function() {
        console.log('This is public');
        privateMethod();
      }
    };
  }
  
  return {
    getInstance: function() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

const instance1 = Singleton.getInstance();
const instance2 = Singleton.getInstance();
console.log(instance1 === instance2); // true

// ES6实现
class SingletonClass {
  constructor() {
    if (SingletonClass.instance) {
      return SingletonClass.instance;
    }
    
    SingletonClass.instance = this;
    this.data = [];
    this.count = 0;
  }
  
  increment() {
    this.count++;
  }
  
  addData(item) {
    this.data.push(item);
  }
}

const singleton1 = new SingletonClass();
const singleton2 = new SingletonClass();
console.log(singleton1 === singleton2); // true
```

**适用场景**：

- 当一个类只需要一个实例，并且该实例需要被多个地方使用时
- 数据库连接、日志记录器、配置管理器、应用状态管理

### 构建者模式

构建者模式将复杂对象的构建与其表示分离，使同样的构建过程可以创建不同的表示。

```javascript
class UserBuilder {
  constructor(name) {
    this.user = {
      name: name
    };
  }
  
  setAge(age) {
    this.user.age = age;
    return this;
  }
  
  setEmail(email) {
    this.user.email = email;
    return this;
  }
  
  setAddress(address) {
    this.user.address = address;
    return this;
  }
  
  setPhone(phone) {
    this.user.phone = phone;
    return this;
  }
  
  build() {
    return this.user;
  }
}

// 使用构建者模式
const user = new UserBuilder('张三')
  .setAge(30)
  .setEmail('zhangsan@example.com')
  .setAddress('北京市朝阳区')
  .build();

console.log(user);
// { name: '张三', age: 30, email: 'zhangsan@example.com', address: '北京市朝阳区' }
```

**适用场景**：

- 当对象有许多可选配置参数时
- 当需要创建的对象非常复杂时
- 当需要一步一步构建一个对象，并且可以控制构建过程时

## 结构型模式

结构型模式关注类和对象的组合，用于处理对象间的关系。

### 适配器模式

适配器模式允许使用一个已存在的类，而其接口不符合当前需求。

```javascript
// 假设有一个旧API
class OldAPI {
  getUsers() {
    return [
      { name: 'user1', years: 30 },
      { name: 'user2', years: 25 }
    ];
  }
}

// 新API需要的格式
// { users: [{ name: 'user1', age: 30 }, { name: 'user2', age: 25 }] }

// 创建适配器
class APIAdapter {
  constructor(oldAPI) {
    this.oldAPI = oldAPI;
  }
  
  getUsers() {
    const oldUsers = this.oldAPI.getUsers();
    const adaptedUsers = oldUsers.map(user => ({
      name: user.name,
      age: user.years
    }));
    
    return { users: adaptedUsers };
  }
}

// 使用适配器
const oldAPI = new OldAPI();
const adapter = new APIAdapter(oldAPI);
const userData = adapter.getUsers();

console.log(userData);
// { users: [{ name: 'user1', age: 30 }, { name: 'user2', age: 25 }] }
```

**适用场景**：

- 当需要使用一个已存在的类，但其接口与需求不符时
- 当需要创建一个可复用的类，该类与不相关或不可预见的类协同工作
- 当需要使用多个子类，但不现实通过子类化来实现时

### 装饰器模式

装饰器模式动态地向对象添加新的行为，不修改其原始结构。

```javascript
// 基础组件
class Coffee {
  cost() {
    return 5;
  }
  
  description() {
    return '普通咖啡';
  }
}

// 装饰器
class MilkDecorator {
  constructor(coffee) {
    this.coffee = coffee;
  }
  
  cost() {
    return this.coffee.cost() + 2;
  }
  
  description() {
    return `${this.coffee.description()}, 加奶`;
  }
}

class SugarDecorator {
  constructor(coffee) {
    this.coffee = coffee;
  }
  
  cost() {
    return this.coffee.cost() + 1;
  }
  
  description() {
    return `${this.coffee.description()}, 加糖`;
  }
}

// 使用装饰器
let coffee = new Coffee();
console.log(coffee.description(), coffee.cost()); // 普通咖啡 5

coffee = new MilkDecorator(coffee);
console.log(coffee.description(), coffee.cost()); // 普通咖啡, 加奶 7

coffee = new SugarDecorator(coffee);
console.log(coffee.description(), coffee.cost()); // 普通咖啡, 加奶, 加糖 8

// ES7装饰器语法
function readonly(target, key, descriptor) {
  descriptor.writable = false;
  return descriptor;
}

class User {
  constructor(name) {
    this.name = name;
  }
  
  @readonly
  sayHello() {
    return `Hello, I'm ${this.name}`;
  }
}
```

**适用场景**：

- 当需要动态地给对象添加功能，且不希望修改其源码时
- 当功能组合可能产生大量子类，导致子类数量爆炸时
- 当想要通过组合而非继承来扩展功能时

### 代理模式

代理模式为另一个对象提供替代或占位符，以控制对它的访问。

```javascript
// 图片加载的例子
class RealImage {
  constructor(filename) {
    this.filename = filename;
    this.loadFromDisk();
  }
  
  loadFromDisk() {
    console.log(`Loading ${this.filename} from disk...`);
    // 模拟加载耗时
    const startTime = Date.now();
    while (Date.now() - startTime < 1000) {} // 等待1秒
  }
  
  display() {
    console.log(`Displaying ${this.filename}`);
  }
}

class ProxyImage {
  constructor(filename) {
    this.filename = filename;
    this.realImage = null;
  }
  
  display() {
    if (!this.realImage) {
      this.realImage = new RealImage(this.filename);
    }
    this.realImage.display();
  }
}

// 使用代理
const image = new ProxyImage('large-image.jpg');
// 图片未加载

console.log('执行其他操作...');
// 执行其他操作...

image.display();
// 图片首次显示时才加载
// Loading large-image.jpg from disk...
// Displaying large-image.jpg

image.display();
// 第二次显示时不需要重新加载
// Displaying large-image.jpg
```

**适用场景**：

- 延迟加载（懒加载）
- 访问控制
- 日志记录
- 缓存结果

## 行为型模式

行为型模式关注对象之间的通信和责任分配。

### 观察者模式

观察者模式定义了对象间的一对多依赖关系，当一个对象状态改变，其所有依赖者都会收到通知并自动更新。

```javascript
// 简单实现
class Subject {
  constructor() {
    this.observers = [];
  }
  
  addObserver(observer) {
    this.observers.push(observer);
  }
  
  removeObserver(observer) {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }
  
  notify(data) {
    this.observers.forEach(observer => observer.update(data));
  }
}

class Observer {
  constructor(name) {
    this.name = name;
  }
  
  update(data) {
    console.log(`${this.name} received: ${data}`);
  }
}

// 使用观察者模式
const subject = new Subject();

const observer1 = new Observer('Observer 1');
const observer2 = new Observer('Observer 2');

subject.addObserver(observer1);
subject.addObserver(observer2);

subject.notify('Hello World!');
// Observer 1 received: Hello World!
// Observer 2 received: Hello World!

subject.removeObserver(observer1);
subject.notify('Hello Again!');
// Observer 2 received: Hello Again!
```

**适用场景**：

- 当一个对象的状态改变需要通知其他多个对象时
- 当对象间存在一对多关系时
- 事件处理系统
- 用户界面更新

### 策略模式

策略模式定义一系列算法，将每一个算法封装起来，使它们可以相互替换。

```javascript
// 不使用策略模式
function calculatePrice(type, price) {
  if (type === 'regular') {
    return price;
  } else if (type === 'discount') {
    return price * 0.9;
  } else if (type === 'sale') {
    return price * 0.75;
  } else if (type === 'blackFriday') {
    return price * 0.5;
  }
  return price;
}

// 使用策略模式
const pricingStrategies = {
  regular: price => price,
  discount: price => price * 0.9,
  sale: price => price * 0.75,
  blackFriday: price => price * 0.5
};

function calculatePrice(strategy, price) {
  return pricingStrategies[strategy](price);
}

// 使用策略
console.log(calculatePrice('regular', 100));    // 100
console.log(calculatePrice('discount', 100));   // 90
console.log(calculatePrice('sale', 100));       // 75
console.log(calculatePrice('blackFriday', 100)); // 50

// 添加新策略
pricingStrategies.newYear = price => price * 0.8;
console.log(calculatePrice('newYear', 100));    // 80
```

**适用场景**：

- 当需要在运行时选择算法时
- 当有多个条件分支需要选择不同行为时
- 当要避免大量条件语句时
- 当有一系列相关但不同的算法时

### 命令模式

命令模式将请求封装为对象，允许参数化客户端，支持撤销操作。

```javascript
// 接收者
class Light {
  turnOn() {
    console.log('Light is on');
  }
  
  turnOff() {
    console.log('Light is off');
  }
}

// 命令接口
class Command {
  execute() {
    throw new Error('execute method must be implemented');
  }
  
  undo() {
    throw new Error('undo method must be implemented');
  }
}

// 具体命令
class LightOnCommand extends Command {
  constructor(light) {
    super();
    this.light = light;
  }
  
  execute() {
    this.light.turnOn();
  }
  
  undo() {
    this.light.turnOff();
  }
}

class LightOffCommand extends Command {
  constructor(light) {
    super();
    this.light = light;
  }
  
  execute() {
    this.light.turnOff();
  }
  
  undo() {
    this.light.turnOn();
  }
}

// 调用者
class RemoteControl {
  constructor() {
    this.commands = [];
    this.history = [];
  }
  
  addCommand(command) {
    this.commands.push(command);
  }
  
  executeCommand(index) {
    if (index >= 0 && index < this.commands.length) {
      this.commands[index].execute();
      this.history.push(index);
    }
  }
  
  undoLastCommand() {
    if (this.history.length > 0) {
      const index = this.history.pop();
      this.commands[index].undo();
    }
  }
}

// 使用命令模式
const light = new Light();
const lightOn = new LightOnCommand(light);
const lightOff = new LightOffCommand(light);

const remote = new RemoteControl();
remote.addCommand(lightOn);   // 索引0
remote.addCommand(lightOff);  // 索引1

remote.executeCommand(0);     // Light is on
remote.executeCommand(1);     // Light is off
remote.undoLastCommand();     // Light is on
```

**适用场景**：

- 当需要参数化对象的操作时
- 当需要支持撤销/重做操作时
- 当需要将操作排队或延迟执行时
- 当需要支持事务操作时

## 函数式编程范式

函数式编程是一种编程范式，它将计算视为函数的求值，避免使用共享状态和可变数据。

### 纯函数

纯函数是指对于相同的输入总是返回相同的输出，且没有副作用的函数。

```javascript
// 非纯函数
let counter = 0;
function incrementCounter() {
  counter++;
  return counter;
}

// 纯函数
function add(a, b) {
  return a + b;
}

function calculateTax(amount, taxRate) {
  return amount * taxRate;
}
```

### 函数组合

函数组合是将多个函数组合成一个函数的技术。

```javascript
// 简单函数组合
function compose(f, g) {
  return function(x) {
    return f(g(x));
  };
}

const add5 = x => x + 5;
const multiply2 = x => x * 2;

const multiply2ThenAdd5 = compose(add5, multiply2);
console.log(multiply2ThenAdd5(3)); // 3 * 2 + 5 = 11

// 多函数组合
function composeMultiple(...fns) {
  return fns.reduce((f, g) => (...args) => f(g(...args)));
}

const add1 = x => x + 1;
const multiply3 = x => x * 3;
const square = x => x * x;

const calculate = composeMultiple(square, multiply3, add1);
console.log(calculate(2)); // ((2 + 1) * 3)^2 = 9^2 = 81
```

### 柯里化

柯里化是将接受多个参数的函数转换成一系列使用一个参数的函数的技术。

```javascript
// 手动柯里化
function add(a) {
  return function(b) {
    return a + b;
  };
}

const add5 = add(5);
console.log(add5(3)); // 8

// 通用柯里化函数
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...args2) {
        return curried.apply(this, args.concat(args2));
      };
    }
  };
}

function multiply(a, b, c) {
  return a * b * c;
}

const curriedMultiply = curry(multiply);
console.log(curriedMultiply(2)(3)(4)); // 24
console.log(curriedMultiply(2, 3)(4)); // 24
console.log(curriedMultiply(2)(3, 4)); // 24
console.log(curriedMultiply(2, 3, 4)); // 24
```

### 不可变性

不可变性是指创建后不可修改的数据。

```javascript
// 不使用不可变性
const user = { name: '张三', age: 30 };
user.age = 31; // 修改原对象

// 使用不可变性
const user = { name: '张三', age: 30 };
const updatedUser = { ...user, age: 31 }; // 创建新对象

// 深度不可变
function deepFreeze(obj) {
  Object.keys(obj).forEach(prop => {
    if (typeof obj[prop] === 'object' && obj[prop] !== null) {
      deepFreeze(obj[prop]);
    }
  });
  return Object.freeze(obj);
}

const frozenUser = deepFreeze({ 
  name: '张三', 
  address: { city: '北京' } 
});

// 这将失败，不会修改对象
// frozenUser.address.city = '上海';
```

## 响应式编程

响应式编程是一种以异步数据流为中心的编程范式。

### 基本概念

```javascript
// 使用RxJS的例子
import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

// 创建一个Observable
const inputElement = document.querySelector('input');
const inputObservable = fromEvent(inputElement, 'input').pipe(
  debounceTime(300),
  map(event => event.target.value)
);

// 订阅Observable
const subscription = inputObservable.subscribe(value => {
  console.log('Input value:', value);
});

// 取消订阅
setTimeout(() => {
  subscription.unsubscribe();
}, 10000);
```

### 数据流转换

```javascript
import { from } from 'rxjs';
import { map, filter, reduce } from 'rxjs/operators';

// 数据源
const numbers = [1, 2, 3, 4, 5];

// 创建Observable并应用操作符
const observable = from(numbers).pipe(
  filter(n => n % 2 === 0),    // 只选择偶数
  map(n => n * n),             // 计算平方
  reduce((acc, val) => acc + val, 0) // 求和
);

// 订阅并获取结果
observable.subscribe(result => {
  console.log('Result:', result); // Result: 20 (2^2 + 4^2 = 4 + 16 = 20)
});
```

### 自定义Observable

```javascript
import { Observable } from 'rxjs';

// 创建自定义Observable
const customObservable = new Observable(subscriber => {
  // 发出值
  subscriber.next(1);
  subscriber.next(2);
  
  // 异步发出值
  setTimeout(() => {
    subscriber.next(3);
    subscriber.complete(); // 完成
  }, 1000);
  
  // 清理函数
  return () => {
    console.log('清理资源');
  };
});

// 订阅
const subscription = customObservable.subscribe({
  next: value => console.log('Next:', value),
  error: err => console.error('Error:', err),
  complete: () => console.log('Completed')
});

// 取消订阅
setTimeout(() => {
  subscription.unsubscribe();
}, 2000);
```

## MVC/MVVM架构模式

### MVC (Model-View-Controller)

```javascript
// Model
class UserModel {
  constructor() {
    this.users = [];
  }
  
  addUser(user) {
    this.users.push(user);
  }
  
  getUsers() {
    return [...this.users];
  }
}

// View
class UserView {
  constructor() {
    this.userList = document.getElementById('user-list');
    this.nameInput = document.getElementById('user-name');
    this.addButton = document.getElementById('add-user');
  }
  
  render(users) {
    this.userList.innerHTML = '';
    users.forEach(user => {
      const li = document.createElement('li');
      li.textContent = user.name;
      this.userList.appendChild(li);
    });
  }
  
  bindAddUser(handler) {
    this.addButton.addEventListener('click', () => {
      if (this.nameInput.value.trim()) {
        handler({ name: this.nameInput.value });
        this.nameInput.value = '';
      }
    });
  }
}

// Controller
class UserController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    
    // 绑定视图事件到控制器方法
    this.view.bindAddUser(this.addUser.bind(this));
    
    // 初始渲染
    this.updateView();
  }
  
  addUser(user) {
    this.model.addUser(user);
    this.updateView();
  }
  
  updateView() {
    this.view.render(this.model.getUsers());
  }
}

// 使用MVC
const app = new UserController(new UserModel(), new UserView());
```

### MVVM (Model-View-ViewModel)

```javascript
// 使用Vue.js实现MVVM
const UserViewModel = {
  data() {
    return {
      users: [],
      newUserName: ''
    };
  },
  methods: {
    addUser() {
      if (this.newUserName.trim()) {
        this.users.push({ name: this.newUserName });
        this.newUserName = '';
      }
    }
  }
};

Vue.createApp(UserViewModel).mount('#app');

// HTML部分
/*
<div id="app">
  <input v-model="newUserName" placeholder="Enter user name">
  <button @click="addUser">Add User</button>
  
  <ul>
    <li v-for="user in users" :key="user.name">{{ user.name }}</li>
  </ul>
</div>
*/
```

## 总结

JavaScript设计模式是解决前端开发中常见问题的强大工具。通过合理应用这些模式，可以:

1. **提高代码质量**: 使代码更加模块化、可维护和可扩展
2. **增强可读性**: 使用通用的模式让其他开发者更容易理解代码
3. **提高开发效率**: 使用成熟的解决方案处理常见问题
4. **防止常见错误**: 遵循最佳实践，避免常见的设计陷阱

掌握这些设计模式和编程范式，可以帮助开发者写出更加健壮、灵活和易于维护的JavaScript代码。 