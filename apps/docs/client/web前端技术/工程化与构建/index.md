# 工程化与构建

## 简介

前端工程化是指将前端开发流程规范化、标准化，通过工具、框架和最佳实践提高开发效率和代码质量。随着Web应用复杂度的提升，工程化已成为现代前端开发的基础支柱。

本节内容涵盖构建工具、包管理器、代码质量工具、自动化测试等前端工程化核心技术，帮助开发者构建高效、可维护的前端项目。

## 技术领域

### 构建工具
- **基础构建工具**
  - Webpack
  - Vite
  - Rollup
  - esbuild
  - Parcel
- **任务运行器**
  - npm scripts
  - Gulp
  - Grunt

### 开发工具链
- **包管理器**
  - npm
  - Yarn
  - pnpm
- **[命令行工具(CLI)](./前端CLI工具开发与应用.md)**
  - 脚手架工具
  - 自定义CLI开发
  - 常用工具链
- **开发服务器**
  - 热更新
  - 代理配置
  - 模拟数据

### 代码质量与规范
- **代码检查**
  - ESLint
  - StyleLint
  - TypeScript
- **代码格式化**
  - Prettier
  - EditorConfig
- **提交规范**
  - Husky
  - lint-staged
  - Commitizen
  - Commitlint

### 测试与持续集成
- **单元测试**
  - Jest
  - Vitest
  - Mocha/Chai
- **组件测试**
  - Testing Library
  - Enzyme
  - Storybook
- **端到端测试**
  - Cypress
  - Playwright
  - Puppeteer
- **持续集成/持续部署**
  - GitHub Actions
  - GitLab CI/CD
  - Jenkins

### 优化与部署
- **性能优化**
  - 打包优化
  - 代码分割
  - 懒加载
  - Tree Shaking
- **部署策略**
  - 静态托管
  - 容器化部署
  - 灰度发布
  - CDN配置

## 最佳实践

- 选择适合项目规模的工具链
- 建立统一的团队编码规范
- 自动化测试保障代码质量
- 性能指标监控与优化
- 模块化设计与微前端架构
- 持续集成与自动化部署
- 项目文档与注释规范

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