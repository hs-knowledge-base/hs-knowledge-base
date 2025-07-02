<!-- 这个组件用于增强现有的代码块，添加 playground 功能 -->
<script>
// 这是一个客户端脚本，用于在页面加载后增强代码块
import { onMounted } from 'vue'

export default {
  name: 'CodePlaygroundEnhancer',
  setup() {
    // 语言映射到 LiveCodes 支持的语言
    const languageMap = {
      'javascript': 'javascript',
      'js': 'javascript',
      'typescript': 'typescript',
      'ts': 'typescript',
      'python': 'python',
      'py': 'python',
      'go': 'go',
      'rust': 'rust',
      'java': 'java',
      'cpp': 'cpp',
      'c++': 'cpp',
      'c': 'c',
      'php': 'php',
      'ruby': 'ruby',
      'html': 'html',
      'css': 'css',
      'vue': 'vue',
      'react': 'jsx',
      'jsx': 'jsx',
      'tsx': 'tsx',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'bash': 'bash',
      'shell': 'bash',
      'sql': 'sql'
    }

    // 检查是否支持该语言
    const isSupportedLanguage = (lang) => {
      if (!lang) return false
      const normalizedLang = lang.toLowerCase()
      return Object.keys(languageMap).includes(normalizedLang)
    }

    // 获取标准化的语言名称
    const getNormalizedLanguage = (lang) => {
      if (!lang) return 'javascript'
      const normalizedLang = lang.toLowerCase()
      return languageMap[normalizedLang] || normalizedLang
    }

    // 提取代码块内容
    const extractCodeContent = (codeBlock) => {
      const codeElement = codeBlock.querySelector('code')
      return codeElement ? codeElement.textContent : ''
    }

    // 提取语言信息
    const extractLanguage = (codeBlock) => {
      const className = codeBlock.className
      const match = className.match(/language-(\w+)/)
      const language = match ? match[1] : 'text'
      console.log(`提取语言: ${className} -> ${language}`)
      return language
    }

    // 创建 playground 按钮
    const createPlaygroundButton = (language, code) => {
      console.log(`创建按钮: 语言=${language}, 代码长度=${code.length}`)

      const button = document.createElement('button')
      button.className = 'playground-button'
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H8zM7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>
          <path d="M10 7h4v2h-4V7zm0 4h4v2h-4v-2zm0 4h4v2h-4v-2z"/>
        </svg>
        <span>运行</span>
      `
      button.title = `在 LiveCodes 中运行 ${language} 代码`

      button.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        console.log(`点击运行按钮: ${language}`)
        openInPlayground(language, code)
      })

      return button
    }

    // 打开 LiveCodes Playground
    const openInPlayground = (language, code) => {
      console.log(`准备打开 playground: ${language}`)

      const normalizedLang = getNormalizedLanguage(language)
      console.log(`标准化语言: ${language} -> ${normalizedLang}`)

      // 构建 LiveCodes 配置
      const config = {
        activeEditor: 'script',
        script: {
          language: normalizedLang,
          content: code
        },
        title: `${language} 代码示例 - 火山知识库`,
        autoupdate: true,
        delay: 1500,
        theme: 'dark',
        tools: {
          active: 'console',
          status: 'open'
        }
      }

      // 根据语言类型调整配置
      if (['html', 'css'].includes(normalizedLang)) {
        config.activeEditor = normalizedLang
        config[normalizedLang] = {
          language: normalizedLang,
          content: code
        }
        delete config.script
      }

      console.log('LiveCodes 配置:', config)

      // 编码配置并打开新窗口
      const encodedConfig = encodeURIComponent(JSON.stringify(config))
      const playgroundUrl = `/playground?config=${encodedConfig}`

      console.log('打开 URL:', playgroundUrl)
      window.open(playgroundUrl, '_blank', 'width=1200,height=800')
    }

    // 增强代码块
    const enhanceCodeBlocks = () => {
      // 确保在客户端执行
      if (typeof window === 'undefined') {
        return
      }

      // 检查是否在 playground 页面，如果是则跳过
      if (window.location.pathname.includes('/playground')) {
        return
      }

      const codeBlocks = document.querySelectorAll('div[class*="language-"]')
      console.log(`找到 ${codeBlocks.length} 个代码块`)

      if (codeBlocks.length === 0) {
        return
      }

      codeBlocks.forEach((codeBlock, index) => {
        console.log(`处理代码块 ${index + 1}:`, codeBlock.className)

        // 避免重复处理
        if (codeBlock.querySelector('.playground-button')) {
          console.log(`代码块 ${index + 1} 已有按钮，跳过`)
          return
        }

        const language = extractLanguage(codeBlock)
        const code = extractCodeContent(codeBlock)

        console.log(`代码块 ${index + 1}: 语言=${language}, 代码长度=${code.length}`)

        // 检查是否支持该语言
        if (!isSupportedLanguage(language)) {
          console.log(`语言 ${language} 不支持，跳过`)
          return
        }

        // 检查是否明确禁用 playground
        if (codeBlock.textContent.includes('no-playground')) {
          console.log(`代码块 ${index + 1} 明确禁用 playground`)
          return
        }

        console.log(`语言 ${language} 支持，准备添加按钮`)

        try {
          // 创建按钮容器
          const buttonContainer = document.createElement('div')
          buttonContainer.className = 'code-actions'

          // 创建 playground 按钮
          const playgroundButton = createPlaygroundButton(language, code)
          buttonContainer.appendChild(playgroundButton)

          // 将按钮添加到代码块
          codeBlock.style.position = 'relative'
          codeBlock.appendChild(buttonContainer)

          console.log(`✅ 成功为代码块 ${index + 1} 添加了 playground 按钮`)
        } catch (error) {
          console.error(`❌ 为代码块 ${index + 1} 添加按钮失败:`, error)
        }
      })
    }

    onMounted(() => {
      // 确保在客户端执行
      if (typeof window === 'undefined') return

      // 跳过 playground 页面
      if (window.location.pathname.includes('/playground')) {
        return
      }

      console.log('CodePlayground 组件已挂载')

      let enhanceTimeout = null

      const debouncedEnhance = () => {
        if (enhanceTimeout) clearTimeout(enhanceTimeout)
        enhanceTimeout = setTimeout(enhanceCodeBlocks, 300)
      }

      // 初始执行 - 延迟确保页面完全渲染
      setTimeout(enhanceCodeBlocks, 1000)

      // 监听路由变化，重新增强代码块
      const observer = new MutationObserver(debouncedEnhance)

      observer.observe(document.body, {
        childList: true,
        subtree: true
      })

      // 监听 VitePress 的路由变化
      if (window.__VITEPRESS__) {
        window.addEventListener('vitepress:route-changed', debouncedEnhance)
      }
    })

    return {}
  }
}
</script>

<template>
  <!-- 这个组件不渲染任何内容，只是用来执行脚本 -->
</template>
