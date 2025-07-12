# 火山知识库平台

![火山知识库](./apps/docs/public/img/logo.png)

一个集文档、代码实践于一体的技术知识库平台，让学习更高效，分享更便捷。

## 在线访问

- [文档站点](https://hs-docs.top/) - 技术文档和知识库
- [代码编辑器](https://playground.hs-docs.top/) - 多语言在线编程环境
- [React 生态展示](https://react-showcase.hs-docs.top/) - React 生态系统展示平台
- [管理后台](https://admin.hs-docs.top/) - 后台管理系统
- [API 服务](https://api.hs-docs.top/) - 后端 API 服务

## 项目特色

- **丰富的技术文档** - 涵盖前端、后端、系统、DevOps、AI等技术领域
- **在线代码编辑** - 支持多语言代码编写、运行和分享
- **React 生态展示** - 实时代码演示和最佳实践案例
- **文档代码联动** - 文档中的代码示例可直接跳转到编辑器运行
- **完整后台管理** - 基于 Next.js 的现代化管理后台
- **强大 API 服务** - 基于 NestJS 的企业级后端服务

## 项目结构

```
hs-knowledge-base/
├── apps/
│   ├── docs/           # 技术文档站点 (VitePress)
│   ├── playground/     # 多语言代码编辑器 (Next.js)
│   ├── react-showcase/ # React 生态展示平台 (Next.js)
│   ├── admin/          # 后台管理系统 (Next.js)
│   └── server/         # API服务 (NestJS)
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

# 启动管理后台
pnpm admin:dev

# 启动后端服务
pnpm server:dev
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

**技术栈**: Next.js + React + TypeScript + Tailwind CSS + Shadcn/ui + React Live

### 管理后台 (apps/admin)
基于 Next.js 构建的现代化后台管理系统，提供用户管理、内容管理、系统配置等功能。

**技术栈**: Next.js + React + TypeScript + Tailwind CSS + Shadcn/ui

### 后端服务 (apps/server)
基于 NestJS 构建的企业级后端 API 服务，提供用户认证、权限控制、数据管理等功能。

**技术栈**: NestJS + TypeScript + TypeORM + MySQL + JWT + CASL

## 参与贡献

欢迎各种形式的贡献，包括内容修正、新功能开发和应用创意。你可以通过以下方式参与：

- 提交 Issue 或 Pull Request（请参考[贡献指南](./CONTRIBUTING.md)）
- 通过邮件或 Issue 联系项目维护者
- 分享这个项目给更多需要的人

## 许可证

MIT
