# VitePress 贡献者组件使用说明

## 概述

本项目已集成了自动贡献者展示功能，可以在每个文档页面的底部自动显示该文档的贡献者信息。该功能基于 Git 历史记录自动分析，无需手动维护。

## 功能特性

- ✅ **自动化分析**: 基于 Git 历史自动分析每个文档的贡献者
- ✅ **中文支持**: 完全支持中文路径和文件名
- ✅ **智能显示**: 按贡献次数排序，最多显示 10 位贡献者
- ✅ **头像展示**: 自动获取 Gravatar 头像，失败时使用备用头像
- ✅ **响应式设计**: 适配桌面和移动设备
- ✅ **性能优化**: 使用虚拟模块，构建时预处理数据

## 工作原理

### 1. 构建时分析
- 扫描 `client`、`server`、`ai`、`devops`、`systems` 目录下的所有 Markdown 文件
- 通过 `git log` 分析每个文件的提交历史
- 提取贡献者姓名、邮箱和贡献次数

### 2. 自动注入
- Markdown 转换插件自动在文档末尾添加 `<Contributors>` 组件
- 跳过根目录的 `index.md` 文件（避免重复显示）

### 3. 数据提供
- 虚拟模块插件将贡献者数据注入到构建中
- 组件通过 `virtual:contributors` 模块获取数据

## 文件结构

```
.vitepress/
├── plugins/
│   ├── contributors.js          # 虚拟模块插件
│   └── markdown-transform.js    # Markdown 转换插件
├── theme/
│   ├── components/
│   │   └── Contributors.vue     # 贡献者组件
│   └── index.js                 # 主题配置（已注册组件）
├── types/
│   └── contributors.d.ts        # TypeScript 类型定义
└── vite.config.js              # Vite 配置文件

scripts/
├── contributors.js             # 贡献者分析脚本
└── test-contributors.js        # 测试脚本
```

## 使用方法

### 自动使用（推荐）
功能已自动启用，无需任何配置。构建时会自动：
1. 分析所有目标目录下的 Markdown 文件
2. 在每个文档末尾添加贡献者组件
3. 显示该文档的贡献者列表

### 手动使用
如需在特定位置手动添加贡献者组件：

```markdown
<Contributors doc-path="client/web前端技术/javascript" />
```

其中 `doc-path` 是相对于 docs 目录的路径（不包含 `.md` 扩展名）。

## 测试功能

运行测试脚本验证功能：

```bash
cd apps/docs
node scripts/test-contributors.js
```

## 自定义配置

### 修改目标目录
编辑 `scripts/contributors.js` 中的 `targetDirs` 数组：

```javascript
const targetDirs = ['client', 'server', 'ai', 'devops', 'systems', 'your-new-dir']
```

### 修改显示数量
编辑 `Contributors.vue` 组件中的切片数量：

```javascript
// 最多显示 10 个贡献者
return docContributors.slice(0, 10)
```

### 自定义样式
编辑 `Contributors.vue` 组件的 `<style>` 部分，或在 `custom.css` 中添加覆盖样式。

## 注意事项

### Git 历史依赖
- 需要完整的 Git 历史记录才能正确分析贡献者
- 重命名或移动文件可能会影响分析结果
- 建议在完整克隆的仓库中构建

### 中文兼容性
- 已设置 UTF-8 编码处理中文路径
- 设置了 `LC_ALL=C.UTF-8` 环境变量确保兼容性

### 性能考虑
- Git 历史分析会增加构建时间
- 使用批量处理和并行分析优化性能
- 贡献者数据在构建时预处理，运行时无额外开销

### 隐私保护
- 邮箱地址通过 MD5 哈希处理
- 不会在前端暴露原始邮箱地址
- 仅用于生成 Gravatar 头像链接

## 故障排除

### 贡献者信息为空
1. 检查 Git 历史是否完整
2. 确认文件路径是否正确
3. 查看控制台是否有错误信息

### 头像显示异常
1. 检查网络连接（Gravatar 需要网络访问）
2. 组件会自动回退到备用头像服务

### 构建错误
1. 确认所有依赖已安装
2. 检查 Node.js 版本（建议 16+）
3. 查看具体错误信息并根据提示修复

## 开发和调试

### 开发模式
```bash
npm run dev
```

### 构建模式
```bash
npm run build
```

### 分析贡献者数据
```bash
node scripts/test-contributors.js
```

---

如有问题或建议，请提交 Issue 或 Pull Request。 