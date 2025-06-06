# 浏览器API和Web API

Web API是浏览器提供的一组接口，允许JavaScript与浏览器和设备功能进行交互。掌握这些API对于构建现代、交互式的Web应用至关重要。本文将介绍几个重要的浏览器和Web API及其实际应用。

## Fetch API和网络请求

Fetch API提供了一个更强大、更灵活的网络请求接口，用于替代传统的XMLHttpRequest。

### 基本用法

```javascript
// 基本GET请求
fetch('https://api.example.com/data')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json(); // 或 response.text(), response.blob() 等
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

### 处理响应

```javascript
fetch('https://api.example.com/data')
  .then(response => {
    // 检查响应状态
    console.log('Status:', response.status);
    console.log('OK:', response.ok);
    
    // 获取响应头
    console.log('Content-Type:', response.headers.get('Content-Type'));
    
    // 响应类型
    if (response.headers.get('Content-Type').includes('application/json')) {
      return response.json();
    } else if (response.headers.get('Content-Type').includes('text/html')) {
      return response.text();
    } else if (response.headers.get('Content-Type').includes('image/')) {
      return response.blob();
    }
  })
  .then(data => {
    // 处理不同类型的数据
    if (typeof data === 'object') {
      // JSON数据
      console.log('JSON data:', data);
    } else if (typeof data === 'string') {
      // 文本数据
      console.log('Text data:', data);
    } else if (data instanceof Blob) {
      // Blob数据
      const url = URL.createObjectURL(data);
      const img = document.createElement('img');
      img.src = url;
      document.body.appendChild(img);
    }
  });
```

### 请求控制

```javascript
// 超时控制
const controller = new AbortController();
const { signal } = controller;

// 设置超时
setTimeout(() => controller.abort(), 5000);

fetch('https://api.example.com/data', { signal })
  .then(response => response.json())
  .catch(error => {
    if (error.name === 'AbortError') {
      console.log('Fetch aborted due to timeout');
    } else {
      console.error('Fetch error:', error);
    }
  });

// 取消请求
const fetchButton = document.querySelector('#fetch-button');
const cancelButton = document.querySelector('#cancel-button');
let controller;

fetchButton.addEventListener('click', () => {
  controller = new AbortController();
  
  fetch('https://api.example.com/large-data', { 
    signal: controller.signal 
  })
    .then(/* ... */)
    .catch(/* ... */);
});

cancelButton.addEventListener('click', () => {
  if (controller) {
    controller.abort();
    console.log('Request cancelled');
  }
});
```

### 实际应用场景

```javascript
// 实现搜索功能
const searchInput = document.querySelector('#search-input');
let controller;

searchInput.addEventListener('input', async (e) => {
  const searchTerm = e.target.value;
  
  // 取消上一次请求
  if (controller) {
    controller.abort();
  }
  
  // 创建新的控制器
  controller = new AbortController();
  
  if (searchTerm.length < 3) return;
  
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`, {
      signal: controller.signal
    });
    
    const results = await response.json();
    displayResults(results);
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Search error:', error);
    }
  }
});

// 带缓存的数据加载
const cache = new Map();

async function fetchWithCache(url, options = {}) {
  // 如果在缓存中，直接返回
  if (cache.has(url)) {
    return cache.get(url);
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  // 存入缓存
  cache.set(url, data);
  
  return data;
}
```

## 本地存储

浏览器提供了多种本地存储机制，用于在客户端保存数据。

### localStorage 和 sessionStorage

```javascript
// localStorage - 持久化存储，没有过期时间
// 存储数据
localStorage.setItem('username', '张三');
localStorage.setItem('preferences', JSON.stringify({
  theme: 'dark',
  fontSize: 'medium'
}));

// 读取数据
const username = localStorage.getItem('username');
const preferences = JSON.parse(localStorage.getItem('preferences'));

// 删除数据
localStorage.removeItem('username');

// 清空所有数据
localStorage.clear();

// sessionStorage - 会话级存储，关闭标签页后清除
sessionStorage.setItem('tempData', JSON.stringify({id: 123}));
const tempData = JSON.parse(sessionStorage.getItem('tempData'));
```

### IndexedDB

IndexedDB是一个大型的、支持索引的客户端存储系统，适合存储大量结构化数据。

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

// 处理成功
request.onsuccess = event => {
  const db = event.target.result;
  
  // 存储数据
  function addUser(user) {
    const transaction = db.transaction(['users'], 'readwrite');
    const store = transaction.objectStore('users');
    const request = store.add(user);
    
    request.onsuccess = () => {
      console.log('User added successfully');
    };
    
    transaction.oncomplete = () => {
      console.log('Transaction completed');
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
      console.log('Got user:', user);
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
      console.log('Users with name:', users);
    };
  }
  
  // 更新数据
  function updateUser(user) {
    const transaction = db.transaction(['users'], 'readwrite');
    const store = transaction.objectStore('users');
    const request = store.put(user);
    
    request.onsuccess = () => {
      console.log('User updated');
    };
  }
  
  // 删除数据
  function deleteUser(id) {
    const transaction = db.transaction(['users'], 'readwrite');
    const store = transaction.objectStore('users');
    const request = store.delete(id);
    
    request.onsuccess = () => {
      console.log('User deleted');
    };
  }
  
  // 使用游标遍历
  function listAllUsers() {
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
};

// 错误处理
request.onerror = event => {
  console.error('Database error:', event.target.error);
};
```

### Cookies

虽然相对较老，但Cookie仍然是在浏览器和服务器间传递数据的重要方式。

```javascript
// 设置Cookie
function setCookie(name, value, days) {
  let expires = '';
  
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = `; expires=${date.toUTCString()}`;
  }
  
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/`;
}

// 获取Cookie
function getCookie(name) {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    
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
setCookie('user', '张三', 7); // 存储7天
const user = getCookie('user');
deleteCookie('user');
```

### Cache API

Cache API主要用于PWA(渐进式Web应用)中，可以缓存网络请求和响应。

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
      const clone = networkResponse.clone();
      cache.put(request, clone);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Fetch failed:', error);
    // 可以返回一个备用响应
  }
}

// 清除旧缓存
async function clearOldCaches() {
  const cacheList = await caches.keys();
  
  const deletions = cacheList
    .filter(name => name !== 'my-cache-v1')
    .map(name => caches.delete(name));
  
  await Promise.all(deletions);
}

// 在Service Worker中使用
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
```

## 实际应用场景

```javascript
// 用户设置的持久化
function saveUserSettings(settings) {
  localStorage.setItem('userSettings', JSON.stringify(settings));
}

function loadUserSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem('userSettings'));
    return settings || getDefaultSettings();
  } catch (error) {
    console.error('Error loading settings:', error);
    return getDefaultSettings();
  }
}

function getDefaultSettings() {
  return {
    theme: 'light',
    fontSize: 'medium',
    notifications: true
  };
}

// 应用状态的恢复
function saveApplicationState(state) {
  sessionStorage.setItem('appState', JSON.stringify(state));
}

function restoreApplicationState() {
  try {
    return JSON.parse(sessionStorage.getItem('appState')) || {};
  } catch (error) {
    console.error('Error restoring state:', error);
    return {};
  }
}

// 表单数据的自动保存
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

// 离线应用数据同步
class DataSynchronizer {
  constructor() {
    this.offlineActions = [];
    this.isOnline = navigator.onLine;
    
    // 监听在线状态变化
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
    
    // 从IndexedDB加载未同步的操作
    this.loadPendingActions();
  }
  
  async handleOnline() {
    this.isOnline = true;
    await this.synchronize();
  }
  
  async addAction(action) {
    this.offlineActions.push(action);
    
    // 保存到IndexedDB
    await this.savePendingActions();
    
    // 如果在线，立即同步
    if (this.isOnline) {
      await this.synchronize();
    }
  }
  
  async synchronize() {
    if (!this.isOnline || this.offlineActions.length === 0) {
      return;
    }
    
    const actionsToSync = [...this.offlineActions];
    
    try {
      // 发送到服务器
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ actions: actionsToSync })
      });
      
      if (response.ok) {
        // 同步成功，清除已同步的操作
        this.offlineActions = this.offlineActions.filter(
          action => !actionsToSync.includes(action)
        );
        
        // 更新存储
        await this.savePendingActions();
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
  
  async savePendingActions() {
    // 保存到IndexedDB...
  }
  
  async loadPendingActions() {
    // 从IndexedDB加载...
  }
}
``` 