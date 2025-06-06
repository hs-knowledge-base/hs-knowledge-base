# 浏览器API和Web API (一)：网络请求与存储

浏览器API和Web API为JavaScript提供了丰富的功能，使开发者能够构建复杂、交互性强的Web应用程序。本文将介绍几个最常用的浏览器和Web API及其实际应用场景。

## Fetch API和网络请求

Fetch API提供了一个现代化的接口，用于进行网络请求，它替代了传统的XMLHttpRequest，提供了更简洁、更灵活的语法。

### 基本用法

```javascript
// 基本GET请求
fetch('https://api.example.com/data')
  .then(response => {
    // 检查响应状态
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json(); // 解析JSON响应
  })
  .then(data => {
    console.log('Data received:', data);
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });

// 使用async/await
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Data received:', data);
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
```

### 配置请求选项

```javascript
// POST请求
fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  },
  body: JSON.stringify({
    name: '张三',
    email: 'zhangsan@example.com'
  })
})
.then(response => response.json())
.then(data => console.log('Created user:', data));

// 上传文件
const formData = new FormData();
const fileInput = document.querySelector('#file-input');
formData.append('file', fileInput.files[0]);
formData.append('user', 'zhangsan');

fetch('https://api.example.com/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log('Upload successful:', data));
```

### 处理不同类型的响应

```javascript
fetch('https://api.example.com/data')
  .then(response => {
    // 检查内容类型
    const contentType = response.headers.get('Content-Type');
    
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else if (contentType && contentType.includes('text/html')) {
      return response.text();
    } else if (contentType && contentType.includes('image/')) {
      return response.blob();
    }
    
    throw new Error(`Unsupported content type: ${contentType}`);
  })
  .then(data => {
    // 根据数据类型处理
    if (typeof data === 'object') {
      console.log('Received JSON:', data);
    } else if (typeof data === 'string') {
      console.log('Received text:', data);
    } else if (data instanceof Blob) {
      const imageUrl = URL.createObjectURL(data);
      const image = document.createElement('img');
      image.src = imageUrl;
      document.body.appendChild(image);
    }
  });
```

### 请求控制与超时

```javascript
// 使用AbortController取消请求
const controller = new AbortController();
const { signal } = controller;

// 超时设置
setTimeout(() => {
  controller.abort();
  console.log('Request timed out');
}, 5000);

fetch('https://api.example.com/large-data', { signal })
  .then(response => response.json())
  .then(data => console.log('Data received:', data))
  .catch(error => {
    if (error.name === 'AbortError') {
      console.log('Request was aborted');
    } else {
      console.error('Fetch error:', error);
    }
  });
```

### 实用场景：带防抖的搜索

```javascript
// 实现搜索功能
const searchInput = document.querySelector('#search-input');
const resultsContainer = document.querySelector('#results');
let controller;
let debounceTimeout;

searchInput.addEventListener('input', (e) => {
  const searchTerm = e.target.value.trim();
  
  // 清除之前的超时
  clearTimeout(debounceTimeout);
  
  // 取消上一次请求
  if (controller) {
    controller.abort();
  }
  
  if (searchTerm.length < 3) {
    resultsContainer.innerHTML = '';
    return;
  }
  
  // 设置防抖，延迟300ms执行
  debounceTimeout = setTimeout(async () => {
    controller = new AbortController();
    
    try {
      resultsContainer.innerHTML = '<p>Searching...</p>';
      
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`, {
        signal: controller.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const results = await response.json();
      
      // 显示结果
      if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No results found</p>';
      } else {
        resultsContainer.innerHTML = results
          .map(item => `<div class="result-item">${item.title}</div>`)
          .join('');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        resultsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
        console.error('Search error:', error);
      }
    }
  }, 300);
});
```

## 本地存储API

Web应用经常需要在客户端存储数据，浏览器提供了多种存储机制来满足不同的需求。

### localStorage和sessionStorage

Web Storage API提供了两种简单的键值对存储机制：localStorage和sessionStorage。

```javascript
// localStorage - 持久性存储，没有过期时间
// 存储数据
localStorage.setItem('username', '张三');
localStorage.setItem('preferences', JSON.stringify({
  theme: 'dark',
  fontSize: 'medium'
}));

// 读取数据
const username = localStorage.getItem('username');
const preferences = JSON.parse(localStorage.getItem('preferences'));

console.log(username); // '张三'
console.log(preferences.theme); // 'dark'

// 删除数据
localStorage.removeItem('username');

// 清空所有数据
localStorage.clear();

// 获取所有键
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  console.log(`${key}: ${value}`);
}

// sessionStorage - 会话级存储，关闭标签页后清除
sessionStorage.setItem('currentPage', 'dashboard');
const currentPage = sessionStorage.getItem('currentPage');
```

### IndexedDB

IndexedDB是一个强大的客户端数据库系统，适合存储大量结构化数据。

```javascript
// 打开数据库
const request = indexedDB.open('MyDatabase', 1);

// 创建架构
request.onupgradeneeded = event => {
  const db = event.target.result;
  
  // 创建对象仓库
  const store = db.createObjectStore('users', { keyPath: 'id' });
  
  // 创建索引
  store.createIndex('name', 'name', { unique: false });
  store.createIndex('email', 'email', { unique: true });
};

// 成功处理
request.onsuccess = event => {
  const db = event.target.result;
  
  // 添加数据
  function addUser(user) {
    const transaction = db.transaction(['users'], 'readwrite');
    const store = transaction.objectStore('users');
    const request = store.add(user);
    
    request.onsuccess = () => {
      console.log('User added successfully');
    };
    
    transaction.onerror = event => {
      console.error('Transaction error:', event.target.error);
    };
  }
  
  // 读取数据
  function getUser(id) {
    const transaction = db.transaction(['users']);
    const store = transaction.objectStore('users');
    const request = store.get(id);
    
    request.onsuccess = event => {
      const user = event.target.result;
      console.log('User retrieved:', user);
    };
  }
  
  // 使用索引查询
  function getUsersByName(name) {
    const transaction = db.transaction(['users']);
    const store = transaction.objectStore('users');
    const index = store.index('name');
    const request = index.getAll(name);
    
    request.onsuccess = event => {
      const users = event.target.result;
      console.log('Users found:', users);
    };
  }
  
  // 使用游标遍历
  function getAllUsers() {
    const transaction = db.transaction(['users']);
    const store = transaction.objectStore('users');
    const request = store.openCursor();
    const users = [];
    
    request.onsuccess = event => {
      const cursor = event.target.result;
      if (cursor) {
        users.push(cursor.value);
        cursor.continue();
      } else {
        console.log('All users:', users);
      }
    };
  }
  
  // 添加示例数据
  addUser({ id: 1, name: '张三', email: 'zhangsan@example.com' });
  addUser({ id: 2, name: '李四', email: 'lisi@example.com' });
  
  // 查询数据
  getUser(1);
  getUsersByName('张三');
  getAllUsers();
};

// 错误处理
request.onerror = event => {
  console.error('Database error:', event.target.error);
};
```

### Cookies

虽然相对较老，但Cookie仍然是在浏览器和服务器之间传递数据的重要方式。

```javascript
// 设置Cookie
function setCookie(name, value, days, options = {}) {
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    cookie += `; expires=${date.toUTCString()}`;
  }
  
  if (options.path) cookie += `; path=${options.path}`;
  if (options.domain) cookie += `; domain=${options.domain}`;
  if (options.secure) cookie += '; secure';
  if (options.sameSite) cookie += `; samesite=${options.sameSite}`;
  
  document.cookie = cookie;
}

// 获取Cookie
function getCookie(name) {
  const nameEQ = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  
  return null;
}

// 删除Cookie
function deleteCookie(name) {
  setCookie(name, '', -1);
}

// 使用示例
setCookie('session', 'abc123', 7, { path: '/', secure: true, sameSite: 'strict' });
const sessionId = getCookie('session');
console.log('Session ID:', sessionId);
```

### Cache API

Cache API主要用于PWA(渐进式Web应用)中，可以缓存网络请求和响应，实现离线访问。

```javascript
// 打开缓存
async function openCache() {
  return await caches.open('my-cache-v1');
}

// 缓存资源
async function cacheResources(urls) {
  const cache = await openCache();
  await cache.addAll(urls);
}

// 从缓存或网络获取资源
async function fetchWithCache(request) {
  const cache = await openCache();
  
  // 先查找缓存
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // 如果没有缓存，从网络获取
  try {
    const networkResponse = await fetch(request);
    
    // 复制响应并存入缓存
    if (networkResponse.ok) {
      const clonedResponse = networkResponse.clone();
      cache.put(request, clonedResponse);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Fetch failed:', error);
    // 可以返回一个备用响应
    return new Response('Network error', { status: 408 });
  }
}

// 在Service Worker中使用
/*
self.addEventListener('install', event => {
  event.waitUntil(
    cacheResources([
      '/',
      '/index.html',
      '/styles.css',
      '/script.js',
      '/images/logo.png'
    ])
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetchWithCache(event.request)
  );
});
*/
```

## 实际应用场景

### 自动保存表单数据

```javascript
// 自动保存用户输入的表单数据
const form = document.querySelector('#contact-form');

// 监听输入变化，自动保存
form.addEventListener('input', event => {
  const formData = new FormData(form);
  const data = {};
  
  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }
  
  localStorage.setItem('savedForm', JSON.stringify(data));
});

// 页面加载时恢复表单数据
window.addEventListener('load', () => {
  try {
    const savedData = JSON.parse(localStorage.getItem('savedForm'));
    
    if (savedData) {
      // 填充表单
      Object.entries(savedData).forEach(([key, value]) => {
        const field = form.elements[key];
        if (field) {
          field.value = value;
        }
      });
    }
  } catch (error) {
    console.error('Error restoring form:', error);
  }
});
```

### 离线数据同步

```javascript
class OfflineSync {
  constructor() {
    this.pendingActions = [];
    this.isOnline = navigator.onLine;
    
    // 从存储加载未同步的操作
    this.loadPendingActions();
    
    // 监听在线状态变化
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.sync();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }
  
  async loadPendingActions() {
    try {
      const actions = localStorage.getItem('pendingActions');
      this.pendingActions = actions ? JSON.parse(actions) : [];
    } catch (error) {
      console.error('Failed to load pending actions:', error);
      this.pendingActions = [];
    }
  }
  
  savePendingActions() {
    localStorage.setItem('pendingActions', JSON.stringify(this.pendingActions));
  }
  
  addAction(action) {
    this.pendingActions.push({
      ...action,
      timestamp: Date.now()
    });
    
    this.savePendingActions();
    
    if (this.isOnline) {
      this.sync();
    }
  }
  
  async sync() {
    if (!this.isOnline || this.pendingActions.length === 0) {
      return;
    }
    
    console.log('Syncing pending actions...');
    
    const actionsToSync = [...this.pendingActions];
    
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ actions: actionsToSync })
      });
      
      if (response.ok) {
        // 移除已同步的操作
        this.pendingActions = this.pendingActions.filter(
          action => !actionsToSync.some(a => a.timestamp === action.timestamp)
        );
        
        this.savePendingActions();
        console.log('Sync completed successfully');
      } else {
        console.error('Sync failed:', await response.text());
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  }
}

// 使用示例
const syncManager = new OfflineSync();

document.querySelector('#add-button').addEventListener('click', () => {
  const item = {
    id: Date.now(),
    text: document.querySelector('#item-text').value
  };
  
  // 添加到本地UI
  addItemToUI(item);
  
  // 添加同步操作
  syncManager.addAction({
    type: 'CREATE_ITEM',
    data: item
  });
});
```

### 主题设置持久化

```javascript
// 主题管理器
class ThemeManager {
  constructor() {
    this.themes = ['light', 'dark', 'system'];
    this.currentTheme = localStorage.getItem('theme') || 'system';
    
    // 初始应用主题
    this.applyTheme(this.currentTheme);
    
    // 监听系统主题变化
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // 初始检查
      if (this.currentTheme === 'system') {
        this.applySystemTheme(mediaQuery.matches);
      }
      
      // 变化监听
      mediaQuery.addEventListener('change', e => {
        if (this.currentTheme === 'system') {
          this.applySystemTheme(e.matches);
        }
      });
    }
  }
  
  setTheme(theme) {
    if (!this.themes.includes(theme)) {
      console.error(`Invalid theme: ${theme}`);
      return;
    }
    
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }
  
  applyTheme(theme) {
    if (theme === 'system') {
      const prefersDark = window.matchMedia && 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applySystemTheme(prefersDark);
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    
    // 更新UI选择状态
    document.querySelectorAll('.theme-option').forEach(el => {
      el.classList.toggle('active', el.dataset.theme === theme);
    });
  }
  
  applySystemTheme(isDark) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }
}

// 初始化主题管理器
const themeManager = new ThemeManager();

// 设置主题选择器事件
document.querySelectorAll('.theme-option').forEach(option => {
  option.addEventListener('click', () => {
    themeManager.setTheme(option.dataset.theme);
  });
});
```

## 小结

本文介绍了两种最基础的Web API类别：网络请求和本地存储。Fetch API提供了一种现代化的方式来进行网络通信，而Web Storage API、IndexedDB和其他存储机制则使应用能够在客户端保存数据。这些API构成了现代Web应用的基础，使得开发者能够创建响应迅速、可离线使用的Web应用程序。

在下一部分中，我们将探讨Canvas和WebGL图形处理API，以及Web Components等更高级的浏览器API。 