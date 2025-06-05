<template>
  <div class="code-playground">
    <div class="playground-header">
      <h3>{{ title }}</h3>
      <div class="playground-actions">
        <button @click="runCode" class="btn run-btn">运行</button>
        <button @click="resetCode" class="btn reset-btn">重置</button>
      </div>
    </div>
    
    <div class="playground-container">
      <div class="editor-container">
        <textarea 
          ref="codeEditor" 
          v-model="currentCode" 
          class="code-editor" 
          spellcheck="false"
          @keydown.tab.prevent="handleTab"
        ></textarea>
      </div>
      
      <div class="result-container">
        <div class="result-header">
          <span>输出结果</span>
          <button @click="clearResult" class="btn clear-btn">清空</button>
        </div>
        <div class="result-output" ref="resultOutput"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CodePlayground',
  props: {
    title: {
      type: String,
      default: '代码演练场'
    },
    initialCode: {
      type: String,
      default: '// 在这里编写JavaScript代码\nconsole.log("Hello, 火山知识库!");'
    },
    height: {
      type: String,
      default: '300px'
    }
  },
  
  data() {
    return {
      currentCode: this.initialCode,
      originalCode: this.initialCode,
      consoleOutput: []
    }
  },
  
  mounted() {
    // 设置编辑器和输出区域的高度
    this.$refs.codeEditor.style.height = this.height;
    this.$refs.resultOutput.style.height = this.height;
    
    // 重写控制台方法以捕获输出
    this.overrideConsole();
  },
  
  methods: {
    runCode() {
      // 清空之前的输出
      this.clearResult();
      
      try {
        // 使用Function构造器创建可执行的函数
        const executeCode = new Function(`
          // 捕获控制台输出
          const originalConsole = console;
          console = {
            log: (...args) => {
              originalConsole.log(...args);
              window.dispatchEvent(new CustomEvent('console-log', { detail: args }));
            },
            error: (...args) => {
              originalConsole.error(...args);
              window.dispatchEvent(new CustomEvent('console-error', { detail: args }));
            },
            warn: (...args) => {
              originalConsole.warn(...args);
              window.dispatchEvent(new CustomEvent('console-warn', { detail: args }));
            },
            info: (...args) => {
              originalConsole.info(...args);
              window.dispatchEvent(new CustomEvent('console-info', { detail: args }));
            }
          };
          
          ${this.currentCode}
          
          // 恢复原始控制台
          console = originalConsole;
        `);
        
        // 执行代码
        executeCode();
      } catch (error) {
        this.appendToOutput(error.toString(), 'error');
      }
    },
    
    resetCode() {
      this.currentCode = this.originalCode;
      this.clearResult();
    },
    
    clearResult() {
      if (this.$refs.resultOutput) {
        this.$refs.resultOutput.innerHTML = '';
      }
    },
    
    appendToOutput(content, type = 'log') {
      const outputElement = document.createElement('div');
      outputElement.className = `output-item output-${type}`;
      
      if (typeof content === 'object') {
        try {
          content = JSON.stringify(content, null, 2);
        } catch (e) {
          content = content.toString();
        }
      }
      
      outputElement.textContent = content;
      this.$refs.resultOutput.appendChild(outputElement);
      
      // 自动滚动到底部
      this.$refs.resultOutput.scrollTop = this.$refs.resultOutput.scrollHeight;
    },
    
    handleTab(e) {
      // 插入两个空格而不是tab字符
      const start = this.$refs.codeEditor.selectionStart;
      const end = this.$refs.codeEditor.selectionEnd;
      
      this.currentCode = this.currentCode.substring(0, start) + '  ' + this.currentCode.substring(end);
      
      // 设置光标位置
      this.$nextTick(() => {
        this.$refs.codeEditor.selectionStart = this.$refs.codeEditor.selectionEnd = start + 2;
      });
    },
    
    overrideConsole() {
      // 监听自定义控制台事件
      window.addEventListener('console-log', (e) => {
        e.detail.forEach(item => this.appendToOutput(item, 'log'));
      });
      
      window.addEventListener('console-error', (e) => {
        e.detail.forEach(item => this.appendToOutput(item, 'error'));
      });
      
      window.addEventListener('console-warn', (e) => {
        e.detail.forEach(item => this.appendToOutput(item, 'warn'));
      });
      
      window.addEventListener('console-info', (e) => {
        e.detail.forEach(item => this.appendToOutput(item, 'info'));
      });
    }
  }
}
</script>

<style scoped>
.code-playground {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  margin: 16px 0;
  overflow: hidden;
}

.playground-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.playground-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.playground-actions {
  display: flex;
  gap: 8px;
}

.playground-container {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .playground-container {
    flex-direction: row;
  }
  
  .editor-container,
  .result-container {
    flex: 1;
  }
}

.editor-container,
.result-container {
  position: relative;
  border: none;
}

.editor-container {
  border-bottom: 1px solid var(--vp-c-divider);
}

@media (min-width: 768px) {
  .editor-container {
    border-right: 1px solid var(--vp-c-divider);
    border-bottom: none;
  }
}

.code-editor {
  width: 100%;
  height: 300px;
  padding: 16px;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.5;
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg);
  border: none;
  resize: none;
  outline: none;
  tab-size: 2;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 14px;
  font-weight: 500;
}

.result-output {
  height: 300px;
  padding: 16px;
  overflow-y: auto;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.5;
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg);
}

.output-item {
  margin-bottom: 6px;
  white-space: pre-wrap;
  word-break: break-word;
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

.btn {
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.run-btn {
  background-color: var(--vp-c-brand);
  color: white;
}

.run-btn:hover {
  background-color: var(--vp-c-brand-dark);
}

.reset-btn, .clear-btn {
  background-color: var(--vp-c-gray);
  color: var(--vp-c-text-1);
}

.reset-btn:hover, .clear-btn:hover {
  background-color: var(--vp-c-gray-dark);
}
</style> 