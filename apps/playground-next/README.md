# Code Playground Next.js

一个现代化的代码演练场，基于 Next.js + TypeScript + Tailwind CSS + NextUI 构建。

## 🚀 技术栈

- **框架**: Next.js 15 (App Router + Turbopack)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **组件库**: NextUI
- **状态管理**: Zustand
- **代码编辑器**: Monaco Editor (CDN)
- **编译器**: 支持 TypeScript、SCSS、Markdown 等

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 主页面
│   ├── providers.tsx      # 全局 Providers
│   └── globals.css        # 全局样式
├── components/             # React 组件
│   ├── ui/                # NextUI 封装组件
│   ├── editor/            # 编辑器组件
│   ├── layout/            # 布局组件
│   └── playground/        # Playground 核心组件
├── hooks/                 # React Hooks
├── stores/                # Zustand 状态管理
│   ├── playground-store.ts # 主要状态
│   └── layout-store.ts    # 布局状态
├── lib/                   # 工具库和服务
│   ├── core/              # 核心系统
│   ├── compiler/          # 编译器系统
│   ├── services/          # 服务层
│   └── utils/             # 工具函数
├── types/                 # TypeScript 类型定义
└── constants/             # 常量定义
```

## 🛠️ 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看结果。

### 构建生产版本

```bash
npm run build
npm start
```

### 类型检查

```bash
npm run type-check
```

### 代码检查

```bash
npm run lint
```

## 🎯 迁移进度

### ✅ 阶段一：项目初始化和基础设置 (已完成)
- [x] 创建 Next.js 项目基础架构
- [x] 配置 TypeScript、Tailwind CSS、NextUI
- [x] 设置项目结构和基础配置
- [x] 创建 Zustand 状态管理
- [x] 实现基础测试页面

### 🔄 阶段二：核心系统迁移 (进行中)
- [ ] 迁移 service-container.ts
- [ ] 迁移 config-manager.ts
- [ ] 迁移 events.ts
- [ ] 迁移 language-service.ts
- [ ] 迁移 vendors.ts
- [ ] 迁移 resource-loader.ts

### ⏳ 阶段三：编辑器系统重构
- [ ] 创建 Monaco Editor React 组件
- [ ] 迁移编辑器功能和配置
- [ ] 实现 SSR 兼容性

### ⏳ 阶段四：编译器系统适配
- [ ] 迁移编译器工厂和各语言编译器
- [ ] 创建编译结果组件

### ⏳ 阶段五：UI 组件开发
- [ ] 使用 NextUI 重建用户界面
- [ ] 实现响应式设计

### ⏳ 阶段六：代码运行器重构
- [ ] 重构代码运行器为 React 组件
- [ ] 迁移控制台和预览功能

### ⏳ 阶段七：响应式设计和优化
- [ ] 移动端适配
- [ ] 性能优化

### ⏳ 阶段八：测试和文档
- [ ] 单元测试和集成测试
- [ ] 完善文档

## 🎨 功能特性

### 当前已实现
- ✅ 现代化 UI 界面 (NextUI + Tailwind CSS)
- ✅ 响应式状态管理 (Zustand)
- ✅ 类型安全 (TypeScript)
- ✅ 主题切换 (深色/浅色)
- ✅ 数据持久化 (localStorage)

### 计划实现
- 🔄 多语言代码编辑器 (Monaco Editor)
- 🔄 实时代码编译和运行
- 🔄 控制台输出和错误显示
- 🔄 编译结果对比显示
- 🔄 代码模板和示例
- 🔄 项目导入/导出
- 🔄 快捷键支持
- 🔄 移动端适配

## 📝 开发说明

### 状态管理

项目使用 Zustand 进行状态管理，主要包含两个 store：

- `usePlaygroundStore`: 管理代码内容、编译结果、控制台消息等
- `useLayoutStore`: 管理布局配置、面板状态、响应式等

### 组件开发

- 使用 NextUI 组件库保持 UI 一致性
- 遵循 React Hooks 模式
- 支持 TypeScript 类型检查
- 使用 Tailwind CSS 进行样式定制

### 编译器集成

- 使用 CDN 动态加载编译器资源
- 支持多种编程语言
- 实现编译错误处理和显示

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
