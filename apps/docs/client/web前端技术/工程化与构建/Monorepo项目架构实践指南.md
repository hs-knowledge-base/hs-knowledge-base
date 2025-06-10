# Monorepo项目架构实践指南

## 什么是Monorepo

Monorepo（单体仓库）是一种项目管理策略，它将多个相关项目的代码存储在同一个版本控制仓库中。与传统的多仓库（Multirepo）策略相比，Monorepo提供了更好的代码共享、统一的工具链和更简单的依赖管理。

Monorepo并不意味着将所有代码混合在一起，而是采用结构化的方式组织多个项目，使它们能够独立开发，同时共享通用资源。

## Monorepo的优势

1. **代码共享与复用**：所有项目在同一仓库中，便于共享组件、工具和配置
2. **统一的依赖管理**：避免依赖版本冲突，减少"我这里能运行"的问题
3. **原子性提交**：可以在一次提交中同时更新多个相关项目
4. **统一的工具链**：所有项目使用相同的构建工具、测试框架和代码规范
5. **简化的CI/CD流程**：可以针对特定更改只构建和部署受影响的项目
6. **跨项目工作流优化**：更容易处理跨项目的问题和功能开发
7. **集中式的问题追踪**：所有项目的问题可以在同一系统中管理

## Monorepo项目架构设计

合理的目录结构设计是Monorepo成功的关键。一个良好的架构应当清晰地区分最终交付的应用程序和共享的内部库或包。

### 典型的目录结构

```
my-monorepo/
├── apps/                     # 所有应用程序
│   ├── web/                  # Web应用
│   ├── admin/                # 管理后台
│   ├── mobile/               # 移动应用
│   └── docs/                 # 文档站点
├── packages/                 # 共享包/库
│   ├── ui/                   # UI组件库
│   ├── utils/                # 工具函数
│   ├── api-client/           # API客户端
│   └── config/               # 共享配置
├── tools/                    # 构建和开发工具
│   ├── eslint-config/        # ESLint配置
│   ├── typescript-config/    # TypeScript配置
│   └── scripts/              # 构建脚本
├── .github/                  # GitHub配置和工作流
├── package.json              # 根项目配置
├── pnpm-workspace.yaml       # PNPM工作区配置
├── turbo.json                # Turborepo配置
└── README.md                 # 项目文档
```

### 应用程序目录

`apps`目录包含所有最终交付给用户的完整应用程序，每个应用程序都是一个独立的项目，可以单独开发、测试和部署：

```
apps/
├── web/                      # 主Web应用
│   ├── src/                  # 源代码
│   ├── public/               # 静态资源
│   ├── package.json          # 项目配置
│   └── tsconfig.json         # TypeScript配置
├── admin/                    # 管理后台
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── mobile/                   # 移动应用
│   ├── src/
│   ├── assets/
│   ├── package.json
│   └── tsconfig.json
└── docs/                     # 文档站点
    ├── src/
    ├── public/
    ├── package.json
    └── tsconfig.json
```

## 构建Monorepo的技术选择

### 包管理工具

选择支持工作区（workspace）功能的包管理器对Monorepo至关重要：

1. **PNPM**（推荐）：磁盘空间效率高，支持工作区，安装速度快
2. **Yarn Workspaces**：成熟的工作区支持，广泛使用
3. **NPM Workspaces**：从v7开始支持工作区功能

#### PNPM配置示例（pnpm-workspace.yaml）

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tools/*'
```

### 构建协调工具

为了有效管理Monorepo中的构建过程，可以使用以下工具：

1. **Turborepo**：高性能的JavaScript构建系统，支持增量构建和缓存
2. **Nx**：全功能的构建系统和开发环境，提供丰富的工具链
3. **Lerna**：较早的Monorepo管理工具，通常与其他构建工具结合使用

#### Turborepo配置示例（turbo.json）

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts"]
    }
  }
}
```

## Monorepo项目实战指南

### 1. 初始化Monorepo项目

```bash
# 创建项目目录
mkdir my-monorepo && cd my-monorepo

# 初始化项目
pnpm init

# 创建基本目录结构
mkdir -p apps packages tools

# 配置PNPM工作区
echo "packages:" > pnpm-workspace.yaml
echo "  - 'apps/*'" >> pnpm-workspace.yaml
echo "  - 'packages/*'" >> pnpm-workspace.yaml
echo "  - 'tools/*'" >> pnpm-workspace.yaml

# 安装Turborepo
pnpm add turbo -D -w
```

### 2. 配置根目录package.json

```json
{
  "name": "my-monorepo",
  "version": "0.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*",
    "tools/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "clean": "turbo run clean && rm -rf node_modules",
    "format": "prettier --write \"**/*.{ts,tsx,md}\""
  },
  "devDependencies": {
    "prettier": "^2.8.8",
    "turbo": "^1.10.3"
  },
  "engines": {
    "node": ">=16.0.0",
    "pnpm": ">=7.0.0"
  },
  "packageManager": "pnpm@7.29.3"
}
```

### 3. 创建示例应用（apps/web）

```bash
# 进入apps目录
cd apps

# 创建Web应用 (使用你喜欢的框架，这里用Next.js示例)
pnpm create next-app web
```

### 4. 创建共享包（packages/ui）

```bash
# 进入packages目录
cd ../packages

# 创建UI库目录
mkdir ui && cd ui

# 初始化包
pnpm init
```

ui/package.json:
```json
{
  "name": "@my-monorepo/ui",
  "version": "0.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.tsx --dts --format esm,cjs",
    "dev": "tsup src/index.tsx --dts --format esm,cjs --watch",
    "lint": "eslint \"src/**/*.ts*\"",
    "clean": "rm -rf .turbo && rm -rf node_modules && rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5.0.4",
    "tsup": "^6.7.0",
    "eslint": "^8.40.0"
  },
  "peerDependencies": {
    "react": "^18.2.0"
  }
}
```

### 5. 应用程序引用共享包

修改apps/web/package.json，添加对UI库的依赖：

```json
{
  "dependencies": {
    "@my-monorepo/ui": "workspace:*",
    // 其他依赖...
  }
}
```

### 6. 设置共享的ESLint和TypeScript配置

在tools目录下创建共享配置：

```bash
mkdir -p tools/eslint-config tools/typescript-config
```

tools/eslint-config/package.json:
```json
{
  "name": "@my-monorepo/eslint-config",
  "version": "0.0.0",
  "main": "index.js",
  "dependencies": {
    "eslint-config-prettier": "^8.8.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-config-turbo": "^1.10.3"
  }
}
```

tools/typescript-config/package.json:
```json
{
  "name": "@my-monorepo/typescript-config",
  "version": "0.0.0",
  "files": [
    "base.json",
    "nextjs.json",
    "react-library.json"
  ]
}
```

## Monorepo实践技巧

### 1. 跨项目依赖管理

使用工作区（workspace）语法指定内部依赖：

```json
{
  "dependencies": {
    "@my-monorepo/ui": "workspace:*"  // 使用工作区协议
  }
}
```

### 2. 版本管理策略

两种主要的版本管理策略：

- **锁定版本（Fixed versioning）**：所有包使用相同版本号
- **独立版本（Independent versioning）**：每个包独立管理版本

### 3. CI/CD配置

使用GitHub Actions设置CI/CD流水线，仅构建和部署更改的项目：

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 16
      - uses: pnpm/action-setup@v2
        with:
          version: 7

      - name: Get pnpm store directory
        id: pnpm-cache
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT

      - uses: actions/cache@v3
        with:
          path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Test
        run: pnpm test
```

### 4. 增量构建与缓存

Turborepo的缓存功能可以显著提升构建速度：

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"],
      "cache": true
    }
  }
}
```

在CI环境中启用远程缓存：

```yaml
- name: Build with Turborepo
  run: pnpm turbo build --api="https://api.turbo.build" --token="${{ secrets.TURBO_TOKEN }}" --team="my-team"
```

### 5. 依赖分析与可视化

使用工具分析和可视化项目依赖关系：

```bash
# 使用Nx生成依赖图
npx nx graph

# 使用Turborepo生成依赖图
npx turbo run build --graph=dependency-graph.png
```

## 常见问题与解决方案

### 1. 依赖冲突

**问题**：不同应用使用同一依赖的不同版本
**解决方案**：
- 尽量在根目录中统一依赖版本
- 使用PNPM的严格依赖检查

### 2. 构建性能

**问题**：随着项目增多，构建时间变长
**解决方案**：
- 利用Turborepo的增量构建和缓存
- 只构建发生变化的项目和其依赖项

### 3. 大型仓库管理

**问题**：仓库体积变大，克隆和管理变得困难
**解决方案**：
- 使用Git shallow clone和sparse checkout
- 明确定义项目边界，避免过度集中

## 实际案例分析

### 示例：前后端分离的全栈Monorepo

```
my-full-stack-monorepo/
├── apps/
│   ├── web/              # React前端应用
│   ├── admin/            # 管理后台
│   ├── api/              # Node.js API服务
│   ├── worker/           # 后台工作进程
│   └── docs/             # 文档站点
├── packages/
│   ├── ui/               # 共享UI组件
│   ├── api-client/       # API客户端
│   ├── validation/       # 共享验证逻辑
│   ├── db/               # 数据库访问层
│   └── logger/           # 日志工具
├── tools/                # 工具和配置
│   ├── eslint-config/
│   ├── typescript-config/
│   └── jest-config/
├── package.json
└── pnpm-workspace.yaml
```

### 示例：微前端Monorepo架构

```
micro-frontend-monorepo/
├── apps/
│   ├── shell/            # 微前端容器应用
│   ├── dashboard/        # 仪表板微应用
│   ├── profile/          # 用户资料微应用
│   ├── settings/         # 设置微应用
│   └── auth/             # 认证微应用
├── packages/
│   ├── ui/               # 共享UI组件
│   ├── state/            # 共享状态管理
│   ├── router/           # 路由工具
│   └── utils/            # 通用工具函数
├── tools/
│   ├── webpack-config/   # Webpack配置
│   ├── module-federation/ # 模块联邦配置
│   └── typescript-config/
├── package.json
└── pnpm-workspace.yaml
```

## 总结

Monorepo架构为大型前端项目提供了清晰的结构和高效的协作机制。通过合理规划项目结构、选择适当的工具链、设置高效的工作流程，可以充分发挥Monorepo的优势，同时避免其潜在的复杂性。

最佳实践是根据团队规模和项目需求量身定制Monorepo策略，随着项目的增长不断优化和调整架构。成功的Monorepo不仅仅是一种技术选择，更是一种协作文化的体现。 