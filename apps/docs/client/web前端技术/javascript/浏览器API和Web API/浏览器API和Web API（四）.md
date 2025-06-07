# 浏览器API和Web API (三)：Web Components

Web Components是一套不同的技术，允许你创建可重用的自定义元素，将它们的功能封装在你代码的其他部分之外，并在你的Web应用中使用它们。Web Components由四个主要技术组成：Custom Elements、Shadow DOM、HTML Templates和HTML Imports(已废弃)。

## Custom Elements (自定义元素)

Custom Elements允许开发者创建新的HTML标签，扩展现有的HTML元素，或者扩展其他开发者的组件。

### 基本用法

```javascript
// 定义自定义元素
class UserCard extends HTMLElement {
  constructor() {
    // 必须首先调用super()
    super();
    
    // 元素创建逻辑
    this.render();
  }
  
  render() {
    this.innerHTML = `
      <div class="user-card">
        <img src="${this.getAttribute('avatar') || 'default-avatar.png'}">
        <div>
          <h3>${this.getAttribute('name') || 'Unknown User'}</h3>
          <p>${this.getAttribute('email') || 'No email provided'}</p>
          <button>联系用户</button>
        </div>
      </div>
    `;
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
      .user-card {
        display: flex;
        align-items: center;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        margin-bottom: 10px;
      }
      .user-card img {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        margin-right: 15px;
      }
      .user-card button {
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 5px 10px;
        cursor: pointer;
      }
    `;
    this.appendChild(style);
    
    // 添加事件监听
    this.querySelector('button').addEventListener('click', () => {
      alert(`联系 ${this.getAttribute('name')}`);
    });
  }
}

// 注册自定义元素
customElements.define('user-card', UserCard);
```

在HTML中使用自定义元素：

```html
<user-card 
  name="张三" 
  email="zhangsan@example.com" 
  avatar="https://example.com/avatar.jpg">
</user-card>
```

### 生命周期回调

```javascript
class CustomElement extends HTMLElement {
  constructor() {
    super();
    console.log('构造函数：元素实例被创建');
  }
  
  connectedCallback() {
    console.log('元素被添加到文档');
    // 适合添加事件监听器、获取外部资源等
  }
  
  disconnectedCallback() {
    console.log('元素从文档中移除');
    // 适合清理工作：移除事件监听器、取消网络请求等
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`属性 ${name} 从 ${oldValue} 变为 ${newValue}`);
    // 当监视的属性变化时调用
  }
  
  adoptedCallback() {
    console.log('元素被移动到新文档');
    // 当元素被移动到新文档时调用（通过document.adoptNode）
  }
  
  // 指定要监视变化的属性
  static get observedAttributes() {
    return ['title', 'status'];
  }
}

customElements.define('custom-element', CustomElement);
```

### 扩展现有HTML元素

```javascript
// 扩展原生按钮
class FancyButton extends HTMLButtonElement {
  constructor() {
    super();
    this.addEventListener('click', () => {
      // 添加涟漪效果
      this.addRipple();
    });
  }
  
  addRipple() {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    // 获取点击位置
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = '0px';
    ripple.style.top = '0px';
    
    // 添加涟漪元素
    this.appendChild(ripple);
    
    // 动画结束后移除
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
  
  connectedCallback() {
    // 添加样式
    if (!this.querySelector('style')) {
      const style = document.createElement('style');
      style.textContent = `
        :host {
          position: relative;
          overflow: hidden;
        }
        .ripple {
          position: absolute;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.6);
          transform: scale(0);
          animation: ripple 0.6s linear;
          pointer-events: none;
        }
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      this.appendChild(style);
    }
  }
}

// 注册为扩展元素
customElements.define('fancy-button', FancyButton, { extends: 'button' });
```

在HTML中使用扩展元素：

```html
<button is="fancy-button">点击我</button>
```

## Shadow DOM

Shadow DOM允许将隐藏的DOM树附加到常规DOM树中的元素上。Shadow DOM树以shadow root节点为起始点，这个节点下的内容不受外部DOM影响，可以包含任何常规DOM能包含的内容。

### 基本用法

```javascript
class PopupInfo extends HTMLElement {
  constructor() {
    super();
    
    // 创建shadow root
    const shadow = this.attachShadow({mode: 'open'});
    
    // 创建内部元素
    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'wrapper');
    
    const icon = document.createElement('span');
    icon.setAttribute('class', 'icon');
    icon.textContent = 'ℹ️';
    
    const info = document.createElement('span');
    info.setAttribute('class', 'info');
    info.textContent = this.getAttribute('data-text');
    
    // 样式
    const style = document.createElement('style');
    style.textContent = `
      .wrapper {
        position: relative;
        display: inline-block;
      }
      .icon {
        cursor: pointer;
        font-size: 1.2em;
      }
      .info {
        position: absolute;
        bottom: 20px;
        left: 0;
        width: 200px;
        background-color: #2196F3;
        color: white;
        padding: 10px;
        border-radius: 4px;
        display: none;
      }
      .icon:hover + .info {
        display: block;
      }
    `;
    
    // 附加到shadow DOM
    shadow.appendChild(style);
    wrapper.appendChild(icon);
    wrapper.appendChild(info);
    shadow.appendChild(wrapper);
  }
}

customElements.define('popup-info', PopupInfo);
```

使用自定义元素：

```html
<popup-info data-text="这是一个弹出信息组件，鼠标悬停查看详情。"></popup-info>
```

### Shadow DOM模式

```javascript
// 开放模式 - 外部JavaScript可以访问shadow DOM
const openShadow = element.attachShadow({mode: 'open'});
// 可以通过element.shadowRoot访问

// 关闭模式 - 外部JavaScript无法访问shadow DOM
const closedShadow = element.attachShadow({mode: 'closed'});
// element.shadowRoot将返回null
```

### 样式封装

Shadow DOM的一个主要特性是样式封装。shadow DOM内部的CSS样式不会影响外部文档，外部文档的样式也不会影响shadow DOM内部。

```javascript
class StyledElement extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    
    shadow.innerHTML = `
      <style>
        /* 这些样式只在shadow DOM内部生效 */
        p {
          color: red;
          background-color: #f0f0f0;
          padding: 10px;
          border: 1px solid #ccc;
        }
        
        /* 使用:host选择器样式化宿主元素 */
        :host {
          display: block;
          margin: 10px;
          border: 2px solid blue;
        }
        
        /* 基于宿主元素属性的条件样式 */
        :host([highlighted]) {
          background-color: yellow;
        }
        
        /* 基于宿主元素的上下文 */
        :host-context(.dark-theme) {
          background-color: #333;
          color: white;
        }
      </style>
      <p>这是shadow DOM内部的样式化段落</p>
    `;
  }
}

customElements.define('styled-element', StyledElement);
```

### 插槽 (Slots)

插槽允许你在shadow DOM中创建放置用户内容的占位符。

```javascript
class SlottedCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    
    this.shadowRoot.innerHTML = `
      <style>
        .card {
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 16px;
          max-width: 400px;
        }
        .header {
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        .content {
          margin-bottom: 10px;
        }
        .footer {
          border-top: 1px solid #eee;
          padding-top: 10px;
          text-align: right;
        }
      </style>
      <div class="card">
        <div class="header">
          <slot name="header">默认标题</slot>
        </div>
        <div class="content">
          <slot>默认内容...</slot>
        </div>
        <div class="footer">
          <slot name="footer">默认页脚</slot>
        </div>
      </div>
    `;
  }
}

customElements.define('slotted-card', SlottedCard);
```

使用带插槽的元素：

```html
<slotted-card>
  <h2 slot="header">卡片标题</h2>
  <p>这是卡片的主要内容。可以包含任何HTML元素。</p>
  <div slot="footer">
    <button>取消</button>
    <button>确认</button>
  </div>
</slotted-card>
```

### 事件处理

Shadow DOM中的事件处理有一些特殊的行为，特别是事件冒泡和事件重定向。

```javascript
class EventComponent extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    
    shadow.innerHTML = `
      <button class="inner-button">内部按钮</button>
    `;
    
    // 在shadow DOM内部添加事件监听器
    shadow.querySelector('.inner-button').addEventListener('click', event => {
      console.log('内部按钮被点击');
      
      // 创建自定义事件
      const customEvent = new CustomEvent('button-clicked', {
        bubbles: true,
        composed: true, // 允许事件穿过shadow DOM边界
        detail: {
          message: '来自shadow DOM的问候!'
        }
      });
      
      this.dispatchEvent(customEvent);
    });
  }
}

customElements.define('event-component', EventComponent);

// 在外部处理来自shadow DOM的事件
document.querySelector('event-component').addEventListener('button-clicked', event => {
  console.log('收到自定义事件:', event.detail.message);
});
```

## HTML Templates

HTML `<template>` 元素包含客户端不会在页面加载时立即渲染的HTML片段，但可以用JavaScript实例化。

### 基本用法

```html
<!-- 在HTML中定义模板 -->
<template id="user-template">
  <div class="user">
    <img class="avatar">
    <div class="info">
      <h2 class="name"></h2>
      <p class="email"></p>
    </div>
  </div>
  <style>
    .user {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
    .avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      margin-right: 10px;
    }
    .info {
      flex: 1;
    }
    .name {
      margin: 0;
      font-size: 16px;
    }
    .email {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  </style>
</template>
```

```javascript
// 使用模板创建自定义元素
class UserElement extends HTMLElement {
  constructor() {
    super();
    
    // 创建shadow DOM
    const shadow = this.attachShadow({mode: 'open'});
    
    // 获取模板
    const template = document.getElementById('user-template');
    const content = template.content.cloneNode(true);
    
    // 填充内容
    content.querySelector('.name').textContent = this.getAttribute('name') || 'Unknown';
    content.querySelector('.email').textContent = this.getAttribute('email') || '';
    content.querySelector('.avatar').src = this.getAttribute('avatar') || 'default-avatar.png';
    
    // 附加到shadow DOM
    shadow.appendChild(content);
  }
}

customElements.define('user-element', UserElement);
```

```html
<!-- 使用自定义元素 -->
<user-element 
  name="李四" 
  email="lisi@example.com" 
  avatar="lisi-avatar.jpg">
</user-element>
```

### 使用JavaScript创建模板

```javascript
// 创建模板
const template = document.createElement('template');
template.innerHTML = `
  <style>
    .tooltip {
      position: relative;
      display: inline-block;
    }
    .tooltip-content {
      visibility: hidden;
      background-color: black;
      color: #fff;
      text-align: center;
      border-radius: 6px;
      padding: 5px;
      position: absolute;
      z-index: 1;
      bottom: 125%;
      left: 50%;
      transform: translateX(-50%);
      opacity: 0;
      transition: opacity 0.3s;
    }
    .tooltip:hover .tooltip-content {
      visibility: visible;
      opacity: 1;
    }
  </style>
  <div class="tooltip">
    <slot></slot>
    <div class="tooltip-content">
      <slot name="content">提示内容</slot>
    </div>
  </div>
`;

// 创建自定义元素
class Tooltip extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

customElements.define('custom-tooltip', Tooltip);
```

使用自定义提示元素：

```html
<custom-tooltip>
  鼠标悬停查看更多
  <span slot="content">这是详细的提示内容</span>
</custom-tooltip>
```

## 构建完整的组件库

以下是一个简化的组件库示例，展示如何结合使用这些技术：

```javascript
// 基本样式
const baseStyles = `
  * {
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
`;

// 按钮组件
class UIButton extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'size', 'disabled'];
  }
  
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.render();
  }
  
  render() {
    const variant = this.getAttribute('variant') || 'primary';
    const size = this.getAttribute('size') || 'medium';
    const disabled = this.hasAttribute('disabled');
    
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        
        :host {
          display: inline-block;
        }
        
        button {
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          outline: none;
        }
        
        /* 变体样式 */
        button.primary {
          background-color: #2196F3;
          color: white;
        }
        
        button.secondary {
          background-color: #f5f5f5;
          color: #333;
          border: 1px solid #ddd;
        }
        
        button.danger {
          background-color: #f44336;
          color: white;
        }
        
        /* 大小样式 */
        button.small {
          padding: 4px 8px;
          font-size: 12px;
        }
        
        button.medium {
          padding: 8px 16px;
          font-size: 14px;
        }
        
        button.large {
          padding: 12px 24px;
          font-size: 16px;
        }
        
        /* 禁用状态 */
        button[disabled] {
          opacity: 0.6;
          cursor: not-allowed;
        }
      </style>
      
      <button 
        class="${variant} ${size}" 
        ${disabled ? 'disabled' : ''}>
        <slot></slot>
      </button>
    `;
    
    // 添加点击事件
    const button = this.shadowRoot.querySelector('button');
    button.addEventListener('click', event => {
      if (!disabled) {
        this.dispatchEvent(new CustomEvent('ui-click', {
          bubbles: true,
          composed: true
        }));
      }
    });
  }
  
  attributeChangedCallback() {
    this.render();
  }
}

// 卡片组件
class UICard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        
        :host {
          display: block;
          margin: 16px;
        }
        
        .card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .card-header {
          padding: 16px;
          border-bottom: 1px solid #eee;
          font-weight: bold;
        }
        
        .card-content {
          padding: 16px;
        }
        
        .card-footer {
          padding: 16px;
          border-top: 1px solid #eee;
        }
      </style>
      
      <div class="card">
        <div class="card-header">
          <slot name="header">Card Title</slot>
        </div>
        <div class="card-content">
          <slot></slot>
        </div>
        <div class="card-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }
}

// 输入框组件
class UIInput extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'placeholder', 'type', 'value', 'error'];
  }
  
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.render();
  }
  
  render() {
    const label = this.getAttribute('label') || '';
    const placeholder = this.getAttribute('placeholder') || '';
    const type = this.getAttribute('type') || 'text';
    const value = this.getAttribute('value') || '';
    const error = this.getAttribute('error') || '';
    
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        
        :host {
          display: block;
          margin-bottom: 16px;
        }
        
        label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
        }
        
        input {
          width: 100%;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid ${error ? '#f44336' : '#ddd'};
          font-size: 14px;
        }
        
        input:focus {
          outline: none;
          border-color: #2196F3;
          box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
        }
        
        .error-message {
          color: #f44336;
          font-size: 12px;
          margin-top: 4px;
        }
      </style>
      
      ${label ? `<label>${label}</label>` : ''}
      <input type="${type}" placeholder="${placeholder}" value="${value}">
      ${error ? `<div class="error-message">${error}</div>` : ''}
    `;
    
    // 添加输入事件
    const input = this.shadowRoot.querySelector('input');
    input.addEventListener('input', event => {
      this.dispatchEvent(new CustomEvent('ui-input', {
        bubbles: true,
        composed: true,
        detail: {value: event.target.value}
      }));
    });
  }
  
  attributeChangedCallback() {
    this.render();
  }
  
  // 获取值
  get value() {
    return this.shadowRoot.querySelector('input').value;
  }
  
  // 设置值
  set value(newValue) {
    this.shadowRoot.querySelector('input').value = newValue;
  }
}

// 注册组件
customElements.define('ui-button', UIButton);
customElements.define('ui-card', UICard);
customElements.define('ui-input', UIInput);
```

使用这些组件：

```html
<ui-card>
  <h3 slot="header">用户登录</h3>
  
  <ui-input 
    label="用户名" 
    placeholder="请输入用户名">
  </ui-input>
  
  <ui-input 
    label="密码" 
    type="password" 
    placeholder="请输入密码" 
    error="密码不能少于6个字符">
  </ui-input>
  
  <div slot="footer">
    <ui-button variant="secondary" size="medium">取消</ui-button>
    <ui-button variant="primary" size="medium">登录</ui-button>
  </div>
</ui-card>
```

## 最佳实践

### 命名约定

使用连字符命名自定义元素以避免与原生HTML元素冲突：

```javascript
// 好的命名
customElements.define('user-card', UserCard);
customElements.define('app-header', AppHeader);
customElements.define('data-table', DataTable);

// 不好的命名 (可能与未来的HTML元素冲突)
customElements.define('card', Card);
customElements.define('header', Header);
```

### 组件内部封装

尽量将功能封装在组件内部，减少对外部依赖：

```javascript
// 好的做法
class SelfContainedComponent extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    
    // 内部处理点击事件
    this.handleClick = this.handleClick.bind(this);
    
    shadow.innerHTML = `
      <button>点击我</button>
    `;
    
    shadow.querySelector('button').addEventListener('click', this.handleClick);
  }
  
  handleClick() {
    // 内部处理逻辑
    console.log('按钮被点击');
    this.dispatchEvent(new CustomEvent('button-click'));
  }
}
```

### 优雅降级

对于不支持Web Components的浏览器，提供后备方案：

```javascript
// 检测支持并提供后备方案
if (!('customElements' in window)) {
  // 加载polyfill或使用替代方法
  loadPolyfill();
  // 或显示后备UI
  document.body.classList.add('no-components-support');
}
```

### 与框架集成

Web Components可以与现代框架一起使用：

```jsx
// React示例
import React from 'react';

// 确保组件已在全局注册
// 例如 customElements.define('user-card', UserCard);

function App() {
  return (
    <div>
      <h1>我的应用</h1>
      <user-card
        name="王五"
        email="wangwu@example.com"
        ref={el => {
          // 可以使用ref访问自定义元素
          if (el) {
            el.addEventListener('button-click', () => {
              console.log('自定义元素按钮被点击');
            });
          }
        }}
      />
    </div>
  );
}
```

```vue
<!-- Vue示例 -->
<template>
  <div>
    <h1>我的应用</h1>
    <user-card
      :name="userName"
      :email="userEmail"
      @button-click="handleButtonClick"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      userName: '王五',
      userEmail: 'wangwu@example.com'
    };
  },
  methods: {
    handleButtonClick() {
      console.log('自定义元素按钮被点击');
    }
  }
};
</script>
```

## 总结

Web Components提供了一种标准化的组件模型，使开发者能够创建可重用的自定义元素。通过结合Custom Elements、Shadow DOM和HTML Templates，可以构建功能强大且封装良好的UI组件，这些组件可以在任何现代网页中使用，无论它们使用什么框架或库。

主要优势包括：

1. **浏览器原生支持** - 不依赖于特定框架
2. **真正的封装** - Shadow DOM提供了CSS和DOM的隔离
3. **可重用性** - 组件可以在不同项目间共享
4. **与框架兼容** - 可以与React、Vue、Angular等框架一起使用
5. **标准化** - 遵循Web标准，确保长期支持

Web Components代表了构建Web应用的未来发展方向，提供了一种创建跨框架、可维护和可重用组件的标准方式。 