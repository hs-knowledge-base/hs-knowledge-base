import type { Demo } from "../types"
import { DemoCategories } from "../types"

export const formHandlingDemo: Demo = {
  id: "form-handling",
  title: "表单处理",
  description: "学习 React 中的表单状态管理、验证和提交处理",
  category: DemoCategories.COMPONENTS,
  code: `function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    interests: [],
    message: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  // 验证函数
  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = '姓名不能为空'
    }

    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空'
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
      newErrors.email = '邮箱格式不正确'
    }

    if (!formData.age.trim()) {
      newErrors.age = '年龄不能为空'
    } else if (isNaN(Number(formData.age)) || Number(formData.age) < 1 || Number(formData.age) > 120) {
      newErrors.age = '请输入有效的年龄 (1-120)'
    }

    if (!formData.message.trim()) {
      newErrors.message = '留言不能为空'
    } else if (formData.message.length < 10) {
      newErrors.message = '留言至少需要10个字符'
    }

    return newErrors
  }

  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  // 处理复选框变化
  const handleCheckboxChange = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  // 提交表单
  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newErrors = validateForm()
    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitted(true)
      console.log('表单提交成功:', formData)
    }
  }

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      age: '',
      gender: '',
      interests: [],
      message: ''
    })
    setErrors({})
    setIsSubmitted(false)
  }

  if (isSubmitted) {
    return (
      <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">提交成功！</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-2">提交的信息：</h3>
            <div className="text-left space-y-1 text-sm">
              <p><strong>姓名:</strong> {formData.name}</p>
              <p><strong>邮箱:</strong> {formData.email}</p>
              <p><strong>年龄:</strong> {formData.age}</p>
              <p><strong>性别:</strong> {formData.gender || '未选择'}</p>
              <p><strong>兴趣:</strong> {formData.interests.join(', ') || '无'}</p>
              <p><strong>留言:</strong> {formData.message}</p>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            重新填写
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        表单处理示例
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 姓名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            姓名 *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={\`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 \${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }\`}
            placeholder="请输入您的姓名"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* 邮箱 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            邮箱 *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={\`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 \${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }\`}
            placeholder="请输入您的邮箱"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* 年龄 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            年龄 *
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            className={\`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 \${
              errors.age ? 'border-red-500' : 'border-gray-300'
            }\`}
            placeholder="请输入您的年龄"
          />
          {errors.age && (
            <p className="mt-1 text-sm text-red-600">{errors.age}</p>
          )}
        </div>

        {/* 性别 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            性别
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">请选择</option>
            <option value="male">男</option>
            <option value="female">女</option>
            <option value="other">其他</option>
          </select>
        </div>

        {/* 兴趣爱好 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            兴趣爱好
          </label>
          <div className="space-y-2">
            {['编程', '阅读', '运动', '音乐', '旅行'].map(interest => (
              <label key={interest} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.interests.includes(interest)}
                  onChange={() => handleCheckboxChange(interest)}
                  className="mr-2"
                />
                {interest}
              </label>
            ))}
          </div>
        </div>

        {/* 留言 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            留言 *
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows={4}
            className={\`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 \${
              errors.message ? 'border-red-500' : 'border-gray-300'
            }\`}
            placeholder="请留下您的留言..."
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message}</p>
          )}
        </div>

        {/* 提交按钮 */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            提交
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="flex-1 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            重置
          </button>
        </div>
      </form>
    </div>
  )
}`
}
