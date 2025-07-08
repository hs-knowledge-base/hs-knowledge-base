import type { Demo } from "../types"

export const customHooksDemo: Demo = {
  id: "custom-hooks",
  title: "自定义 Hooks 实战",
  description: "掌握自定义 Hooks 的核心概念，学会抽象和复用状态逻辑",
  category: "Custom Hooks",
  code: `function App() {
  // 自定义 Hook: 计数器
  function useCounter(initialValue = 0) {
    const [count, setCount] = useState(initialValue)
    
    const increment = () => setCount(prev => prev + 1)
    const decrement = () => setCount(prev => prev - 1)
    const reset = () => setCount(initialValue)
    
    return { count, increment, decrement, reset }
  }
  
  // 自定义 Hook: 切换状态
  function useToggle(initialValue = false) {
    const [value, setValue] = useState(initialValue)
    
    const toggle = () => setValue(prev => !prev)
    const setTrue = () => setValue(true)
    const setFalse = () => setValue(false)
    
    return { value, toggle, setTrue, setFalse }
  }
  
  // 自定义 Hook: 输入框
  function useInput(initialValue = '') {
    const [value, setValue] = useState(initialValue)
    
    const onChange = (e) => setValue(e.target.value)
    const clear = () => setValue('')
    
    return { value, onChange, clear }
  }
  
  // 演示组件
  const counter = useCounter(0)
  const toggle = useToggle(false)
  const nameInput = useInput('')
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          自定义 Hooks 实战
        </h1>
        <p className="text-gray-600">
          三个实用的自定义 Hooks 演示
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* useCounter 演示 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-blue-600 mb-4">
            useCounter
          </h2>
          <div className="text-center space-y-4">
            <div className="text-3xl font-bold text-gray-700">
              {counter.count}
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={counter.decrement}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  -1
                </button>
                <button
                  onClick={counter.increment}
                  className="flex-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  +1
                </button>
              </div>
              <button
                onClick={counter.reset}
                className="w-full px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                重置
              </button>
            </div>
          </div>
        </div>
        
        {/* useToggle 演示 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-green-600 mb-4">
            useToggle
          </h2>
          <div className="space-y-4">
            <div className="text-center">
              <div className={\`text-2xl font-bold \${toggle.value ? 'text-green-600' : 'text-red-600'}\`}>
                {toggle.value ? '开启' : '关闭'}
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={toggle.toggle}
                className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                切换
              </button>
              <div className="flex gap-2">
                <button
                  onClick={toggle.setTrue}
                  className="flex-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  开启
                </button>
                <button
                  onClick={toggle.setFalse}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* useInput 演示 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-purple-600 mb-4">
            useInput
          </h2>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="输入你的名字"
                value={nameInput.value}
                onChange={nameInput.onChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">
                输入内容: 
              </div>
              <div className="font-mono text-lg">
                {nameInput.value || '(空)'}
              </div>
            </div>
            <button
              onClick={nameInput.clear}
              className="w-full px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              清空
            </button>
          </div>
        </div>
      </div>
      
      {/* 说明 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          自定义 Hooks 的价值
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-600 mb-2">逻辑复用</h4>
            <p className="text-gray-600">
              将状态逻辑抽象成可复用的函数，避免重复代码
            </p>
          </div>
          <div>
            <h4 className="font-medium text-green-600 mb-2">关注分离</h4>
            <p className="text-gray-600">
              将业务逻辑与 UI 组件分离，提高代码可维护性
            </p>
          </div>
          <div>
            <h4 className="font-medium text-purple-600 mb-2">易于测试</h4>
            <p className="text-gray-600">
              独立的 Hook 函数更容易进行单元测试
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}`
}
