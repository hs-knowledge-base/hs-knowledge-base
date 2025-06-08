# 浏览器与API

## 简介

浏览器是Web应用的运行环境，而Web API是浏览器提供给开发者的编程接口，使JavaScript能够与浏览器及其功能进行交互。随着Web平台的发展，现代浏览器提供了越来越丰富的API，使Web应用能够实现过去只有原生应用才能实现的功能。

本节内容涵盖浏览器工作原理、DOM操作、网络请求、存储、多媒体处理等Web API，帮助开发者充分利用Web平台的能力。

## 技术领域

### 浏览器工作原理
- 渲染引擎
  - 解析HTML与CSS
  - 渲染树构建
  - 布局与绘制
  - 合成与GPU加速
- JavaScript引擎
  - JIT编译
  - 垃圾回收
  - 内存管理
  - 代码优化
- 浏览器安全模型
  - 同源策略
  - CSP内容安全策略
  - CORS跨域资源共享
  - Web安全最佳实践

### DOM与事件
- DOM操作
  - 选择器与遍历
  - 元素操作
  - 属性与样式
  - Shadow DOM
- 事件系统
  - 事件传播
  - 事件委托
  - 自定义事件
  - 性能优化

### 网络API
- Fetch API
  - 请求与响应
  - Headers与Body
  - AbortController
  - 缓存控制
- WebSocket
  - 连接建立与维护
  - 数据帧
  - 心跳机制
  - 断线重连
- HTTP演进
  - HTTP/2
  - HTTP/3 (QUIC)
  - 性能优化
  - 安全传输

### 存储与缓存
- Web Storage
  - localStorage
  - sessionStorage
  - 存储限制
  - 安全考量
- IndexedDB
  - 数据库操作
  - 事务与索引
  - 并发控制
  - 大数据处理
- Cache API
  - Service Worker缓存
  - 缓存策略
  - 预缓存
  - 离线优先

### 现代Web API
- Web Components
  - Custom Elements
  - Shadow DOM
  - HTML Templates
  - CSS定制属性
- 文件与媒体
  - File API
  - Media API
  - WebRTC
  - 媒体捕获与处理
- 硬件接入
  - Web Bluetooth
  - Web USB
  - Web Serial
  - Geolocation

## 代码示例

```js
// Service Worker示例 - 离线优先缓存策略
// service-worker.js

// 缓存名称与版本
const CACHE_NAME = 'my-app-cache-v1';

// 需要缓存的资源列表
const CACHED_URLS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/main.js',
  '/images/logo.png',
  '/offline.html'
];

// 安装事件 - 预缓存核心资源
self.addEventListener('install', event => {
  console.log('Service Worker 安装中...');
  
  // 确保Service Worker不会在安装完成前终止
  event.waitUntil(
    // 打开指定名称的缓存
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开，开始预缓存资源');
        // 缓存所有指定的URL
        return cache.addAll(CACHED_URLS);
      })
      .then(() => {
        // 跳过等待，直接激活
        return self.skipWaiting();
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  console.log('Service Worker 已激活');
  
  // 确保激活不会被中断
  event.waitUntil(
    // 获取所有缓存名称
    caches.keys()
      .then(cacheNames => {
        // 删除旧版本缓存
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('删除旧缓存:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // 接管所有客户端
        return self.clients.claim();
      })
  );
});

// 请求拦截 - 实现离线优先策略
self.addEventListener('fetch', event => {
  console.log('拦截请求:', event.request.url);
  
  event.respondWith(
    // 缓存优先，网络回退策略
    caches.match(event.request)
      .then(cachedResponse => {
        // 如果缓存中存在响应，直接返回
        if (cachedResponse) {
          console.log('从缓存返回:', event.request.url);
          return cachedResponse;
        }
        
        // 缓存中没有，尝试从网络获取
        console.log('缓存未命中，从网络获取:', event.request.url);
        return fetch(event.request)
          .then(networkResponse => {
            // 检查是否是有效响应
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // 克隆响应，因为响应流只能使用一次
            const responseToCache = networkResponse.clone();
            
            // 更新缓存
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          })
          .catch(error => {
            // 网络请求失败，返回离线页面
            console.log('网络请求失败，返回离线页面');
            return caches.match('/offline.html');
          });
      })
  );
});
```

## 最佳实践

- 理解浏览器渲染流程
- 避免频繁DOM操作
- 合理使用事件委托
- 实现渐进式Web应用
- 优化网络请求与缓存
- 考虑跨浏览器兼容性 