# React Showcase

一个现代化的 React 生态系统展示平台，基于 Next.js 构建，提供实时代码编辑和预览功能。

## ✨ 特性

- **实时代码演示** - 基于 React Live 的在线代码编辑器
- **丰富的案例库** - 涵盖 React Hooks、性能优化、自定义 Hooks 等
- **现代化 UI** - 使用 Tailwind CSS 和 Shadcn/ui 组件库
- **响应式设计** - 完美适配桌面端和移动端
- **TypeScript 支持** - 完整的类型安全保障
- **CDN 依赖加载** - 支持动态加载第三方库
- **多面板布局** - 代码编辑、预览、控制台三合一

## 技术栈

| 技术               | 版本 | 用途 |
|------------------|------|------|
| **Next.js**      | 15.x | React 全栈框架 |
| **React**        | 18.x | 用户界面库 |
| **TypeScript**   | 5.x | 类型安全的 JavaScript |
| **Tailwind CSS** | 4.x | 原子化 CSS 框架 |
| **Shadcn/ui**    | - | React 组件库 |
| **React Live**   | 4.x | 实时代码编辑器 |
| **Lucide React** | - | 图标库 |
| **Zod**          | 3.x | 运行时类型验证 |

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
