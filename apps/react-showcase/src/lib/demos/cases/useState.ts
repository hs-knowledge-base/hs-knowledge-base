import type { Demo } from "../types"

export const useStateDemo: Demo = {
  id: "useState",
  title: "useState Hook",
  description: "学习 React 中最基础的状态管理 Hook，掌握如何在函数组件中管理状态",
  category: "Hooks",
  code: `function App() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('')

  const increment = () => {
    setCount(count + 1)
  }

  const decrement = () => {
    setCount(count - 1)
  }

  const reset = () => {
    setCount(0)
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        useState Hook 示例
      </h2>
      
      {/* 计数器部分 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">计数器</h3>
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-4">
            {count}
          </div>
          <div className="space-x-2">
            <button
              onClick={decrement}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              -1
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              重置
            </button>
            <button
              onClick={increment}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              +1
            </button>
          </div>
        </div>
      </div>

      {/* 输入框部分 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">文本输入</h3>
        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入您的姓名"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {name && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800">
                你好, <strong>{name}</strong>! 👋
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}`
}
