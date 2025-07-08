# 🚀 React 生态展示平台

一个基于 Next.js 构建的 React 生态技术展示平台，提供实时代码编辑和预览功能，帮助开发者学习和掌握 React 最佳实践。

## ✨ 特性

- 🎯 **实时代码编辑** - 基于 React Live 的在线代码编辑器
- 📱 **响应式设计** - 适配桌面和移动设备
- 🎨 **现代 UI** - 使用 Tailwind CSS 和 Shadcn UI 组件库
- 🔧 **TypeScript 支持** - 完整的类型安全保障
- 📦 **CDN 依赖加载** - 支持动态加载第三方库
- 🎪 **多样化案例** - 涵盖 React Hooks、性能优化、自定义 Hooks 等

## 🛠️ 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + Shadcn UI
- **代码编辑**: React Live + Monaco Editor
- **图标**: Lucide React
- **构建**: Turbopack
- **代码质量**: ESLint + Prettier

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── demo/[id]/         # 动态演示页面
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   └── layout/           # 布局组件
├── lib/                  # 核心库
│   ├── demos/           # 演示案例系统
│   ├── cdn-loader.ts    # CDN 依赖加载器
│   └── react-live/      # React Live 配置
└── styles/              # 全局样式
```

## 🚀 快速开始

### 环境要求

- Node.js 18.17 或更高版本
- npm、yarn、pnpm 或 bun

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm run start
```
