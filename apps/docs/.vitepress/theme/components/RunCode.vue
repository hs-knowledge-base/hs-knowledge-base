<template>
  <div class="run-code">
    <div class="code-container">
      <div class="code-header">
        <span>{{ language.toUpperCase() }}</span>
        <button @click="runCode" class="run-button">运行</button>
      </div>
      <div class="code-content">
        <pre><code :class="`language-${language}`">{{ code }}</code></pre>
      </div>
    </div>
    <div v-if="showOutput" class="output-container">
      <div class="output-header">
        <span>输出结果</span>
        <button @click="clearOutput" class="clear-button">清空</button>
      </div>
      <div class="output-content" ref="outputContent"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RunCode',
  props: {
    code: {
      type: String,
      required: true
    },
    language: {
      type: String,
      default: 'js'
    }
  },
  
  data() {
    return {
      showOutput: false,
      outputLogs: []
    }
  },
  
  methods: {
    runCode() {
      this.showOutput = true
      this.clearOutput()
      
      if (this.language === 'js' || this.language === 'javascript') {
        this.runJavaScript()
      } else if (this.language === 'html') {
        this.runHtml()
      } else if (this.language === 'css') {
        this.runCss()
      } else {
        this.addOutput(`暂不支持运行 ${this.language} 代码`, 'error')
      }
    },
    
    runJavaScript() {
      try {
        // 保存原始控制台方法
        const originalConsole = {
          log: console.log,
          error: console.error,
          warn: console.warn,
          info: console.info
        }
        
        // 覆盖控制台方法
        console.log = (...args) => {
          originalConsole.log(...args)
          this.addOutput(args.map(arg => this.formatOutput(arg)).join(' '), 'log')
        }
        
        console.error = (...args) => {
          originalConsole.error(...args)
          this.addOutput(args.map(arg => this.formatOutput(arg)).join(' '), 'error')
        }
        
        console.warn = (...args) => {
          originalConsole.warn(...args)
          this.addOutput(args.map(arg => this.formatOutput(arg)).join(' '), 'warn')
        }
        
        console.info = (...args) => {
          originalConsole.info(...args)
          this.addOutput(args.map(arg => this.formatOutput(arg)).join(' '), 'info')
        }
        
        // 执行代码
        new Function(this.code)()
        
        // 恢复原始控制台方法
        console.log = originalConsole.log
        console.error = originalConsole.error
        console.warn = originalConsole.warn
        console.info = originalConsole.info
      } catch (error) {
        this.addOutput(error.toString(), 'error')
      }
    },
    
    runHtml() {
      const iframe = document.createElement('iframe')
      iframe.style.width = '100%'
      iframe.style.height = '300px'
      iframe.style.border = 'none'
      iframe.style.borderRadius = '4px'
      
      this.$refs.outputContent.innerHTML = ''
      this.$refs.outputContent.appendChild(iframe)
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
      iframeDoc.open()
      iframeDoc.write(this.code)
      iframeDoc.close()
    },
    
    runCss() {
      const previewContainer = document.createElement('div')
      previewContainer.className = 'css-preview'
      
      const previewLabel = document.createElement('div')
      previewLabel.className = 'preview-label'
      previewLabel.textContent = 'CSS 预览'
      
      const previewContent = document.createElement('div')
      previewContent.className = 'preview-content'
      
      const styleElement = document.createElement('style')
      styleElement.textContent = this.code
      
      previewContainer.appendChild(previewLabel)
      previewContainer.appendChild(previewContent)
      previewContainer.appendChild(styleElement)
      
      this.$refs.outputContent.innerHTML = ''
      this.$refs.outputContent.appendChild(previewContainer)
    },
    
    clearOutput() {
      if (this.$refs.outputContent) {
        this.$refs.outputContent.innerHTML = ''
      }
    },
    
    addOutput(content, type) {
      const outputElement = document.createElement('div')
      outputElement.className = `output-item output-${type}`
      outputElement.textContent = content
      
      if (this.$refs.outputContent) {
        this.$refs.outputContent.appendChild(outputElement)
      }
    },
    
    formatOutput(value) {
      if (typeof value === 'object') {
        try {
          return JSON.stringify(value, null, 2)
        } catch (e) {
          return String(value)
        }
      }
      return String(value)
    }
  }
}
</script>

<style scoped>
.run-code {
  margin: 1.5rem 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
}

.code-container {
  position: relative;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 14px;
  font-weight: 500;
}

.code-content {
  margin: 0;
  padding: 0;
}

.code-content pre {
  margin: 0;
  padding: 16px;
  background-color: var(--vp-c-bg-soft);
  overflow-x: auto;
}

.output-container {
  border-top: 1px solid var(--vp-c-divider);
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--vp-c-bg-soft);
  font-size: 14px;
  font-weight: 500;
}

.output-content {
  padding: 12px;
  min-height: 50px;
  max-height: 300px;
  overflow-y: auto;
  background-color: var(--vp-c-bg);
  font-family: monospace;
}

.run-button, .clear-button {
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.run-button {
  background-color: var(--vp-c-brand);
  color: white;
}

.run-button:hover {
  background-color: var(--vp-c-brand-dark);
}

.clear-button {
  background-color: var(--vp-c-gray);
  color: var(--vp-c-text-1);
}

.clear-button:hover {
  background-color: var(--vp-c-gray-dark);
}

.output-item {
  margin-bottom: 6px;
  white-space: pre-wrap;
  word-break: break-word;
}

.output-log {
  color: var(--vp-c-text-1);
}

.output-error {
  color: #e74c3c;
}

.output-warn {
  color: #f39c12;
}

.output-info {
  color: #3498db;
}

.css-preview {
  padding: 12px;
  background-color: white;
  border-radius: 4px;
}

.preview-label {
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--vp-c-text-2);
}

.preview-content {
  min-height: 100px;
  border-radius: 4px;
  background-color: #f8f9fa;
}

:deep(.dark) .css-preview {
  background-color: #1e1e1e;
}

:deep(.dark) .preview-content {
  background-color: #2d2d2d;
}
</style> 