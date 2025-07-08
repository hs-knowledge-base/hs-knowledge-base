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

## 🎯 Demo 类型定义

```typescript
/**
 * Demo 案例接口定义
 */
export interface Demo {
  /** 唯一标识符，用于 URL 路径 */
  id: string
  /** 案例标题 */
  title: string
  /** 案例描述 */
  description: string
  /** 分类 */
  category: DemoCategory
  /** React 代码 */
  code: string
  /** 可选的额外作用域 */
  scope?: Record<string, any>
  /** 需要从 CDN 加载的依赖库名称列表 */
  cdnDependencies?: string[]
}

/**
 * 案例分类枚举
 */
export const DemoCategories = {
  REACT_HOOKS: 'React Hooks',
  PERFORMANCE: 'Performance',
  CUSTOM_HOOKS: 'Custom Hooks',
  COMPONENTS: 'Components',
  STATE_MANAGEMENT: 'State Management',
  UI_UX: 'UI/UX'
} as const
```

## 🔧 Scope 系统

### 基础 Scope
系统自动提供以下 React Hooks：
- `useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`, `useReducer`

### 自定义 Scope
```typescript
scope: {
  customFunction: () => console.log('自定义函数'),
  React: { memo: (component) => component }
}
```

### CDN 依赖
```typescript
cdnDependencies: ['lodash', 'moment', 'axios', 'bootstrap']
```

**支持的库：**
- `lodash` → 全局变量 `_`
- `moment` → 日期处理
- `axios` → HTTP 客户端
- `bootstrap` → UI 框架

## 📝 添加新案例

1. 在 `cases/` 目录下创建 `.ts` 文件
2. 在 `collection.ts` 中添加导入
3. 所有代码必须在 `App` 函数内部

### 示例
```typescript
import { DemoCategories } from "../types"

export const myDemo: Demo = {
  id: "my-demo",
  title: "我的演示",
  description: "演示案例",
  category: DemoCategories.COMPONENTS,
  cdnDependencies: ['lodash'],
  code: `function App() {
    const [items] = useState([1, 2, 3])
    const shuffled = _.shuffle(items) // 使用 lodash

    return <div>{shuffled.join(', ')}</div>
  }`
}
```

## 📚 相关资源

- [React 官方文档](https://react.dev/)
- [React Live 文档](https://github.com/FormidableLabs/react-live)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
