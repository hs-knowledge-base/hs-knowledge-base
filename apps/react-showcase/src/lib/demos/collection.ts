import type { Demo } from "./types"
import { sortDemosById } from "./utils"

import { useStateDemo } from "./cases/useState"
import { useEffectDemo } from "./cases/useEffect"
import { formHandlingDemo } from "./cases/form-handling"

/**
 * 所有案例的原始集合
 */
const rawDemos: Demo[] = [
  useStateDemo,
  useEffectDemo,
  formHandlingDemo,
]

/**
 * 所有案例的集合 - 按 ID 自动排序
 */
export const demos: Demo[] = sortDemosById(rawDemos)


