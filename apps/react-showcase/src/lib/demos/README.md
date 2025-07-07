# React 展示案例库

这个目录包含了所有的 React 展示案例，采用模块化的组织结构。

## 📁 目录结构

```
src/lib/demos/
├── index.ts              # 统一导出入口
├── types.ts              # 类型定义
├── collection.ts         # 案例集合管理
├── utils.ts              # 工具函数
├── cases/                # 案例目录
└── README.md            # 说明文档
```

## 🔧 如何添加新案例

### 1. 创建案例文件
在 `cases/` 目录下创建新的 `.ts` 文件

### 2. 更新案例集合
在 `collection.ts` 中添加导入和数组项

### 3. 访问案例
新案例将自动在首页和对应路由中可用

## 📝 编写规范

- 函数名必须是 `App`
- 可直接使用 React Hooks
- 使用 Tailwind CSS 样式
- 避免 import 语句

## 📚 相关资源

- [React 官方文档](https://react.dev/)
- [React Live 文档](https://github.com/FormidableLabs/react-live)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
