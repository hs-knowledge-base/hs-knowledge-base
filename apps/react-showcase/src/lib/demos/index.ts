export type { Demo, DemoCategory } from "./types"
export { DemoCategories } from "./types"
export { demos } from "./collection"
export * from "./utils"

// 便捷的工具函数，自动传入 demos 参数
import { demos } from "./collection"
import * as utils from "./utils"

/**
 * 根据 ID 获取案例
 */
export function getDemoById(id: string) {
  return utils.getDemoById(demos, id)
}

/**
 * 根据分类获取案例
 */
export function getDemosByCategory(category: string) {
  return utils.getDemosByCategory(demos, category)
}

/**
 * 获取所有分类
 */
export function getAllCategories() {
  return utils.getAllCategories(demos)
}

/**
 * 获取分类统计
 */
export function getCategoryStats() {
  return utils.getCategoryStats(demos)
}
