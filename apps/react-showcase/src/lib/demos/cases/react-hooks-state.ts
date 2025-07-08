import type { Demo } from "../types"
import { DemoCategories } from "../types"

export const reactHooksStateDemo: Demo = {
  id: "react-hooks-state",
  title: "React Hooks 状态管理",
  description: "展示 useState、useEffect、useReducer 等核心 Hooks 的使用方法和最佳实践",
  category: DemoCategories.REACT_HOOKS,
  code: `function App() {
  // useState - 基础状态管理
  const [count, setCount] = useState(0)
  const [user, setUser] = useState({ name: '', email: '' })
  
  // useReducer - 复杂状态管理
  const initialTodos = [
    { id: 1, text: '学习 React Hooks', completed: false },
    { id: 2, text: '构建状态管理', completed: true }
  ]
  
  function todoReducer(state, action) {
    switch (action.type) {
      case 'ADD_TODO':
        return [...state, { 
          id: Date.now(), 
          text: action.text, 
          completed: false 
        }]
      case 'TOGGLE_TODO':
        return state.map(todo =>
          todo.id === action.id 
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      case 'DELETE_TODO':
        return state.filter(todo => todo.id !== action.id)
      default:
        return state
    }
  }
  
  const [todos, dispatch] = useReducer(todoReducer, initialTodos)
  const [newTodo, setNewTodo] = useState('')
  
  // useEffect - 副作用处理
  const [time, setTime] = useState(new Date())
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  // useMemo - 性能优化
  const completedCount = useMemo(() => {
    return todos.filter(todo => todo.completed).length
  }, [todos])
  
  const pendingCount = useMemo(() => {
    return todos.filter(todo => !todo.completed).length
  }, [todos])
  
  // useCallback - 回调优化
  const handleAddTodo = useCallback(() => {
    if (newTodo.trim()) {
      dispatch({ type: 'ADD_TODO', text: newTodo })
      setNewTodo('')
    }
  }, [newTodo])
  
  const handleToggleTodo = useCallback((id) => {
    dispatch({ type: 'TOGGLE_TODO', id })
  }, [])
  
  const handleDeleteTodo = useCallback((id) => {
    dispatch({ type: 'DELETE_TODO', id })
  }, [])
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-800">
        React Hooks 状态管理演示
      </h1>
      
      {/* useState 示例 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">useState - 基础状态</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">计数器</h3>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setCount(count - 1)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                -1
              </button>
              <span className="text-2xl font-bold text-gray-700">{count}</span>
              <button 
                onClick={() => setCount(count + 1)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                +1
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">用户信息</h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="姓名"
                value={user.name}
                onChange={(e) => setUser({...user, name: e.target.value})}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="邮箱"
                value={user.email}
                onChange={(e) => setUser({...user, email: e.target.value})}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {user.name && (
                <p className="text-sm text-gray-600">
                  你好, {user.name}! {user.email && \`邮箱: \${user.email}\`}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* useEffect 示例 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-green-600">useEffect - 副作用处理</h2>
        <div className="text-center">
          <p className="text-lg text-gray-700">
            当前时间: <span className="font-mono font-bold">{time.toLocaleTimeString()}</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            这个时钟每秒自动更新，展示了 useEffect 的清理机制
          </p>
        </div>
      </div>
      
      {/* useReducer + useMemo + useCallback 示例 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-purple-600">
          useReducer + useMemo + useCallback - 复杂状态管理
        </h2>
        
        {/* 统计信息 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded">
            <div className="text-2xl font-bold text-blue-600">{todos.length}</div>
            <div className="text-sm text-gray-600">总任务</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <div className="text-sm text-gray-600">已完成</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded">
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
            <div className="text-sm text-gray-600">待完成</div>
          </div>
        </div>
        
        {/* 添加任务 */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="添加新任务..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
            className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleAddTodo}
            className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            添加
          </button>
        </div>
        
        {/* 任务列表 */}
        <div className="space-y-2">
          {todos.map(todo => (
            <div key={todo.id} className="flex items-center gap-3 p-3 border rounded">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggleTodo(todo.id)}
                className="w-4 h-4"
              />
              <span className={\`flex-1 \${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}\`}>
                {todo.text}
              </span>
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-2">🎯 学习要点</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>useState:</strong> 管理简单的组件状态</li>
          <li>• <strong>useEffect:</strong> 处理副作用，如定时器、API 调用等</li>
          <li>• <strong>useReducer:</strong> 管理复杂的状态逻辑</li>
          <li>• <strong>useMemo:</strong> 缓存计算结果，避免不必要的重新计算</li>
          <li>• <strong>useCallback:</strong> 缓存函数引用，优化子组件性能</li>
        </ul>
      </div>
    </div>
  )
}`
}
