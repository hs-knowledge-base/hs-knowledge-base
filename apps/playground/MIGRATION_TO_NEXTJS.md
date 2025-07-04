# Playground 迁移到 Next.js 计划

## 📋 迁移概述

将当前的 Playground 项目从原生 HTML/JS 架构迁移到现代化的 Next.js + TypeScript + Tailwind CSS + NextUI 技术栈。

## 🎯 目标技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **组件库**: NextUI
- **状态管理**: Zustand (轻量级)
- **代码编辑器**: Monaco Editor (CDN)
- **编译器**: 保持现有的编译器系统

## 📊 当前架构分析

### 现有核心模块
1. **核心系统** (`src/core/`)
   - `playground.ts` - 主控制器
   - `service-container.ts` - 依赖注入容器
   - `config-manager.ts` - 配置管理
   - `events.ts` - 事件系统

2. **编辑器系统** (`src/editor/`)
   - `monaco-manager.ts` - Monaco 编辑器管理
   - `monaco-service.ts` - Monaco 服务
   - `editor-ui.ts` - 编辑器 UI

3. **编译器系统** (`src/compiler/`)
   - `compiler-factory.ts` - 编译器工厂
   - `compilers/` - 各语言编译器

4. **运行器系统** (`src/runner/`)
   - `code-runner.ts` - 代码运行器

5. **服务层** (`src/services/`)
   - `language-service.ts` - 语言服务
   - `vendors.ts` - CDN 资源管理
   - `resource-loader.ts` - 资源加载器

6. **UI 层** (`src/ui/`)
   - `layout-manager.ts` - 布局管理
   - `interaction-manager.ts` - 交互管理

## 🚀 迁移阶段规划

### 阶段一：项目初始化和基础设置 (2-3小时)
**目标**: 创建 Next.js 项目基础架构

#### 1.1 创建 Next.js 项目
- [ ] 初始化 Next.js 14 项目
- [ ] 配置 TypeScript
- [ ] 集成 Tailwind CSS
- [ ] 安装和配置 NextUI
- [ ] 设置 ESLint 和 Prettier

#### 1.2 项目结构设计
```
apps/playground-next/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/             # React 组件
│   │   ├── ui/                 # NextUI 封装组件
│   │   ├── editor/             # 编辑器组件
│   │   ├── layout/             # 布局组件
│   │   └── playground/         # Playground 核心组件
│   ├── hooks/                  # React Hooks
│   ├── stores/                 # Zustand 状态管理
│   ├── lib/                    # 工具库和服务
│   │   ├── core/               # 核心系统 (迁移)
│   │   ├── compiler/           # 编译器系统 (迁移)
│   │   ├── services/           # 服务层 (迁移)
│   │   └── utils/              # 工具函数
│   ├── types/                  # TypeScript 类型定义
│   └── constants/              # 常量定义
├── public/                     # 静态资源
├── tailwind.config.js
├── next.config.js
└── package.json
```

#### 1.3 基础配置文件
- [ ] `next.config.js` - Next.js 配置
- [ ] `tailwind.config.js` - Tailwind 配置
- [ ] `tsconfig.json` - TypeScript 配置

### 阶段二：核心系统迁移 (4-5小时)
**目标**: 迁移核心业务逻辑到 Next.js 环境

#### 2.1 状态管理设计
- [ ] 创建 Zustand stores
  - `usePlaygroundStore` - 主要状态
  - `useEditorStore` - 编辑器状态
  - `useConfigStore` - 配置状态
  - `useCompilerStore` - 编译器状态

#### 2.2 核心系统迁移
- [ ] 迁移 `service-container.ts` → `lib/core/service-container.ts`
- [ ] 迁移 `config-manager.ts` → `lib/core/config-manager.ts`
- [ ] 迁移 `events.ts` → `lib/core/events.ts`
- [ ] 适配 React 环境的事件系统

#### 2.3 服务层迁移
- [ ] 迁移 `language-service.ts`
- [ ] 迁移 `vendors.ts`
- [ ] 迁移 `resource-loader.ts`
- [ ] 适配 Next.js 的资源加载机制

### 阶段三：编辑器系统重构 (5-6小时)
**目标**: 将 Monaco Editor 集成到 React 组件中

#### 3.1 Monaco Editor React 组件
- [ ] 创建 `MonacoEditor` 组件
- [ ] 创建 `EditorPanel` 组件
- [ ] 创建 `LanguageSelector` 组件
- [ ] 处理 SSR 兼容性问题

#### 3.2 编辑器功能迁移
- [ ] 迁移语言配置逻辑
- [ ] 迁移主题系统
- [ ] 迁移快捷键支持
- [ ] 迁移代码格式化功能

#### 3.3 编辑器状态管理
- [ ] 使用 Zustand 管理编辑器状态
- [ ] 实现代码同步机制
- [ ] 实现撤销/重做功能

### 阶段四：编译器系统适配 (3-4小时)
**目标**: 适配编译器系统到 Next.js 环境

#### 4.1 编译器迁移
- [ ] 迁移 `compiler-factory.ts`
- [ ] 迁移各语言编译器
- [ ] 适配 Web Worker (如果需要)

#### 4.2 编译结果组件
- [ ] 创建 `CompilerOutput` 组件
- [ ] 创建 `CodeComparison` 组件
- [ ] 实现编译错误显示

### 阶段五：UI 组件开发 (6-8小时)
**目标**: 使用 NextUI 重建用户界面

#### 5.1 布局组件
- [ ] `PlaygroundLayout` - 主布局
- [ ] `Header` - 顶部工具栏
- [ ] `EditorArea` - 编辑器区域
- [ ] `ResultArea` - 结果显示区域
- [ ] `Sidebar` - 侧边栏 (可选)

#### 5.2 功能组件
- [ ] `RunButton` - 运行按钮
- [ ] `LanguageSelector` - 语言选择器
- [ ] `ThemeToggle` - 主题切换
- [ ] `SettingsPanel` - 设置面板
- [ ] `ConsolePanel` - 控制台面板

#### 5.3 交互组件
- [ ] `LoadingSpinner` - 加载指示器
- [ ] `ErrorBoundary` - 错误边界
- [ ] `Toast` - 通知组件
- [ ] `Modal` - 模态框组件

### 阶段六：代码运行器重构 (4-5小时)
**目标**: 重构代码运行器为 React 组件

#### 6.1 运行器组件
- [ ] `CodeRunner` 组件
- [ ] `PreviewFrame` 组件
- [ ] `ConsoleOutput` 组件

#### 6.2 运行器功能
- [ ] 迁移代码执行逻辑
- [ ] 迁移控制台捕获
- [ ] 迁移错误处理

### 阶段七：响应式设计和优化 (3-4小时)
**目标**: 实现响应式设计和性能优化

#### 7.1 响应式设计
- [ ] 移动端适配
- [ ] 平板端适配
- [ ] 桌面端优化

#### 7.2 性能优化
- [ ] 代码分割
- [ ] 懒加载
- [ ] 缓存策略

### 阶段八：测试和文档 (2-3小时)
**目标**: 完善测试和文档

#### 8.1 测试
- [ ] 单元测试
- [ ] 集成测试
- [ ] E2E 测试

#### 8.2 文档
- [ ] 组件文档
- [ ] API 文档
- [ ] 部署文档

## 📝 迁移注意事项

### 技术考虑
1. **SSR 兼容性**: Monaco Editor 需要客户端渲染
2. **状态管理**: 使用 Zustand 替代原有的事件系统
3. **样式迁移**: 将现有 CSS 转换为 Tailwind CSS
4. **类型安全**: 确保所有组件都有完整的 TypeScript 类型

### 功能保持
1. **核心功能**: 保持所有现有功能不变
2. **性能**: 确保迁移后性能不降低
3. **用户体验**: 保持或改善用户体验

### 风险控制
1. **渐进式迁移**: 一个阶段一个阶段进行
2. **功能验证**: 每个阶段完成后进行功能验证
3. **回滚计划**: 准备回滚到原版本的方案

## 🎯 成功标准

1. **功能完整性**: 所有原有功能正常工作
2. **性能指标**: 加载时间和运行性能不降低
3. **代码质量**: TypeScript 类型覆盖率 > 95%
4. **用户体验**: 界面更现代化，交互更流畅
5. **可维护性**: 代码结构清晰，易于维护和扩展

## 📅 时间估算

- **总计**: 30-40 小时
- **建议周期**: 2-3 周
- **每日投入**: 2-3 小时

## 🚀 开始迁移

准备好开始迁移了吗？我们将从阶段一开始，逐步完成整个迁移过程！
