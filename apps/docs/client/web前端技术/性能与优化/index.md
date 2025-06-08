# 性能与优化

## 简介

Web性能优化是提升用户体验和业务价值的关键环节。在移动网络和多样化设备普及的背景下，优化网站性能不仅关系到用户体验，还直接影响业务指标，如转化率、跳出率和用户留存。

本节内容涵盖前端性能测量、关键渲染路径优化、资源加载优化、运行时性能等方面，帮助开发者构建快速响应的Web应用。

## 技术领域

### 性能测量与分析
- 性能指标
  - Core Web Vitals
  - RAIL模型
  - 首次内容绘制(FCP)
  - 最大内容绘制(LCP)
  - 首次输入延迟(FID)
  - 累积布局偏移(CLS)
- 性能监控工具
  - Lighthouse
  - Chrome DevTools
  - Web Vitals库
  - 性能API
- 用户体验指标
  - 感知性能
  - 交互性能
  - 视觉稳定性
  - A/B测试

### 加载性能优化
- 资源优化
  - 图片优化
  - JavaScript优化
  - CSS优化
  - 字体优化
- 传输优化
  - HTTP/2与HTTP/3
  - 压缩算法
  - 预连接与预获取
  - CDN策略
- 渲染优化
  - 关键CSS
  - 延迟加载
  - 内容骨架屏
  - 资源优先级

### 运行时性能
- JavaScript性能
  - 代码分割
  - 线程优化
  - Web Workers
  - WebAssembly
- 渲染性能
  - 重排与重绘
  - 合成层优化
  - 动画性能
  - 渲染阻塞优化
- 内存管理
  - 内存泄漏检测
  - 垃圾回收优化
  - 大列表虚拟化
  - 对象池

### 移动与低端设备优化
- 响应式优化
  - 自适应图片
  - 媒体查询优化
  - 设备特性检测
  - 触控优化
- 低端设备考量
  - 代码轻量化
  - 渐进增强
  - 节电优化
  - 离线支持

## 代码示例

```js
// 图片懒加载与预加载示例
// 结合Intersection Observer和优先级提示

// 懒加载实现
document.addEventListener('DOMContentLoaded', () => {
  // 创建交叉观察器
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      // 当图片进入视口
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute('data-src');
        
        if (src) {
          // 设置优先级提示
          if (img.hasAttribute('data-priority') && 'fetchPriority' in HTMLImageElement.prototype) {
            img.fetchPriority = img.getAttribute('data-priority');
          }
          
          // 加载图片
          img.src = src;
          
          // 加载后移除data-src属性
          img.removeAttribute('data-src');
          
          // 图片加载完成后停止观察
          observer.unobserve(img);
          
          // 性能标记
          if (window.performance && img.hasAttribute('data-mark')) {
            performance.mark(`img-loaded-${img.getAttribute('data-mark')}`);
          }
        }
      }
    });
  }, {
    // 根元素，默认为视口
    root: null,
    // 根边距，扩展或缩小视口
    rootMargin: '50px 0px',
    // 元素可见性触发阈值
    threshold: 0.01
  });
  
  // 为所有懒加载图片添加观察器
  const lazyImages = document.querySelectorAll('img[data-src]');
  lazyImages.forEach(img => {
    imageObserver.observe(img);
    
    // 添加加载错误处理
    img.addEventListener('error', function() {
      // 加载备用图片或显示错误提示
      this.src = '/images/fallback.png';
      this.classList.add('loading-error');
    });
  });
  
  // 预加载即将需要的图片
  function preloadNextImages() {
    const preloadImages = document.querySelectorAll('img[data-preload]');
    
    preloadImages.forEach(img => {
      const src = img.getAttribute('data-src');
      
      if (src) {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'image';
        preloadLink.href = src;
        
        if (img.hasAttribute('data-priority')) {
          preloadLink.setAttribute('fetchpriority', img.getAttribute('data-priority'));
        }
        
        document.head.appendChild(preloadLink);
      }
    });
  }
  
  // 当首屏内容加载完成后预加载后续图片
  if ('requestIdleCallback' in window) {
    requestIdleCallback(preloadNextImages);
  } else {
    setTimeout(preloadNextImages, 1000);
  }
  
  // 监控性能指标
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        // 将性能数据发送到分析服务
        console.log(`${entry.name}: ${entry.startTime.toFixed(2)}ms`);
      });
    });
    
    // 监听关键性能指标
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    observer.observe({ type: 'layout-shift', buffered: true });
    observer.observe({ type: 'mark', buffered: true });
  }
});
```

## 最佳实践

- 建立性能预算和目标
- 实施渐进式优化策略
- 分析关键渲染路径
- 优先关注用户感知指标
- 针对移动设备优化
- 实施持续性能监控 