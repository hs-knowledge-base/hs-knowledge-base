import { z } from 'zod'
import type { Demo, DemoCategory } from "./types"

/**
 * 根据 ID 获取案例
 */
export function getDemoById(demos: Demo[], id: string): Demo | undefined {
  return demos.find(demo => demo.id === id)
}

/**
 * 根据分类获取案例
 */
export function getDemosByCategory(demos: Demo[], category: DemoCategory): Demo[] {
  return demos.filter(demo => demo.category === category)
}

/**
 * 获取所有分类
 */
export function getAllCategories(demos: Demo[]): DemoCategory[] {
  return Array.from(new Set(demos.map(demo => demo.category)))
}

/**
 * 获取分类统计
 */
export function getCategoryStats(demos: Demo[]): Record<DemoCategory, number> {
  const stats = {} as Record<DemoCategory, number>
  demos.forEach(demo => {
    stats[demo.category] = (stats[demo.category] || 0) + 1
  })
  return stats
}

/**
 * 按 ID 排序案例
 */
export function sortDemosById(demos: Demo[]): Demo[] {
  return [...demos].sort((a, b) => a.id.localeCompare(b.id))
}

/**
 * 按分类和 ID 排序案例
 */
export function sortDemosByCategory(demos: Demo[]): Demo[] {
  return [...demos].sort((a, b) => {
    // 先按分类排序，再按 ID 排序
    const categoryCompare = a.category.localeCompare(b.category)
    if (categoryCompare !== 0) return categoryCompare
    return a.id.localeCompare(b.id)
  })
}

/**
 * Demo 案例的 Zod Schema
 */
const DemoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum(['React Hooks', 'Performance', 'Custom Hooks', 'Components', 'State Management', 'UI/UX']),
  code: z.string().min(1),
  scope: z.record(z.unknown()).optional(),
  cdnDependencies: z.array(z.string()).optional()
})

/**
 * 验证案例对象是否有效
 */
export function isValidDemo(obj: unknown): obj is Demo {
  return DemoSchema.safeParse(obj).success
}

/**
 * 获取案例总数
 */
export function getDemoCount(demos: Demo[]): number {
  return demos.length
}

/**
 * 检查案例 ID 是否存在
 */
export function hasDemoId(demos: Demo[], id: string): boolean {
  return demos.some(demo => demo.id === id)
}

/**
 * 获取所有案例 ID
 */
export function getAllDemoIds(demos: Demo[]): string[] {
  return demos.map(demo => demo.id)
}
