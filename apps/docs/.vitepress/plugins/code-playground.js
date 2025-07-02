/**
 * VitePress 插件：为代码块添加 LiveCodes Playground 支持
 */

// 支持的语言列表
const SUPPORTED_LANGUAGES = [
  'javascript', 'js', 'typescript', 'ts', 'python', 'py', 'go', 'rust', 
  'java', 'cpp', 'c++', 'c', 'php', 'ruby', 'html', 'css', 'vue', 
  'react', 'jsx', 'tsx', 'json', 'yaml', 'yml', 'bash', 'shell', 'sql'
]

// 语言别名映射
const LANGUAGE_ALIASES = {
  'js': 'javascript',
  'ts': 'typescript',
  'py': 'python',
  'c++': 'cpp',
  'yml': 'yaml',
  'shell': 'bash',
  'react': 'jsx'
}

/**
 * 检查语言是否支持 LiveCodes
 */
function isSupportedLanguage(lang) {
  if (!lang) return false
  const normalizedLang = lang.toLowerCase()
  return SUPPORTED_LANGUAGES.includes(normalizedLang)
}

/**
 * 获取标准化的语言名称
 */
function getNormalizedLanguage(lang) {
  if (!lang) return 'javascript'
  const normalizedLang = lang.toLowerCase()
  return LANGUAGE_ALIASES[normalizedLang] || normalizedLang
}

/**
 * 提取代码块的元数据
 */
function parseCodeBlockMeta(info) {
  const parts = info.split(/\s+/)
  const language = parts[0] || 'text'
  const meta = {}
  
  // 解析元数据 (例如: javascript{playground title="示例"}
  const metaMatch = info.match(/\{([^}]+)\}/)
  if (metaMatch) {
    const metaStr = metaMatch[1]
    
    // 解析 playground 标志
    if (metaStr.includes('playground')) {
      meta.playground = true
    }
    
    // 解析 title
    const titleMatch = metaStr.match(/title=["']([^"']+)["']/)
    if (titleMatch) {
      meta.title = titleMatch[1]
    }
    
    // 解析 no-playground 标志
    if (metaStr.includes('no-playground')) {
      meta.noPlayground = true
    }
  }
  
  return { language, meta }
}

/**
 * 转义 HTML 特殊字符
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

/**
 * 创建 CodePlayground 组件的包装器
 */
function createPlaygroundWrapper(language, code, title = '') {
  const escapedCode = escapeHtml(code)
  const escapedTitle = escapeHtml(title)
  
  return `<CodePlayground language="${language}" code="${escapedCode}" title="${escapedTitle}">
<div class="language-${language}"><pre><code>${escapedCode}</code></pre></div>
</CodePlayground>`
}

/**
 * Markdown-it 插件
 */
export function codePlaygroundPlugin(md) {
  // 保存原始的 fence 渲染器
  const originalFence = md.renderer.rules.fence
  
  // 重写 fence 渲染器
  md.renderer.rules.fence = function(tokens, idx, options, env, renderer) {
    const token = tokens[idx]
    const info = token.info ? token.info.trim() : ''
    const { language, meta } = parseCodeBlockMeta(info)
    
    // 如果明确标记不使用 playground，使用原始渲染器
    if (meta.noPlayground) {
      return originalFence ? originalFence(tokens, idx, options, env, renderer) : ''
    }
    
    // 检查是否支持该语言
    const isSupported = isSupportedLanguage(language)
    
    // 如果支持该语言，或者明确标记使用 playground
    if (isSupported || meta.playground) {
      const normalizedLang = getNormalizedLanguage(language)
      const title = meta.title || ''
      
      return createPlaygroundWrapper(normalizedLang, token.content, title)
    }
    
    // 不支持的语言使用原始渲染器
    return originalFence ? originalFence(tokens, idx, options, env, renderer) : ''
  }
}

/**
 * VitePress 插件配置
 */
export function CodePlaygroundPlugin() {
  return {
    name: 'code-playground',
    config(config) {
      // 确保 markdown 配置存在
      if (!config.markdown) {
        config.markdown = {}
      }
      
      // 添加插件到 markdown-it
      const originalConfig = config.markdown.config
      config.markdown.config = (md) => {
        // 先执行原有配置
        if (originalConfig) {
          originalConfig(md)
        }
        
        // 添加代码演练场插件
        md.use(codePlaygroundPlugin)
      }
    }
  }
}

export default CodePlaygroundPlugin
