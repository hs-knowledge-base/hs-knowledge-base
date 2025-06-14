# Monorepo 项目发包指南（pnpm 方案）

本指南总结了在 monorepo 架构下，使用 pnpm 进行包开发和发布时的最佳实践、常见问题与解决方案。

---

## 1. 依赖管理

### 开发阶段
- 在 `package.json` 里使用 workspace 依赖：
  ```json
  "@your-scope/utils": "workspace:*"
  ```
- 这样可以在 monorepo 内部实时联动开发。

### 发布阶段
- **pnpm 会自动把 workspace 依赖替换为本地依赖包的版本号**（如 `^0.0.13`）。
- 前提是 `package.json` 里没有 `publishConfig.dependencies` 字段覆盖依赖。

---

## 2. publishConfig 配置
- 推荐只保留：
  ```json
  "publishConfig": {
    "access": "public"
  }
  ```
- 不要加 `publishConfig.dependencies`，否则会导致依赖被锁死为指定版本，pnpm 的自动替换机制失效。

---

## 3. 版本同步与发布顺序
- **先 bump & 发布依赖包（如 utils），再发布主包（如 cli）**。
- 确保本地依赖包的 `package.json` 里的 version 字段是最新的。
- 推荐用 [changesets](https://github.com/changesets/changesets) 或 lerna 自动管理版本。

---

## 4. README.md 展示问题
- npm 包页面只会显示你发布包目录下的 `README.md`。
- 如果你的包在 monorepo 的子目录（如 `apps/cli`），需要在该目录下也有 `README.md`。
- 可以用脚本同步根目录的 `README.md` 到子包目录。

---

## 5. 常见问题与排查

### 1. 依赖被锁死为旧版本？
- 检查 `publishConfig.dependencies`，不要写死依赖。
- 检查本地依赖包的 version 字段是否最新。

### 2. 发布后 npm 页面没有显示 README？
- 确认子包目录下有 `README.md`，且内容规范。
- 本地用 `npm pack` 检查打包内容。

### 3. 依赖 workspace 但用户全局安装 CLI 报错？
- 只要依赖包已发布到 npm，pnpm 会自动替换依赖为 npm 版本，用户不会有问题。

### 4. 依赖没有自动替换为最新版本？
- 检查本地依赖包的 version 字段。
- 检查发布顺序。
- 检查 lockfile 是否最新。

---

## 6. 进阶问题与最佳实践

### 1. 跨包类型依赖
- 如果包 A 依赖包 B 的类型，建议在 A 的 `devDependencies` 里加上 B。
- 避免类型丢失导致的编译或 IDE 报错。

### 2. 包间循环依赖
- 尽量避免包与包之间互相依赖，否则容易导致构建死循环或类型推断异常。
- 可用工具如 [madge](https://github.com/pahen/madge) 检查循环依赖。

### 3. tsconfig 复用
- 建议在 monorepo 根目录维护一个 `tsconfig.base.json`，各子包通过 `extends` 继承，统一配置。

### 4. 自动化脚本
- 可用 Node.js 脚本或 [changesets](https://github.com/changesets/changesets) 自动 bump 版本、同步 README、批量发布。

### 5. CI/CD 集成
- 建议在 CI 流程中自动 lint、build、test、publish，保证包质量。
- 可用 GitHub Actions、GitLab CI 等。

### 6. 包发布权限与 npm 组织
- 组织包（@scope/xxx）建议设置 `publishConfig.access: public`。
- 发布前确认 npm 账号有权限。

### 7. 包私有/公开切换
- 切换包的公开/私有属性需谨慎，npm 上已发布的包无法直接变更私有/公开。

### 8. 包弃用（deprecate）
- 可用 `npm deprecate` 命令标记包为弃用，提示用户迁移。

### 9. 包重命名与迁移
- 新包发布后，可在旧包 README 里提示迁移。
- 旧包可用 `npm deprecate` 标记。

### 10. pnpm workspace 特性
- 支持 workspace:*、workspace:^、workspace:~ 等多种依赖方式，灵活管理依赖范围。

### 11. 常见工具对比
- pnpm：速度快、磁盘占用低、原生支持 monorepo。
- yarn workspaces：生态成熟，兼容性好。
- lerna：经典 monorepo 工具，适合大项目。
- nx：集成度高，适合大型前端/全栈项目。

### 12. 包体积优化
- 发布前用 [size-limit](https://github.com/ai/size-limit) 检查包体积。
- 避免无用依赖和大文件进入发布包。

### 13. 依赖安全
- 用 [npm audit](https://docs.npmjs.com/cli/v10/commands/npm-audit) 或 [pnpm audit](https://pnpm.io/zh/cli/audit) 检查依赖安全。

### 14. 发布回滚
- npm 包无法直接删除，发现问题可发布新 patch 版本修复。
- 可用 `npm dist-tag` 管理 tag，临时回滚到旧版本。

### 15. npm tag 管理
- 用 `npm publish --tag beta` 发布测试版。
- 用 `npm dist-tag add`/`rm` 管理 tag。

### 16. prepublish 脚本
- 可用 `prepublishOnly` 脚本自动 build、lint、test，保证发布包质量。

### 17. 包文档自动生成
- 推荐用 [typedoc](https://typedoc.org/) 自动生成 API 文档，配合 CI 自动部署到 GitHub Pages。

---

## 7. 推荐工具
- [pnpm](https://pnpm.io/)
- [changesets](https://github.com/changesets/changesets)
- [lerna](https://lerna.js.org/)
- [madge](https://github.com/pahen/madge)
- [typedoc](https://typedoc.org/)
- [size-limit](https://github.com/ai/size-limit)

---

## 8. 发布流程建议
1. 在 monorepo 根目录下，依次 bump 依赖包和主包的版本。
2. 先发布依赖包（如 utils），再发布主包（如 cli）。
3. 用 `pnpm pack` 检查打包内容和依赖。
4. 发布后检查 npm 页面展示和依赖。
5. 用 CI 自动化发布、测试、文档部署。

---

如有更多问题，欢迎补充！ 