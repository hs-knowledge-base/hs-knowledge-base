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
  scope?: Record<string, unknown>
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

export type DemoCategory = typeof DemoCategories[keyof typeof DemoCategories]
