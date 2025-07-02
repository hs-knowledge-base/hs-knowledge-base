---
layout: page
title: 代码演练场
description: 基于 LiveCodes 的在线代码运行环境
---

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const playgroundContainer = ref(null)
const loading = ref(true)
const error = ref(null)

let playground = null

onMounted(async () => {
  try {
    // 等待 DOM 完全加载
    await nextTick()

    // 等待更长时间确保 VitePress 完全渲染
    let container = null
    let attempts = 0
    const maxAttempts = 20

    while (!container && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 200))
      container = document.getElementById('livecodes-playground')
      attempts++
      console.log(`尝试 ${attempts}/${maxAttempts} 查找容器...`)
    }

    if (!container) {
      console.error('无法找到 livecodes-playground 容器')
      console.error('页面内容:', document.querySelector('.VPContent')?.innerHTML || 'VPContent 未找到')
      throw new Error('Playground 容器元素未找到')
    }

    console.log('找到容器元素:', container)

    // 动态导入 LiveCodes
    const { createPlayground } = await import('livecodes')

    // 从 URL 参数获取配置
    const urlParams = new URLSearchParams(window.location.search)
    const configParam = urlParams.get('config')
    let config = {}

    if (configParam) {
      try {
        config = JSON.parse(decodeURIComponent(configParam))
        console.log('解析到的配置:', config)
      } catch (e) {
        console.warn('无法解析配置参数:', e)
      }
    }

    // 默认配置
    const defaultConfig = {
      activeEditor: 'script',
      script: {
        language: 'javascript',
        content: '// 欢迎使用火山知识库代码演练场\nconsole.log("Hello, World!");'
      },
      style: {
        language: 'css',
        content: '/* CSS 样式 */'
      },
      markup: {
        language: 'html',
        content: '<!-- HTML 标记 -->'
      },
      title: '火山知识库 - 代码演练场',
      autoupdate: true,
      delay: 1500,
      theme: 'dark',
      layout: 'horizontal',
      tools: {
        enabled: 'all',
        active: 'console',
        status: 'open'
      }
    }

    // 合并配置
    const finalConfig = { ...defaultConfig, ...config }
    console.log('最终配置:', finalConfig)

    // 创建 playground - 使用直接获取的容器元素
    playground = await createPlayground(container, {
      config: finalConfig
    })

    loading.value = false
    console.log('LiveCodes Playground 创建成功')

  } catch (err) {
    console.error('初始化 LiveCodes 失败:', err)
    error.value = err.message || '未知错误'
    loading.value = false
  }
})

// 组件卸载时清理
const cleanup = () => {
  if (playground) {
    playground.destroy?.()
    playground = null
  }
}

// 监听页面卸载
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanup)
}
</script>

<template>
  <div class="playground-page">
    <!-- 页面头部 -->
    <div class="playground-header">
      <h1>🔥 火山知识库 - 代码演练场</h1>
      <p>基于 LiveCodes 的在线代码运行环境，支持多种编程语言</p>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载代码演练场...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <h3>❌ 加载失败</h3>
      <p>{{ error }}</p>
      <button @click="() => window.location.reload()" class="retry-button">
        重试
      </button>
    </div>
    
    <!-- LiveCodes 容器 -->
    <div
      v-else
      ref="playgroundContainer"
      class="playground-container"
      id="livecodes-playground"
      style="width: 100%; height: 600px; border: 1px solid #ccc; background: #f5f5f5;"
    >
      <p style="padding: 20px; text-align: center; color: #666;">
        LiveCodes 容器已准备就绪...
      </p>
    </div>
    
    <!-- 使用说明 -->
    <div v-if="!loading && !error" class="playground-footer">
      <details class="usage-guide">
        <summary>📖 使用说明</summary>
        <div class="guide-content">
          <h4>支持的语言</h4>
          <ul>
            <li><strong>前端:</strong> JavaScript, TypeScript, HTML, CSS, Vue, React</li>
            <li><strong>后端:</strong> Python, Go, Rust, Java, PHP, Ruby</li>
            <li><strong>其他:</strong> JSON, YAML, Bash, SQL 等</li>
          </ul>
          
          <h4>快捷键</h4>
          <ul>
            <li><kbd>Ctrl/Cmd + S</kbd> - 保存并运行</li>
            <li><kbd>Ctrl/Cmd + Enter</kbd> - 运行代码</li>
            <li><kbd>F11</kbd> - 全屏模式</li>
          </ul>
          
          <h4>功能特性</h4>
          <ul>
            <li>✅ 实时代码执行</li>
            <li>✅ 语法高亮和自动补全</li>
            <li>✅ 控制台输出</li>
            <li>✅ 错误提示</li>
            <li>✅ 代码分享</li>
            <li>✅ 多种布局模式</li>
          </ul>
        </div>
      </details>
    </div>
  </div>
</template>

<style scoped>
.playground-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--vp-c-bg);
}

.playground-header {
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-alt);
}

.playground-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: var(--vp-c-text-1);
}

.playground-header p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--vp-c-divider);
  border-top: 4px solid var(--vp-c-brand-1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}

.retry-button {
  padding: 0.5rem 1rem;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-button:hover {
  background: var(--vp-c-brand-2);
}

.playground-container {
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 600px;
}

.playground-footer {
  padding: 1rem 2rem;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-alt);
}

.usage-guide {
  max-width: 800px;
  margin: 0 auto;
}

.usage-guide summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--vp-c-text-1);
  padding: 0.5rem 0;
}

.guide-content {
  padding: 1rem 0;
  color: var(--vp-c-text-2);
}

.guide-content h4 {
  margin: 1rem 0 0.5rem 0;
  color: var(--vp-c-text-1);
}

.guide-content ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.guide-content li {
  margin: 0.25rem 0;
}

.guide-content kbd {
  background: var(--vp-c-mute);
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
  font-size: 0.875rem;
  font-family: var(--vp-font-family-mono);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .playground-header {
    padding: 1rem;
  }
  
  .playground-footer {
    padding: 1rem;
  }
  
  .playground-container {
    min-height: 500px;
  }
}
</style>
