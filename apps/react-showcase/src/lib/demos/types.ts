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
  /** 分类（"Hooks" 或 "Components"） */
  category: string
  /** React 代码 */
  code: string
  /** 可选的额外作用域 */
  scope?: Record<string, any>
}

/**
 * 案例分类枚举
 */
export const DemoCategories = {
  HOOKS: 'Hooks',
  COMPONENTS: 'Components'
} as const

export type DemoCategory = typeof DemoCategories[keyof typeof DemoCategories]
