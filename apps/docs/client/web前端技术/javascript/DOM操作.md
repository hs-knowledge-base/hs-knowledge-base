# JavaScript DOM操作

DOM（Document Object Model，文档对象模型）是HTML和XML文档的编程接口。它将网页表示为一个树形结构，使JavaScript能够访问和操作网页的内容、结构和样式。本文将详细介绍如何使用JavaScript进行DOM操作。

## DOM基础

### 什么是DOM

DOM是一个跨平台、语言独立的接口，允许程序和脚本动态访问和更新文档的内容、结构和样式。在Web开发中，DOM将HTML或XML文档表示为一个由节点和对象组成的树状结构。

```
document
└── html
    ├── head
    │   ├── title
    │   │   └── "我的网页"
    │   └── meta
    └── body
        ├── h1
        │   └── "标题"
        ├── p
        │   └── "段落内容"
        └── div
            └── ...
```

### 节点类型

DOM中的每个节点都有一个`nodeType`属性，表示节点的类型：

```javascript
// 常见的节点类型
const ELEMENT_NODE = 1; // 元素节点，如<div>
const ATTRIBUTE_NODE = 2; // 属性节点，如id="example"
const TEXT_NODE = 3; // 文本节点
const COMMENT_NODE = 8; // 注释节点，如<!-- 注释 -->
const DOCUMENT_NODE = 9; // 文档节点
const DOCUMENT_TYPE_NODE = 10; // 文档类型节点，如<!DOCTYPE html>

// 检查节点类型
const element = document.getElementById("example");
console.log(element.nodeType === Node.ELEMENT_NODE); // true
```

## 选择DOM元素

JavaScript提供了多种方法来选择DOM元素。

### 通过ID选择

```javascript
// 通过ID获取元素
const element = document.getElementById("myId");
```

### 通过类名选择

```javascript
// 通过类名获取元素集合（HTMLCollection）
const elements = document.getElementsByClassName("myClass");

// 遍历元素集合
for (let i = 0; i < elements.length; i++) {
  console.log(elements[i]);
}
```

### 通过标签名选择

```javascript
// 通过标签名获取元素集合
const paragraphs = document.getElementsByTagName("p");

// 在特定元素内查找
const container = document.getElementById("container");
const divs = container.getElementsByTagName("div");
```

### 通过CSS选择器选择

```javascript
// 选择第一个匹配的元素
const element = document.querySelector(".myClass");

// 选择所有匹配的元素（NodeList）
const elements = document.querySelectorAll("div.item");

// 使用复杂选择器
const complexSelector = document.querySelectorAll("ul > li:nth-child(odd)");
```

### 特殊元素选择

```javascript
// 获取文档的根元素（<html>）
const rootElement = document.documentElement;

// 获取头部元素（<head>）
const headElement = document.head;

// 获取主体元素（<body>）
const bodyElement = document.body;
```

## 遍历DOM

### 节点关系

每个DOM节点都有属性来访问其相关节点：

```javascript
const element = document.getElementById("myId");

// 父节点
const parent = element.parentNode;
const parentElement = element.parentElement; // 只返回元素节点的父节点

// 子节点
const children = element.childNodes; // 包括文本节点、注释节点等
const elementChildren = element.children; // 只包括元素节点

// 第一个和最后一个子节点
const firstChild = element.firstChild; // 可能是文本节点
const lastChild = element.lastChild;
const firstElementChild = element.firstElementChild; // 第一个元素子节点
const lastElementChild = element.lastElementChild;

// 兄弟节点
const nextSibling = element.nextSibling; // 可能是文本节点
const previousSibling = element.previousSibling;
const nextElementSibling = element.nextElementSibling; // 下一个元素兄弟节点
const previousElementSibling = element.previousElementSibling;
```

### 遍历示例

```javascript
// 遍历所有子元素
function traverseChildren(element) {
  console.log(element.tagName);
  
  const children = element.children;
  for (let i = 0; i < children.length; i++) {
    traverseChildren(children[i]);
  }
}

// 使用递归遍历整个DOM树
traverseChildren(document.body);

// 使用NodeIterator遍历
const iterator = document.createNodeIterator(
  document.body,
  NodeFilter.SHOW_ELEMENT,
  null,
  false
);

let node;
while ((node = iterator.nextNode())) {
  console.log(node.tagName);
}

// 使用TreeWalker遍历
const walker = document.createTreeWalker(
  document.body,
  NodeFilter.SHOW_ELEMENT,
  null,
  false
);

let currentNode;
while ((currentNode = walker.nextNode())) {
  console.log(currentNode.tagName);
}
```

## 操作DOM内容

### 读取和设置文本内容

```javascript
const element = document.getElementById("myId");

// 获取文本内容（包括所有子元素的文本）
const text = element.textContent;

// 设置文本内容（会覆盖所有子元素）
element.textContent = "新的文本内容";

// innerText（考虑CSS样式，性能较差）
const visibleText = element.innerText;
element.innerText = "只显示可见文本";
```

### 读取和设置HTML内容

```javascript
const element = document.getElementById("myId");

// 获取HTML内容
const html = element.innerHTML;

// 设置HTML内容
element.innerHTML = "<strong>新的</strong>HTML内容";

// 获取元素的完整HTML（包括元素本身）
const outerHTML = element.outerHTML;

// 设置outerHTML（会替换元素本身）
element.outerHTML = "<div id='newId'>替换后的元素</div>";
```

### 创建和插入元素

```javascript
// 创建新元素
const newElement = document.createElement("div");
newElement.textContent = "新创建的元素";
newElement.className = "new-class";

// 创建文本节点
const textNode = document.createTextNode("纯文本内容");

// 添加到现有元素末尾
const parent = document.getElementById("container");
parent.appendChild(newElement);

// 在特定位置插入
const referenceElement = document.getElementById("reference");
parent.insertBefore(textNode, referenceElement);

// 使用新的插入方法（更灵活）
parent.append(newElement, textNode); // 在末尾添加多个节点
parent.prepend("在开头添加"); // 在开头添加
referenceElement.before("之前"); // 在元素之前
referenceElement.after("之后"); // 在元素之后
```

### 复制元素

```javascript
const original = document.getElementById("original");

// 浅复制（不包括子元素）
const shallowCopy = original.cloneNode(false);

// 深复制（包括所有子元素）
const deepCopy = original.cloneNode(true);

// 添加到文档中
document.body.appendChild(deepCopy);
```

### 删除和替换元素

```javascript
const element = document.getElementById("toRemove");
const parent = element.parentNode;

// 移除元素
parent.removeChild(element);
// 或者使用较新的方法
element.remove();

// 替换元素
const oldElement = document.getElementById("old");
const newElement = document.createElement("div");
newElement.textContent = "替换的新元素";

parent.replaceChild(newElement, oldElement);
// 或者使用较新的方法
oldElement.replaceWith(newElement);
```

## 操作DOM属性

### 标准属性

```javascript
const image = document.getElementById("myImage");

// 读取属性
const src = image.src;
const alt = image.alt;

// 设置属性
image.src = "new-image.jpg";
image.alt = "新的图片描述";

// 检查属性是否存在
if (image.hasAttribute("data-custom")) {
  console.log("存在自定义属性");
}
```

### 自定义属性

```javascript
const element = document.getElementById("myElement");

// 设置自定义属性
element.setAttribute("data-custom", "自定义值");

// 获取自定义属性
const customValue = element.getAttribute("data-custom");

// 删除属性
element.removeAttribute("data-custom");

// 使用dataset（HTML5数据属性）
element.dataset.user = "张三";
element.dataset.userId = "123";
console.log(element.dataset.user); // "张三"
console.log(element.dataset.userId); // "123"
```

### 类名操作

```javascript
const element = document.getElementById("myElement");

// 使用className（字符串）
element.className = "class1 class2";

// 添加类
element.className += " class3";

// 使用classList（更方便）
element.classList.add("class4");
element.classList.remove("class1");
element.classList.toggle("active"); // 切换类（有则删除，无则添加）
element.classList.replace("class2", "newClass");

// 检查是否包含某个类
const hasClass = element.classList.contains("active");
```

### 样式操作

```javascript
const element = document.getElementById("myElement");

// 直接设置内联样式
element.style.color = "red";
element.style.backgroundColor = "#f0f0f0";
element.style.fontSize = "16px";

// 一次设置多个样式
Object.assign(element.style, {
  padding: "10px",
  margin: "5px",
  border: "1px solid black"
});

// 获取计算后的样式（只读）
const computedStyle = window.getComputedStyle(element);
console.log(computedStyle.color);
console.log(computedStyle.getPropertyValue("font-size"));
```

## 事件处理

### 添加事件监听器

```javascript
const button = document.getElementById("myButton");

// 添加事件监听器
button.addEventListener("click", function(event) {
  console.log("按钮被点击了");
  console.log(event); // 事件对象
});

// 使用箭头函数
button.addEventListener("mouseover", (event) => {
  console.log("鼠标悬停");
});

// 添加多个监听器
function handler1() {
  console.log("处理器1");
}

function handler2() {
  console.log("处理器2");
}

button.addEventListener("click", handler1);
button.addEventListener("click", handler2);
```

### 移除事件监听器

```javascript
// 需要使用相同的函数引用才能移除
button.removeEventListener("click", handler1);

// 无法移除匿名函数
button.addEventListener("click", function() {
  console.log("这个无法被移除");
});
```

### 事件对象

```javascript
button.addEventListener("click", function(event) {
  // 事件类型
  console.log(event.type); // "click"
  
  // 事件目标
  console.log(event.target); // 触发事件的元素
  console.log(event.currentTarget); // 绑定事件处理程序的元素
  
  // 鼠标事件属性
  console.log(event.clientX, event.clientY); // 相对于视口的坐标
  console.log(event.pageX, event.pageY); // 相对于文档的坐标
  
  // 键盘事件属性
  console.log(event.key); // 按键值
  console.log(event.keyCode); // 按键代码（已废弃）
  console.log(event.code); // 物理按键代码
  
  // 修饰键状态
  console.log(event.ctrlKey); // 是否按下Ctrl键
  console.log(event.shiftKey); // 是否按下Shift键
  console.log(event.altKey); // 是否按下Alt键
  console.log(event.metaKey); // 是否按下Meta键（如Windows键或Mac的Command键）
});
```

### 事件传播

事件传播有三个阶段：捕获阶段、目标阶段和冒泡阶段。

```javascript
// 第三个参数设置为true，在捕获阶段处理事件
document.body.addEventListener("click", function(event) {
  console.log("Body捕获阶段");
}, true);

// 默认在冒泡阶段处理事件
document.body.addEventListener("click", function(event) {
  console.log("Body冒泡阶段");
});

// 阻止事件冒泡
button.addEventListener("click", function(event) {
  console.log("按钮被点击");
  event.stopPropagation(); // 阻止事件继续传播
});

// 阻止默认行为
const link = document.getElementById("myLink");
link.addEventListener("click", function(event) {
  console.log("链接被点击");
  event.preventDefault(); // 阻止默认的导航行为
});
```

### 事件委托

利用事件冒泡，可以在父元素上处理子元素的事件。

```javascript
// 事件委托示例
const list = document.getElementById("myList");

list.addEventListener("click", function(event) {
  // 检查是否点击了列表项
  if (event.target.tagName === "LI") {
    console.log("点击了列表项:", event.target.textContent);
    event.target.classList.toggle("selected");
  }
});

// 动态添加新列表项
const newItem = document.createElement("li");
newItem.textContent = "新列表项";
list.appendChild(newItem); // 无需为新项添加事件监听器
```

## DOM操作优化

### 性能考虑

```javascript
// 不好的做法：频繁操作DOM
for (let i = 0; i < 1000; i++) {
  document.body.innerHTML += "<div>" + i + "</div>"; // 每次都会重新解析和渲染
}

// 更好的做法：使用DocumentFragment
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const div = document.createElement("div");
  div.textContent = i;
  fragment.appendChild(div);
}
document.body.appendChild(fragment); // 只进行一次DOM操作

// 批量更新：先从DOM中移除，修改后再放回
const list = document.getElementById("myList");
const parent = list.parentNode;
const nextSibling = list.nextSibling;

// 移除元素
parent.removeChild(list);

// 进行多次修改
for (let i = 0; i < 1000; i++) {
  const item = document.createElement("li");
  item.textContent = `项目 ${i}`;
  list.appendChild(item);
}

// 放回DOM
parent.insertBefore(list, nextSibling);
```

### 减少重排和重绘

```javascript
const element = document.getElementById("myElement");

// 不好的做法：多次单独修改样式
element.style.width = "100px";
element.style.height = "100px";
element.style.backgroundColor = "red";
// 每次修改可能导致重排

// 更好的做法：一次性修改多个样式
element.style.cssText = "width: 100px; height: 100px; background-color: red;";

// 或者使用类
element.className = "my-styled-element";

// 使用requestAnimationFrame进行视觉更新
function updateAnimation() {
  element.style.left = (parseInt(element.style.left) || 0) + 5 + "px";
  
  if (parseInt(element.style.left) < 500) {
    requestAnimationFrame(updateAnimation);
  }
}

requestAnimationFrame(updateAnimation);
```

### 缓存DOM查询

```javascript
// 不好的做法：重复查询DOM
for (let i = 0; i < 100; i++) {
  document.getElementById("myElement").innerHTML += "内容"; // 每次都查询DOM
}

// 更好的做法：缓存DOM引用
const element = document.getElementById("myElement");
let content = "";
for (let i = 0; i < 100; i++) {
  content += "内容";
}
element.innerHTML = content;
```

## 实用DOM操作示例

### 创建动态表格

```javascript
function createTable(data, headers) {
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  
  // 创建表头
  const headerRow = document.createElement("tr");
  headers.forEach(header => {
    const th = document.createElement("th");
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  
  // 创建表格内容
  data.forEach(rowData => {
    const row = document.createElement("tr");
    Object.values(rowData).forEach(cellData => {
      const cell = document.createElement("td");
      cell.textContent = cellData;
      row.appendChild(cell);
    });
    tbody.appendChild(row);
  });
  
  table.appendChild(thead);
  table.appendChild(tbody);
  return table;
}

// 使用示例
const data = [
  { id: 1, name: "张三", age: 30 },
  { id: 2, name: "李四", age: 25 },
  { id: 3, name: "王五", age: 28 }
];

const headers = ["ID", "姓名", "年龄"];
const table = createTable(data, headers);
document.getElementById("tableContainer").appendChild(table);
```

### 实现标签切换

```javascript
function setupTabs(containerSelector) {
  const container = document.querySelector(containerSelector);
  const tabs = container.querySelectorAll(".tab");
  const contents = container.querySelectorAll(".tab-content");
  
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      // 移除所有活动状态
      tabs.forEach(t => t.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));
      
      // 设置当前标签和内容为活动状态
      tab.classList.add("active");
      contents[index].classList.add("active");
    });
  });
  
  // 默认激活第一个标签
  if (tabs.length > 0) {
    tabs[0].click();
  }
}

// 使用示例
setupTabs("#tabContainer");
```

### 无限滚动

```javascript
function setupInfiniteScroll(containerSelector, loadMoreCallback) {
  const container = document.querySelector(containerSelector);
  
  // 监听滚动事件
  container.addEventListener("scroll", () => {
    // 检查是否滚动到底部
    if (container.scrollHeight - container.scrollTop <= container.clientHeight + 100) {
      loadMoreCallback();
    }
  });
}

// 使用示例
setupInfiniteScroll("#content", () => {
  // 加载更多内容的函数
  for (let i = 0; i < 10; i++) {
    const item = document.createElement("div");
    item.textContent = `新加载的项目 ${Math.random().toString(36).substring(7)}`;
    document.querySelector("#content").appendChild(item);
  }
});
```

### 拖放功能

```javascript
function setupDragAndDrop() {
  const draggables = document.querySelectorAll(".draggable");
  const containers = document.querySelectorAll(".container");
  
  draggables.forEach(draggable => {
    draggable.addEventListener("dragstart", () => {
      draggable.classList.add("dragging");
    });
    
    draggable.addEventListener("dragend", () => {
      draggable.classList.remove("dragging");
    });
  });
  
  containers.forEach(container => {
    container.addEventListener("dragover", event => {
      event.preventDefault();
      const draggable = document.querySelector(".dragging");
      const afterElement = getDragAfterElement(container, event.clientY);
      
      if (afterElement == null) {
        container.appendChild(draggable);
      } else {
        container.insertBefore(draggable, afterElement);
      }
    });
  });
  
  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".draggable:not(.dragging)")];
    
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
}

// 使用示例
setupDragAndDrop();
```

## DOM操作与框架

现代前端开发中，直接操作DOM的情况越来越少，因为各种框架（如React、Vue、Angular）提供了更高级的抽象。

### 虚拟DOM

虚拟DOM是一种在内存中表示UI的轻量级JavaScript对象，它与实际DOM保持同步。

```javascript
// 简化的虚拟DOM实现示例
function createElement(type, props = {}, ...children) {
  return {
    type,
    props,
    children: children.flat()
  };
}

// 创建虚拟DOM树
const vdom = createElement("div", { className: "container" },
  createElement("h1", {}, "标题"),
  createElement("p", {}, "段落内容")
);

// 将虚拟DOM渲染为实际DOM
function render(vnode, container) {
  if (typeof vnode === "string" || typeof vnode === "number") {
    container.appendChild(document.createTextNode(vnode));
    return;
  }
  
  const element = document.createElement(vnode.type);
  
  // 设置属性
  Object.entries(vnode.props || {}).forEach(([name, value]) => {
    element[name] = value;
  });
  
  // 渲染子节点
  vnode.children.forEach(child => render(child, element));
  
  container.appendChild(element);
}

// 使用
render(vdom, document.getElementById("app"));
```

### 何时直接操作DOM

即使使用框架，有时也需要直接操作DOM：

1. 与第三方库集成
2. 处理特定的DOM事件
3. 进行特殊的动画效果
4. 访问DOM元素的度量（如宽度、高度、位置）

```javascript
// React中的ref示例
import React, { useRef, useEffect } from 'react';

function Canvas() {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 直接操作canvas DOM
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 100, 100);
  }, []);
  
  return <canvas ref={canvasRef} width="200" height="200" />;
}
```

## 总结

DOM操作是前端开发的基础，掌握它可以让你更好地理解Web应用的工作原理。尽管现代框架减少了直接DOM操作的需求，但理解底层机制仍然非常重要。

关键要点：

1. DOM是HTML和XML文档的编程接口，将文档表示为树形结构
2. 选择元素的主要方法：`getElementById`、`getElementsByClassName`、`querySelector`等
3. 操作元素内容的属性：`textContent`、`innerHTML`、`outerHTML`等
4. 创建和操作元素的方法：`createElement`、`appendChild`、`insertBefore`等
5. 事件处理：`addEventListener`、`removeEventListener`、事件委托
6. DOM操作优化：减少重排和重绘、使用DocumentFragment、缓存DOM查询

随着Web技术的发展，DOM API也在不断更新，提供更多便捷的方法来操作文档。理解这些基础知识，将有助于你成为更全面的前端开发者。 