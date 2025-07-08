# 火山知识库平台

![火山知识库](./apps/docs/public/img/logo.png)

一个集文档、代码实践于一体的技术知识库平台，让学习更高效，分享更便捷。

## 在线访问

- [文档站点](http://hs-docs.top/) - 技术文档和知识库
- [代码编辑器](http://playground.hs-docs.top/) - 多语言在线编程环境
- [React 生态展示](http://react-showcase.hs-docs.top/) - React 生态系统展示平台

## 项目特色

- **丰富的技术文档** - 涵盖前端、后端、系统、DevOps、AI等技术领域
- **在线代码编辑** - 支持多语言代码编写、运行和分享
- **React 生态展示** - 实时代码演示和最佳实践案例
- **文档代码联动** - 文档中的代码示例可直接跳转到编辑器运行

## 项目结构

```
hs-knowledge-base/
├── apps/
│   ├── docs/           # 技术文档站点 (VitePress)
│   ├── playground/     # 多语言代码编辑器 (Next.js)
│   └── react-showcase/ # React 生态展示平台 (Next.js)
├── packages/           # 共享包 (待开发)
└── pnpm-workspace.yaml
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动文档站点
pnpm docs:dev

# 启动代码编辑器
pnpm playground:dev

# 启动 React 展示平台
pnpm react-showcase:dev
```

## 应用介绍

### 技术文档站点 (apps/docs)
基于 VitePress 构建的技术文档站点，涵盖前端、后端、系统、DevOps、AI等技术领域。

**技术栈**: VitePress + Vue 3

### 代码编辑器 (apps/playground)
基于 Next.js 构建的多语言代码编辑器，支持在线编写、运行和分享代码。

**技术栈**: Next.js + React + TypeScript + Monaco Editor

### React 展示平台 (apps/react-showcase)
基于 Next.js 构建的 React 生态系统展示平台，提供实时代码编辑和预览功能。

**技术栈**: Next.js + React + TypeScript + Tailwind CSS + shadcn/ui + React Live

## 参与贡献

欢迎各种形式的贡献，包括内容修正、新功能开发和应用创意。你可以通过以下方式参与：

- 提交 Issue 或 Pull Request（请参考[贡献指南](./CONTRIBUTING.md)）
- 通过邮件或 Issue 联系项目维护者
- 分享这个项目给更多需要的人

## 许可证

MIT
