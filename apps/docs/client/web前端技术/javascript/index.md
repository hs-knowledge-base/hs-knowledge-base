# JavaScript编程

## 简介

JavaScript是一种高级、解释型的编程语言，最初设计用于为网页添加交互功能，如今已发展成为全栈开发语言。作为Web的核心技术之一，JavaScript能够运行在浏览器、服务器（Node.js）和各种设备上，是现代前端开发的基础。

## 语言基础

### 语法与数据类型
- 基本语法与注释
- 原始类型（String, Number, Boolean, null, undefined, Symbol, BigInt）
- 引用类型（Object, Array, Function, Date, RegExp）
- 类型转换与检测
- 变量声明（var, let, const）

### 运算符与表达式
- 算术、赋值、比较运算符
- 逻辑运算符与短路求值
- 条件（三元）运算符
- 展开运算符与解构赋值
- 可选链与空值合并

### 控制流
- 条件语句（if-else, switch）
- 循环语句（for, while, do-while, for...in, for...of）
- 异常处理（try-catch-finally）
- 跳转语句（break, continue, return）

## 函数与作用域

### 函数基础
- 函数声明与表达式
- 参数与返回值
- 默认参数与剩余参数
- 箭头函数
- IIFE（立即调用函数表达式）

### 作用域与闭包
- 全局作用域与函数作用域
- 词法作用域与作用域链
- 块级作用域（let, const）
- 闭包原理与应用
- 模块化模式

### this与执行上下文
- this绑定规则
- call, apply, bind方法
- 箭头函数中的this
- 执行上下文与调用栈
- 词法环境与变量环境

## 对象与原型

### 对象基础
- 对象字面量与属性访问
- 属性描述符与Object方法
- 对象方法与计算属性
- 对象的复制与合并
- 对象解构与扩展

### 原型与继承
- 原型链机制
- 构造函数与new操作符
- 原型继承模式
- ES6 class语法糖
- instanceof与原型检测

### 内置对象
- Array方法与操作
- String操作与正则表达式
- Date与时间操作
- Map, Set, WeakMap, WeakSet
- JSON解析与序列化

## 异步编程

### 回调与事件
- 回调函数模式
- 事件监听与发布订阅
- 回调地狱问题
- 异步控制流库
- 浏览器事件循环

### Promise
- Promise基本用法
- Promise链与错误处理
- Promise.all, Promise.race
- Promise.allSettled, Promise.any
- 自定义Promise实现

### async/await
- async函数与await表达式
- 错误处理与try/catch
- 串行与并行执行
- 与Promise的配合
- 性能考量与最佳实践

## 现代JavaScript特性

### ES6+特性
- 变量声明（let, const）
- 模板字符串
- 箭头函数
- 解构赋值
- 默认参数与剩余参数
- 扩展运算符
- 类与模块
- 生成器与迭代器
- 代理与反射

### 模块化
- CommonJS规范
- ESM模块系统
- 动态导入
- 模块解析与打包
- 循环依赖处理

### 函数式编程
- 纯函数与副作用
- 高阶函数
- 函数组合与管道
- 不可变数据
- 柯里化与偏应用

## 浏览器与DOM

### DOM操作
- 节点选择与遍历
- 元素创建与修改
- 属性与样式操作
- 事件处理与委托
- 表单与表单验证

### BOM与Web API
- Window与Document对象
- 定时器（setTimeout, setInterval）
- 存储（localStorage, sessionStorage）
- Fetch API与网络请求
- History API与路由

### 现代Web API
- Intersection Observer
- ResizeObserver
- Web Workers
- Service Workers
- WebSockets
- WebRTC
- Canvas与WebGL

## JavaScript工具与生态

### 开发工具
- Babel转译
- Webpack与模块打包
- ESLint代码检查
- Jest单元测试
- TypeScript集成

### 性能优化
- 代码分割与懒加载
- 内存管理与垃圾回收
- 防抖与节流
- 事件循环优化
- 渲染性能

### 安全考量
- XSS与CSRF防御
- 内容安全策略(CSP)
- HTTPS与安全传输
- 输入验证与过滤
- 第三方库安全审计

## 代码示例

```javascript
// 现代JavaScript特性示例

// 使用ES6+特性
const processUsers = async (userIds) => {
  try {
    // 使用Promise.all并行处理请求
    const userPromises = userIds.map(id => 
      fetch(`https://api.example.com/users/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch user ${id}`);
          }
          return response.json();
        })
    );
    
    // 等待所有请求完成
    const users = await Promise.all(userPromises);
    
    // 使用解构和箭头函数处理数据
    const processedUsers = users.map(({ id, name, email, ...rest }) => ({
      id,
      displayName: name.toUpperCase(),
      contact: email,
      // 使用可选链和空值合并操作符
      verified: rest.verified ?? false,
      lastLogin: rest.lastLogin?.date || 'Never',
    }));
    
    // 使用数组方法过滤和排序
    return processedUsers
      .filter(user => user.verified)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
      
  } catch (error) {
    console.error('Error processing users:', error);
    // 优雅地处理错误
    return [];
  }
};

// 使用类和模块
class UserManager {
  #users = new Map();
  
  constructor(initialUsers = []) {
    initialUsers.forEach(user => this.addUser(user));
  }
  
  addUser(user) {
    if (!user.id) throw new Error('User must have an id');
    this.#users.set(user.id, user);
    return this;
  }
  
  getUser(id) {
    return this.#users.get(id);
  }
  
  get userCount() {
    return this.#users.size;
  }
  
  *[Symbol.iterator]() {
    for (const user of this.#users.values()) {
      yield user;
    }
  }
}

// 使用事件委托
document.addEventListener('DOMContentLoaded', () => {
  const userList = document.querySelector('.user-list');
  
  userList?.addEventListener('click', (event) => {
    const userItem = event.target.closest('.user-item');
    if (!userItem) return;
    
    const userId = userItem.dataset.userId;
    if (userId) {
      // 使用动态导入加载模块
      import('./user-details.js')
        .then(module => {
          module.showUserDetails(userId);
        })
        .catch(error => {
          console.error('Failed to load user details module', error);
        });
    }
  });
});