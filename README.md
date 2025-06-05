# 火山知识库

火山知识库是一个基于 VitePress 和 Monorepo 架构的技术知识分享平台，涵盖客户端技术、服务端技术、系统底层和DevOps与云原生等领域。

## 项目结构

```
knowledge-base/
├── apps/
│   └── docs/              # VitePress 主应用
│       ├── .vitepress/    # 配置和主题
│       │   ├── config.js  # 主配置文件
│       │   ├── sidebar.js # 侧边栏生成逻辑
│       │   └── theme/     # 自定义主题
│       ├── public/        # 静态资源
│       ├── client/        # 客户端技术内容
│       ├── server/        # 服务端技术内容
│       ├── systems/       # 系统与底层内容
│       ├── devops/        # DevOps与云原生内容
│       ├── package.json   # VitePress 依赖
├── package.json           # 根项目配置
└── pnpm-workspace.yaml    # Monorepo 配置
```

## 开始使用

### 安装依赖

```bash
# 安装 pnpm（如果尚未安装）
npm install -g pnpm

# 安装所有依赖
pnpm install
```

### 本地开发

```bash
# 启动开发服务器
pnpm dev
```

### 构建静态站点

```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

## 添加新内容

1. 在相应的内容目录（`apps/docs/client/`、`apps/docs/server/`、`apps/docs/systems/`、`apps/docs/devops/`）中创建 Markdown 文件
2. 侧边栏会自动生成，无需手动配置
3. 使用相对路径链接到其他内容（例如 `/client/web/`）

## 侧边栏自动生成

本项目实现了侧边栏的自动生成功能：

- 侧边栏生成逻辑位于 `apps/docs/.vitepress/sidebar.js`
- 系统会自动扫描所有包含 `index.md` 的目录并为其生成侧边栏
- 目录标题会自动从目录名转换（首字母大写，连字符转为空格）
- Markdown 文件标题会从文件内容的一级标题（`# 标题`）中提取

### 添加新章节

1. 创建新目录并添加 `index.md` 文件
2. 在 `index.md` 中使用一级标题定义章节名称
3. 添加其他 Markdown 文件作为子页面
4. 重启开发服务器，侧边栏将自动更新

## 内容领域

- **客户端技术**：Web前端、React Native、小程序、Electron、Three.js等
- **服务端技术**：Node.js、Go、Java、Python、微服务架构等
- **系统与底层**：Rust、C/C++、系统编程、性能优化、WebAssembly等
- **DevOps与云原生**：CI/CD、容器化、Kubernetes、监控、云服务等

## 贡献指南

我们欢迎各种形式的贡献，包括内容修正、新主题添加和功能改进。请参阅 [贡献指南](./CONTRIBUTING.md) 了解更多信息。

## 许可证

MIT 