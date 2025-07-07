import type { Demo } from "../types"

// 只有这个案例需要的依赖才在这里导入
// 这样不会影响其他案例的打包体积
const lodash = require('lodash') // 示例：如果需要 lodash

export const exampleWithDepsDemo: Demo = {
  id: "example-with-deps",
  title: "带依赖的示例",
  description: "展示如何在案例中使用额外的依赖库",
  category: "Components",
  // 案例特定的 scope，只有这个案例会加载这些依赖
  scope: {
    lodash, // 只有这个案例会包含 lodash
  },
  code: `function App() {
  const [items, setItems] = useState([1, 2, 3, 4, 5])
  
  const shuffleItems = () => {
    // 使用 lodash 的 shuffle 函数
    setItems(lodash.shuffle([...items]))
  }
  
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        带依赖的示例
      </h2>
      <div className="mb-4">
        <p className="text-gray-600 mb-2">当前数组:</p>
        <div className="flex gap-2">
          {items.map((item, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 rounded">
              {item}
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={shuffleItems}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        使用 Lodash 打乱数组
      </button>
    </div>
  )
}`
}
