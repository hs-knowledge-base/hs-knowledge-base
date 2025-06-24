# 贡献指南

感谢您对火山知识库项目的关注和贡献！

## 🤝 如何贡献

### 内容贡献

1. **新增技术文章**
   - 在对应的技术领域目录下创建新的markdown文件
   - 确保内容质量高、结构清晰、示例完整
   - 遵循现有的文档格式和命名规范

2. **修正错误**
   - 修正文档中的技术错误、拼写错误或链接失效
   - 改进文档的可读性和准确性

3. **完善现有内容**
   - 补充更多示例代码
   - 添加最佳实践建议
   - 更新过时的技术信息

### 功能改进

1. **网站功能优化**
   - 改进VitePress主题和配置
   - 优化用户体验和页面性能
   - 添加新的组件或功能

2. **工程化改进**
   - 改进构建流程和部署配置
   - 添加自动化检查和测试
   - 优化开发环境配置

## 📝 提交流程

1. **Fork 仓库**
   ```bash
   # 在GitHub上Fork本仓库到你的账户
   ```

2. **创建分支**
   ```bash
   # 格式 <type>/<scope>/<feature-name>
   
   # 功能分支
   git checkout -b feature/docs/add-search
   git checkout -b feature/app1/user-auth
   ```

3. **本地开发**
   ```bash
   # 安装依赖
   pnpm install
   
   # 启动开发服务器
   pnpm docs:dev
   ```

4. **提交更改**
   ```bash
   git add .
   
   # 文档内容相关修改
   git commit -m "feat(docs/client): 添加React Hooks最佳实践文档"
   git commit -m "feat(docs/server): 更新PostgreSQL性能优化指南"
   git commit -m "feat(docs/ai): 新增大语言模型应用示例"
   git commit -m "fix(docs/client): 修正React文档中的错误"
   
   # 应用功能相关修改
   git commit -m "feat(docs): 添加文档搜索功能"
   git commit -m "feat(app1): 实现用户认证功能"
   git commit -m "fix(docs): 修复移动端导航栏显示问题"
   git commit -m "fix(app1): 修复登录错误处理"
   git commit -m "style(docs): 优化深色模式配色方案"
   
   # 特定功能区域的修改
   git commit -m "feat(docs/theme): 新增自定义主题切换功能"
   git commit -m "feat(app1/auth): 添加OAuth认证支持"
   git commdit -m "refactor(docs/component): 重构代码示例组件"
   git commit -m "perf(docs/build): 优化构建速度"
   
   # monorepo整体修改
   git commit -m "build: 更新构建配置"
   git commit -m "ci: 优化CI工作流"
   git commit -m "chore: 更新依赖版本"
   ```

5. **推送分支**
   ```bash
   # 推送你的分支到远程仓库
   git push origin <branch-name>
   ```

6. **创建Pull Request**
   - 在GitHub上创建PR
   - 详细描述你的更改内容
   - 等待代码审查和合并

## 📝 提交规范

### 提交消息格式

我们采用[约定式提交规范](https://www.conventionalcommits.org/zh-hans/)，格式为：

```
<type>(<scope>): <subject>
```

#### 类型(type)

- `feat`: ✨ 新功能或特性
- `fix`: 🐛 修复bug
- `docs`: 📝 文档更新
- `style`: 🎨 代码风格或UI样式更改(不影响代码功能)
- `refactor`: ♻️ 代码重构(既不是新增功能，也不是修复bug)
- `perf`: 🚀 性能优化
- `test`: 🧪 添加或修改测试
- `build`: 👷 构建系统或外部依赖变更
- `ci`: ⚙️ CI配置和脚本变更
- `chore`: 🔨 日常维护性工作(不修改src或test)
- `revert`: ⏪ 回滚之前的提交

#### 作用域(scope)

作用域用于说明提交影响的范围，在我们的项目中主要包括：

- **应用级别作用域**
  - `docs`: VitePress文档站点应用
  - `app1`: 示例应用1
  - `app2`: 示例应用2
  - 其他应用名称

- **Monorepo基础设施作用域**
  - `monorepo`: Monorepo基础设施相关修改（包括工作区配置、依赖管理、构建脚本等）

#### 提交消息示例

```bash
# 文档内容相关修改
git commit -m "feat(docs/client): 添加React Hooks最佳实践文档"
git commit -m "feat(docs/server): 更新PostgreSQL性能优化指南"
git commit -m "feat(docs/ai): 新增大语言模型应用示例"
git commit -m "fix(docs/client): 修正React文档中的错误"

# 应用功能相关修改
git commit -m "feat(docs): 添加文档搜索功能"
git commit -m "feat(app1): 实现用户认证功能"
git commit -m "fix(docs): 修复移动端导航栏显示问题"
git commit -m "style(docs): 优化深色模式配色方案"

# 特定功能区域的修改
git commit -m "feat(docs/theme): 新增自定义主题切换功能"
git commit -m "feat(app1/auth): 添加OAuth认证支持"
git commit -m "refactor(docs/component): 重构代码示例组件"
git commit -m "perf(docs/build): 优化构建速度"

# Monorepo基础设施修改
git commit -m "build(monorepo): 更新Turborepo构建配置"
git commit -m "ci(monorepo): 优化GitHub Actions工作流"
git commit -m "chore(monorepo): 更新所有包的依赖版本"
git commit -m "feat(monorepo): 添加新的子包结构"
git commit -m "fix(monorepo): 修复版本发布脚本错误"
```

### 分支命名规范

分支命名应当清晰表达目的和作用域：

1. **功能分支**
   ```
   feature/<scope>/<feature-name>
   ```
   例如: 
   - `feature/docs/add-search` (文档站点功能)
   - `feature/app1/user-auth` (应用1功能)
   - `feature/ui/button-component` (UI组件库功能)

2. **Monorepo基础设施分支**
   ```
   feature/monorepo/<feature-name>
   ```
   例如:
   - `feature/monorepo/workspace-config` (工作区配置修改)
   - `feature/monorepo/build-pipeline` (构建流水线改进)

3. **修复分支**
   ```
   fix/<scope>/<bug-name>
   ```
   例如:
   - `fix/docs/broken-links` (修复文档知识库链接)
   - `fix/monorepo/build-error` (修复monorepo构建错误)

分支名应使用小写字母和连字符，清晰描述分支用途，并尽量保持简洁。

## ✍️ 内容规范

### 文档格式

- 使用Markdown格式编写
- 文件名使用英文，使用kebab-case命名法（如：react-hooks.md）
- 代码块需要指定语言类型
- 图片放在`public/img/`目录下，按照内容分类存放

### 内容质量

- 确保技术内容的准确性和时效性
- 提供实际可运行的代码示例
- 包含必要的概念解释和背景知识
- 遵循简洁明了的写作风格
- 每个技术目录应有index.md作为该技术的概述

### 目录结构

请遵循现有的目录分类：

```
apps/docs/
├── client/       # 客户端技术
│   ├── react/    # React相关技术
│   ├── vue/      # Vue相关技术
│   └── ...
├── server/       # 服务端技术
│   ├── node/     # Node.js相关技术
│   ├── java/     # Java相关技术
│   └── ...
├── systems/      # 系统与底层
│   ├── linux/    # Linux相关技术
│   └── ...
├── devops/       # DevOps与云原生
│   ├── docker/   # Docker相关技术
│   └── ...
├── ai/           # AI应用与大模型
│   ├── llm/      # 大语言模型
│   └── ...
```

每个技术子目录应包含：
- `index.md` - 该技术的概述
- 具体技术点的文档（如：react/hooks.md）
- 相关最佳实践文档（如：react/best-practices.md）

## 🔍 审查标准

提交的内容将按以下标准进行审查：

1. **技术准确性** - 内容在技术上是否正确
2. **实用性** - 是否对读者有实际帮助
3. **完整性** - 是否包含必要的说明和示例
4. **格式规范** - 是否符合项目的格式要求
5. **原创性** - 如果引用他人内容，需要明确标注来源

## 📞 联系方式

如果您有任何问题或建议，可以通过以下方式联系：

- 在GitHub上创建Issue
- 在PR中留言讨论
- 通过邮件联系项目维护者

再次感谢您的贡献！🎉 
