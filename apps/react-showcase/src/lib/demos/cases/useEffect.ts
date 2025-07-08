import type { Demo } from "../types"
import { DemoCategories } from "../types"

export const useEffectDemo: Demo = {
  id: "useEffect",
  title: "useEffect Hook",
  description: "学习 React 中的副作用处理 Hook，掌握组件生命周期和清理函数的使用",
  category: DemoCategories.REACT_HOOKS,
  code: `function App() {
  const [count, setCount] = useState(0)
  const [time, setTime] = useState(new Date())
  const [windowWidth, setWindowWidth] = useState(0)

  // 1. 无依赖数组 - 每次渲染都执行
  useEffect(() => {
    console.log('组件渲染了！')
  })

  // 2. 空依赖数组 - 只在组件挂载时执行一次
  useEffect(() => {
    console.log('组件挂载了！')
    
    // 设置初始窗口宽度
    setWindowWidth(window.innerWidth)
    
    // 监听窗口大小变化
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    
    window.addEventListener('resize', handleResize)
    
    // 清理函数 - 组件卸载时执行
    return () => {
      window.removeEventListener('resize', handleResize)
      console.log('清理了窗口监听器')
    }
  }, [])

  // 3. 有依赖数组 - 依赖项变化时执行
  useEffect(() => {
    console.log(\`计数变化了: \${count}\`)
  }, [count])

  // 4. 定时器示例
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => {
      clearInterval(timer)
      console.log('清理了定时器')
    }
  }, [])

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        useEffect Hook 示例
      </h2>
      
      {/* 计数器 */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">计数器</h3>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-3">
            {count}
          </div>
          <button
            onClick={() => setCount(count + 1)}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            增加计数
          </button>
        </div>
      </div>

      {/* 实时时间 */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">实时时间</h3>
        <div className="text-center">
          <div className="text-xl font-mono text-green-600">
            {time.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* 窗口宽度 */}
      <div className="mb-6 p-4 bg-purple-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">窗口宽度</h3>
        <div className="text-center">
          <div className="text-xl font-semibold text-purple-600">
            {windowWidth}px
          </div>
          <p className="text-sm text-gray-600 mt-2">
            调整浏览器窗口大小试试
          </p>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">💡 提示</h4>
        <p className="text-sm text-yellow-700">
          打开浏览器控制台查看 useEffect 的执行日志
        </p>
      </div>
    </div>
  )
}`
}
