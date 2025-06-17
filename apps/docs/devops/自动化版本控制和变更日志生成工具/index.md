Standard-Version 工具
简介
Standard-Version 是一个自动化版本控制和变更日志生成工具，它遵循语义化版本规范，通过分析提交信息自动确定版本号并生成 CHANGELOG.md 文件。该工具简化了发布流程，确保版本号的一致性和可追溯性，是现代 JavaScript 项目中持续集成与交付流程的重要组成部分。

核心概念
语义化版本
语义化版本（Semantic Versioning）是一种版本号命名规范，格式为：X.Y.Z

主版本号(X)：当进行不兼容的 API 更改时递增
次版本号(Y)：当添加向后兼容的功能时递增
修订号(Z)：当进行向后兼容的 bug 修复时递增
Conventional Commits
Standard-Version 依赖于 Conventional Commits 规范的提交信息格式：

plaintext

<type>[optional scope]: <description>[optional body][optional footer(s)]
主要提交类型及其对版本号的影响：

feat：新功能，增加次版本号(Y)
fix：bug 修复，增加修订号(Z)
BREAKING CHANGE：重大变更，增加主版本号(X)
docs、style、refactor、test、chore 等：不影响版本号
安装与配置
安装 Standard-Version
bash
运行

# 全局安装 npm install -g standard-version# 或作为开发依赖安装到项目中 npm install --save-dev standard-version

配置项目
在 package.json 中添加脚本：

json

{ "scripts": { "release": "standard-version" }}
自定义配置
在项目根目录创建.versionrc.json 文件进行自定义配置：

json

{ "types": [ {"type": "feat", "section": "Features"}, {"type": "fix", "section": "Bug Fixes"}, {"type": "docs", "section": "Documentation"}, {"type": "style", "section": "Styles"}, {"type": "refactor", "section": "Code Refactoring"}, {"type": "perf", "section": "Performance Improvements"}, {"type": "test", "section": "Tests"}, {"type": "build", "section": "Build System"}, {"type": "ci", "section": "Continuous Integration"}, {"type": "chore", "section": "Chores", "hidden": true} ]}
基本命令
创建发布
bash
运行

# 使用 npm 脚本 npm run release# 或直接使用命令 standard-version

指定版本类型
bash
运行

# 发布补丁版本 (0.0.x)npm run release -- --release-as patch# 发布次要版本 (0.x.0)npm run release -- --release-as minor# 发布主要版本 (x.0.0)npm run release -- --release-as major# 指定具体版本号 npm run release -- --release-as 1.2.3

预发布版本
bash
运行

# 创建预发布版本 npm run release -- --prerelease alpha# 结果示例: 1.0.0 -> 1.0.1-alpha.0

首次发布
bash
运行

# 首次发布 npm run release -- --first-release# 这将创建 CHANGELOG.md 但不增加版本号

与 CI/CD 集成
GitHub Actions 集成示例
yaml

name: Releaseon: push: branches: [ main ]jobs: release: runs-on: ubuntu-latest if: "!contains(github.event. head_commit.message, 'chore(release) ')" steps: - uses: actions/checkout@v3 with: fetch-depth: 0 token: ${{ secrets.        GITHUB_TOKEN }} - name: Setup Node.js uses: actions/setup-node@v3 with: node-version: '16.x' - name: Install dependencies run: npm ci - name: Configure Git run: | git config --local user.email "action@github.com" git config --local user.name "GitHub Action" - name: Create Release run: npx standard-version - name: Push changes uses: ad-m/ github-push-action@master with: github_token: ${{ secrets.        GITHUB_TOKEN }} branch: ${{ github.ref }} tags: true
最佳实践
在提交信息中严格遵循 Conventional Commits 规范
将 Standard-Version 集成到 CI/CD 流程中实现自动化发布
使用 git commit --amend 或 git rebase 修改尚未推送的提交信息
在大型团队中使用 commitlint 强制执行提交信息规范
使用--dry-run 选项预览发布结果而不实际执行
常见问题解决
版本号未按预期递增
检查提交信息是否符合 Conventional Commits 规范，特别是类型前缀（feat、fix 等）是否正确。

CHANGELOG 生成不完整
确保所有提交都遵循规范，并检查.versionrc.json 配置是否正确定义了所有需要的提交类型。

与 Git 标签冲突
如果遇到标签冲突，可以使用以下命令手动同步：

bash
运行

# 删除本地标签 git tag -d v1.0.0# 获取远程标签 git fetch --tags

总结
Standard-Version 通过自动化版本控制和变更日志生成，简化了软件发布流程，提高了版本管理的一致性和可追溯性。结合 Conventional Commits 提交规范和 CI/CD 工具，可以构建完全自动化的发布流水线，减少人为错误并提高团队效率。

在现代 JavaScript 项目中，Standard-Version 已成为版本管理的标准工具之一，特别适合需要频繁发布的项目和遵循语义化版本的团队。
