# 工程化与构建

## 简介

前端工程化是现代Web开发的核心实践，它通过自动化流程、标准化规范和专业工具，解决大型前端项目的复杂性、质量和协作问题。从开发、构建到部署，前端工程化贯穿整个应用生命周期。

本节内容涵盖构建工具、模块化方案、项目脚手架、自动化测试等工程化技术，帮助开发者提高开发效率和代码质量。

## 技术领域

### 构建工具
- Webpack生态系统
  - 模块打包
  - 代码分割
  - Tree Shaking
  - 缓存优化
- Vite/Rollup
  - ESM原生支持
  - 按需编译
  - 热模块替换
  - 构建优化
- Turbopack/Bun
  - Rust构建引擎
  - 增量计算
  - 并行处理
  - 内存缓存

### 包管理与依赖
- npm/yarn/pnpm
  - 依赖管理策略
  - 锁文件机制
  - Workspaces
  - 缓存优化
- Monorepo架构
  - Nx
  - Turborepo
  - Lerna
  - pnpm workspace

### 代码质量与规范
- 代码检查与格式化
  - ESLint配置与插件
  - Prettier格式化
  - StyleLint
  - 类型检查
- Git工作流
  - 分支策略
  - Commit规范
  - Git Hooks
  - CI集成

### 自动化测试
- 单元测试
  - Jest/Vitest
  - Testing Library
  - Mock与Stub
  - 测试覆盖率
- 组件测试
  - Storybook
  - Chromatic
  - Playwright组件测试
  - 视觉回归测试
- E2E测试
  - Cypress
  - Playwright
  - Selenium
  - 测试自动化

## 代码示例

```js
// vite.config.js - Vite配置示例
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
  // 插件配置
  plugins: [
    // React支持
    react(),
    
    // PWA支持
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: '我的应用',
        short_name: '应用',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
    
    // Gzip压缩
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    }),
    
    // 图片优化
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 80,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: false },
        ],
      },
    }),
    
    // 打包分析
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  
  // 构建优化配置
  build: {
    target: 'es2015',
    minify: 'terser',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // 将React相关库打包到一个chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 将其他第三方库打包到另一个chunk
          vendor: ['lodash', 'axios', 'date-fns'],
        },
      },
    },
  },
  
  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

## 最佳实践

- 选择适合项目规模的构建工具
- 优化构建性能和产物体积
- 建立代码规范和质量检查
- 实施自动化测试和持续集成
- 采用渐进式集成策略
- 优化开发体验和调试工具 