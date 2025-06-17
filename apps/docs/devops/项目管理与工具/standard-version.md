# Standard Version 使用指南

## 简介

Standard Version 是一个自动化版本管理和变更日志生成的工具，它遵循[语义化版本规范](https://semver.org/)，能够根据 Git 提交信息自动决定版本号，生成 CHANGELOG.md，并创建带版本号的 Git 标签。

使用 Standard Version 可以大大简化项目版本管理流程，确保版本号的一致性和可预测性，同时提供清晰的变更记录。

## 安装

```bash
# 全局安装
npm install -g standard-version

# 或作为开发依赖安装
npm install --save-dev standard-version
```

## 基本使用

### 配置 package.json

在项目的 package.json 文件中添加脚本：

```json
{
  "scripts": {
    "release": "standard-version",
    "release:major": "standard-version --release-as major",
    "release:minor": "standard-version --release-as minor",
    "release:patch": "standard-version --release-as patch",
    "release:first": "standard-version --first-release"
  }
}
```

这些命令的作用如下：

- **release**: 根据提交记录自动确定版本号
- **release:major**: 强制执行主版本升级（1.0.0 → 2.0.0），适用于不兼容的API变更
- **release:minor**: 强制执行次版本升级（1.0.0 → 1.1.0），适用于新增向后兼容的功能
- **release:patch**: 强制执行修订版本升级（1.0.0 → 1.0.1），适用于向后兼容的bug修复
- **release:first**: 项目首次发布，创建变更日志和Git标签，但不更改版本号

### 执行发布

```bash
# 如果全局安装
standard-version

# 如果作为项目依赖安装
npm run release

# 或使用特定的版本升级类型
npm run release:major  # 主版本升级
npm run release:minor  # 次版本升级
npm run release:patch  # 修订版本升级
```

执行后，Standard Version 会：
1. 根据提交记录确定下一个版本号（或使用指定的版本类型）
2. 更新 package.json 中的版本号
3. 生成或更新 CHANGELOG.md
4. 提交这些变更
5. 创建带版本号的 Git 标签

## 提交规范

Standard Version 依赖于约定式提交（Conventional Commits）来确定版本号变更。常用的提交类型包括：

- `feat`: 新功能，会增加次版本号（1.0.0 -> 1.1.0）
- `fix`: 修复bug，会增加修订版本号（1.0.0 -> 1.0.1）
- `BREAKING CHANGE`: 重大变更，会增加主版本号（1.0.0 -> 2.0.0）
- `docs`: 文档更新，不影响版本号
- `style`: 代码风格调整，不影响版本号
- `refactor`: 代码重构，不影响版本号
- `perf`: 性能优化，不影响版本号
- `test`: 测试相关，不影响版本号
- `build`: 构建系统相关，不影响版本号
- `ci`: 持续集成相关，不影响版本号

示例提交信息：

```
feat: 添加用户登录功能

这个提交添加了用户登录功能，包括表单验证和JWT认证。

BREAKING CHANGE: 修改了用户认证API的返回格式
```

## 自定义配置

可以在项目根目录创建 `.versionrc.json` 文件进行自定义配置。以下是完整的配置选项：

```json
{
  "types": [
    {"type": "feat", "section": "✨ Features"},
    {"type": "minor", "section": "🌱 Minor Features", "bump": "patch"},
    {"type": "fix", "section": "🐛 Bug Fixes"},
    {"type": "docs", "section": "📝 Documentation"},
    {"type": "style", "section": "🎨 Code Styles"},
    {"type": "refactor", "section": "♻️ Code Refactoring"},
    {"type": "perf", "section": "🚀 Performance Improvements"},
    {"type": "test", "section": "🧪 Tests"},
    {"type": "build", "section": "🏗️ Build System"},
    {"type": "ci", "section": "⚙️ CI Configuration"},
    {"type": "chore", "section": "🧹 Chores"},
    {"type": "revert", "section": "⏮️ Reverts"}
  ],
  "commitUrlFormat": "https://github.com/your-username/your-repo/commit/{{hash}}",
  "compareUrlFormat": "https://github.com/your-username/your-repo/compare/{{previousTag}}...{{currentTag}}",
  "issueUrlFormat": "https://github.com/your-username/your-repo/issues/{{id}}",
  "userUrlFormat": "https://github.com/{{user}}",
  "releaseCommitMessageFormat": "chore(release): {{currentTag}} [skip ci]",
  "issuePrefixes": ["#"],
  "bumpFiles": [
    {
      "filename": "package.json",
      "type": "json"
    },
    {
      "filename": "package-lock.json",
      "type": "json"
    },
    {
      "filename": "app/version.js",
      "type": "javascript",
      "updater": "custom-updater.js"
    }
  ],
  "packageFiles": [
    {
      "filename": "package.json",
      "type": "json"
    }
  ],
  "skip": {
    "commit": false,
    "tag": false,
    "changelog": false,
    "bump": false
  },
  "preset": "angular",
  "header": "# 更新日志\n\n",
  "path": ".",
  "tagPrefix": "v",
  "sign": false,
  "infile": "CHANGELOG.md",
  "silent": false,
  "scripts": {
    "prerelease": "npm test",
    "postbump": "npm run build",
    "precommit": "git add .",
    "posttag": "git push --follow-tags"
  }
}
```

### 配置选项详解

#### 提交类型和分类

- **types**: 定义提交类型及其在变更日志中的显示方式
  - `type`: 提交类型标识符（如feat、fix等）
  - `section`: 在变更日志中的分组标题
  - `hidden`: 设为true则在变更日志中隐藏该类型的提交
  - `bump`: 可选择性地覆盖该类型提交的版本升级行为（"major"、"minor"、"patch"）

#### URL格式化

- **commitUrlFormat**: Git提交链接的格式，`{{hash}}`为提交哈希占位符
- **compareUrlFormat**: 版本比较链接的格式，`{{previousTag}}`和`{{currentTag}}`为标签占位符
- **issueUrlFormat**: 问题链接的格式，`{{id}}`为问题ID占位符
- **userUrlFormat**: 用户链接的格式，`{{user}}`为用户名占位符

#### 提交信息格式

- **releaseCommitMessageFormat**: 发布提交的信息格式，`{{currentTag}}`为新版本标签占位符
- **issuePrefixes**: 识别提交信息中问题引用的前缀（默认为["#"]）

#### 文件处理

- **bumpFiles**: 需要更新版本号的文件列表
  - `filename`: 文件路径
  - `type`: 文件类型（json、plain、javascript等）
  - `updater`: 自定义更新器的路径（可选）

- **packageFiles**: 包含版本号的包定义文件列表
  - `filename`: 文件路径
  - `type`: 文件类型

#### 流程控制

- **skip**: 控制跳过哪些步骤
  - `commit`: 是否跳过创建提交
  - `tag`: 是否跳过创建标签
  - `changelog`: 是否跳过更新变更日志
  - `bump`: 是否跳过更新版本号

#### 常规设置

- **preset**: 使用的预设（如angular、conventionalcommits等）
- **header**: 变更日志的头部内容
- **path**: 执行命令的相对路径
- **tagPrefix**: 标签前缀（默认为"v"）
- **sign**: 是否对提交和标签进行签名
- **infile**: 变更日志文件的路径
- **silent**: 是否禁止控制台输出

#### 生命周期脚本

- **scripts**: 在发布过程中的不同阶段执行的脚本
  - `prerelease`: 发布前执行
  - `prebump`/`postbump`: 版本号更新前/后执行
  - `prechangelog`/`postchangelog`: 变更日志更新前/后执行
  - `precommit`/`postcommit`: 提交前/后执行
  - `pretag`/`posttag`: 标签创建前/后执行

### 配置示例

#### 1. 自定义变更日志分组

```json
{
  "types": [
    {"type": "feat", "section": "新特性"},
    {"type": "fix", "section": "Bug修复"},
    {"type": "docs", "section": "文档更新", "hidden": false},
    {"type": "style", "section": "代码样式", "hidden": true},
    {"type": "refactor", "section": "代码重构"},
    {"type": "perf", "section": "性能优化"},
    {"type": "test", "section": "测试", "hidden": true}
  ]
}
```

#### 2. 自定义版本控制行为

```json
{
  "types": [
    {"type": "feat", "section": "特性", "bump": "minor"},
    {"type": "fix", "section": "修复", "bump": "patch"},
    {"type": "docs", "section": "文档", "bump": null},
    {"type": "breaking", "section": "重大变更", "bump": "major"}
  ]
}
```

#### 3. 多文件版本更新

```json
{
  "bumpFiles": [
    {
      "filename": "package.json",
      "type": "json"
    },
    {
      "filename": "bower.json",
      "type": "json"
    },
    {
      "filename": "src/version.js",
      "type": "javascript",
      "updater": "scripts/version-updater.js"
    },
    {
      "filename": "VERSION",
      "type": "plain-text"
    }
  ]
}
```

#### 4. 自定义发布流程

```json
{
  "skip": {
    "changelog": false,
    "bump": false,
    "commit": false,
    "tag": false
  },
  "scripts": {
    "prerelease": "npm test",
    "postbump": "npm run build && git add dist",
    "posttag": "git push --follow-tags origin main && npm publish"
  }
}
```

### 使用JavaScript配置文件

除了JSON格式，还可以使用JavaScript文件进行更复杂的配置：

```js
// .versionrc.js
module.exports = {
  types: [
    {type: 'feat', section: '✨ Features'},
    {type: 'fix', section: '🐛 Bug Fixes'},
    // 更多类型...
  ],
  // 根据环境变量决定是否跳过某些步骤
  skip: {
    tag: process.env.CI === 'true'
  },
  // 动态生成提交信息格式
  releaseCommitMessageFormat: (context) => {
    return `chore(release): ${context.currentTag} [${process.env.NODE_ENV}]`;
  }
};
```

## 常用命令选项

```bash
# 指定具体版本号
npm run release -- --release-as 1.1.0

# 预发布版本
npm run release -- --prerelease alpha  # 生成版本如 1.0.0-alpha.0

# 第一个版本
npm run release -- --first-release

# 跳过某些步骤
npm run release -- --skip.bump --skip.changelog --skip.commit --skip.tag

# 使用自定义变更日志模板
npm run release -- --releaseCommitMessageFormat "chore: 发布 {{currentTag}}"

# 不生成git tag
npm run release -- --skip.tag

# 不创建commit
npm run release -- --skip.commit
```

## 最佳实践

1. **保持提交信息规范**：确保团队成员遵循约定式提交规范
2. **集成到CI/CD流程**：在持续集成流程中自动生成版本和变更日志
3. **使用预发布版本**：对于不稳定版本，使用预发布标签（如alpha、beta）
4. **定制变更日志模板**：根据项目需求自定义变更日志的格式和内容
5. **结合Git Hooks**：使用husky和commitlint确保提交信息符合规范
6. **使用专门的命令**：根据变更性质使用对应的命令（major/minor/patch）

## 与其他工具集成

### 与commitlint集成

为确保提交信息符合规范，可以使用commitlint：

```bash
# 安装commitlint
npm install --save-dev @commitlint/cli @commitlint/config-conventional

# 创建配置文件
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js

# 与husky集成
npm install --save-dev husky
```

在package.json中添加：

```json
{
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
```

### 与语义化发布集成

对于需要自动发布到npm的项目，可以结合semantic-release：

```bash
npm install --save-dev semantic-release
```

## 示例工作流

以下是一个完整的工作流示例：

1. 开发新功能或修复bug
2. 使用规范化的提交信息提交代码
   ```bash
   git commit -m "feat: 添加用户注册功能"
   ```
3. 完成所有开发工作后，根据变更性质执行对应的发布命令
   ```bash
   # 自动判断版本类型
   npm run release
   
   # 或明确指定版本类型
   npm run release:minor
   ```
4. 推送代码和标签到远程仓库
   ```bash
   git push --follow-tags origin main
   ```

通过这种方式，您可以轻松管理项目版本并自动生成详细的变更日志，使项目维护更加高效和规范。 