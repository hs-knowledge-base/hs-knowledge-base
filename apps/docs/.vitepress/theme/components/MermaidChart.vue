<template>
  <el-card class="mermaid-container" shadow="hover">
    <!-- 标题栏 -->
    <template #header v-if="title">
      <div class="mermaid-header">
        <div class="mermaid-title">
          <el-icon><TrendCharts /></el-icon>
          <span>{{ title }}</span>
        </div>
        <div class="mermaid-actions" v-if="isRendered && !hasError">
          <el-tooltip content="复制代码" placement="top">
            <el-button
              :icon="isCopied ? Check : DocumentCopy"
              :type="isCopied ? 'success' : 'default'"
              size="small"
              circle
              @click="copyCode"
            />
          </el-tooltip>
          <el-tooltip content="下载SVG" placement="top">
            <el-button
              :icon="Download"
              type="default"
              size="small"
              circle
              @click="downloadSvg"
            />
          </el-tooltip>
        </div>
      </div>
    </template>

    <!-- 图表内容 -->
    <div class="mermaid-content">
      <div v-if="isLoading" class="mermaid-loading">
        <el-loading-spinner />
        <span>正在渲染图表...</span>
      </div>

      <!-- 错误状态 -->
      <el-alert
        v-else-if="hasError"
        :title="errorMessage"
        type="error"
        show-icon
        :closable="false"
        class="mermaid-error"
      >
        <template #default>
          <div class="error-actions">
            <el-button
              type="danger"
              size="small"
              @click="retryRender"
              :icon="Refresh"
            >
              重试
            </el-button>
          </div>
        </template>
      </el-alert>

      <!-- 图表预览 -->
      <el-image
        v-else-if="isRendered && svgDataUrl"
        :src="svgDataUrl"
        :alt="title || 'Mermaid图表'"
        fit="contain"
        :preview-src-list="[svgDataUrl]"
        :initial-index="0"
        preview-teleported
        class="mermaid-image"
      >
        <template #error>
          <div class="image-error">
            <span>图表加载失败</span>
          </div>
        </template>
      </el-image>

      <div ref="chartRef" class="hidden-chart-container"></div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import {
  TrendCharts,
  DocumentCopy,
  Check,
  Download,
  Refresh
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  code: {
    type: String,
    required: true
  }
})

// 响应式数据
const chartRef = ref(null)
const isRendered = ref(false)
const hasError = ref(false)
const errorMessage = ref('')
const isLoading = ref(false)
const isCopied = ref(false)
const svgContent = ref('')
const svgDataUrl = ref('')

// 计算属性
const isReady = computed(() => isRendered.value && !hasError.value && !isLoading.value)

// Mermaid配置
const getMermaidConfig = () => ({
  startOnLoad: false,
  theme: 'default',
  themeVariables: {
    primaryColor: '#3f87ff',
    primaryTextColor: '#333',
    primaryBorderColor: '#3f87ff',
    lineColor: '#666',
    sectionBkgColor: '#f8f9fa',
    altSectionBkgColor: '#ffffff',
    gridColor: '#e1e4e8',
    secondaryColor: '#f6f8fa',
    tertiaryColor: '#ffffff'
  },
  flowchart: {
    useMaxWidth: false,  // 允许图表超出容器宽度
    htmlLabels: true,
    curve: 'basis'
  },
  sequence: {
    useMaxWidth: false,  // 允许时序图自然宽度
    diagramMarginX: 50,
    diagramMarginY: 10
  },
  gantt: {
    useMaxWidth: false,  // 允许甘特图自然宽度
    leftPadding: 75,
    gridLineStartPadding: 35
  }
})

// 初始化Mermaid
const initializeMermaid = async () => {
  if (window.mermaidInitialized) return

  const mermaid = await import('mermaid')
  mermaid.default.initialize(getMermaidConfig())
  window.mermaidInitialized = true
}

// 生成唯一ID
const generateId = () => `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// 为SVG添加背景色
const addBackgroundToSvg = (svgString) => {
  // 检测当前主题模式
  const isDark = document.documentElement.classList.contains('dark') ||
                 document.documentElement.getAttribute('data-theme') === 'dark'

  // 根据主题选择背景色
  const backgroundColor = isDark ? '#1a1a1a' : '#ffffff'

  // 为SVG添加背景
  const parser = new DOMParser()
  const svgDoc = parser.parseFromString(svgString, 'image/svg+xml')
  const svgElement = svgDoc.querySelector('svg')

  if (svgElement) {
    // 创建背景矩形
    const rect = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('width', '100%')
    rect.setAttribute('height', '100%')
    rect.setAttribute('fill', backgroundColor)

    // 将背景矩形插入到SVG的最前面
    svgElement.insertBefore(rect, svgElement.firstChild)
  }

  return new XMLSerializer().serializeToString(svgDoc)
}

// 将SVG转换为DataURL，添加背景色
const svgToDataUrl = (svgString) => {
  const modifiedSvgString = addBackgroundToSvg(svgString)
  const blob = new Blob([modifiedSvgString], { type: 'image/svg+xml' })
  return URL.createObjectURL(blob)
}

// 渲染图表
const renderChart = async () => {
  if (!chartRef.value || !props.code) return

  try {
    // 设置加载状态
    isLoading.value = true
    isRendered.value = false
    hasError.value = false
    errorMessage.value = ''

    // 清空之前的内容
    chartRef.value.innerHTML = ''

    // 初始化Mermaid
    await initializeMermaid()

    // 动态导入mermaid
    const mermaid = await import('mermaid')

    // 渲染图表
    const id = generateId()
    const { svg } = await mermaid.default.render(id, props.code)

    // 插入SVG并保存内容
    chartRef.value.innerHTML = svg
    svgContent.value = svg

    // 生成DataURL用于el-image预览
    svgDataUrl.value = svgToDataUrl(svg)

    // 标记渲染完成
    isRendered.value = true
    isLoading.value = false

  } catch (error) {
    console.error('Mermaid渲染错误:', error)
    hasError.value = true
    errorMessage.value = error.message || '未知错误'
    isRendered.value = false
    isLoading.value = false
  }
}

// 重试渲染
const retryRender = () => {
  renderChart()
}

// 复制代码
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
  }
}



// 下载SVG（带背景色）
const downloadSvg = () => {
  if (!svgContent.value) return

  try {
    const finalSvgString = addBackgroundToSvg(svgContent.value)
    const blob = new Blob([finalSvgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${props.title || 'mermaid-chart'}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('下载失败:', error)
  }
}

// 生命周期
onMounted(async () => {
  await nextTick()
  renderChart()
})

// 监听代码变化
watch(() => props.code, renderChart)
</script>

<style scoped>
/* 容器样式 */
.mermaid-container {
  margin: 1.5rem 0;
}

/* 标题栏样式 */
.mermaid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mermaid-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.mermaid-actions {
  display: flex;
  gap: 0.5rem;
}

/* 内容区域样式 */
.mermaid-content {
  padding: 1.5rem;
  text-align: center;
  min-height: 120px;
  position: relative;
  overflow-x: auto;  /* 支持横向滚动 */
}

/* 滚动提示 */
.mermaid-content::-webkit-scrollbar {
  height: 8px;
}

.mermaid-content::-webkit-scrollbar-track {
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.mermaid-content::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 4px;
}

.mermaid-content::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color-darker);
}

/* 图表图片样式 */
.mermaid-image {
  max-width: none;  /* 移除最大宽度限制 */
  min-width: 100%;  /* 至少占满容器宽度 */
  cursor: zoom-in;
  transition: transform 0.2s ease;
}

.mermaid-image:hover {
  transform: scale(1.02);
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: var(--el-text-color-secondary);
  background-color: var(--el-fill-color-lighter);
  border-radius: 4px;
}

/* 隐藏的图表容器 */
.hidden-chart-container {
  position: absolute;
  top: -9999px;
  left: -9999px;
  width: auto;
  height: auto;
  overflow: visible;
}

/* 加载状态样式 */
.mermaid-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--el-text-color-secondary);
  font-size: 0.9rem;
}

/* 错误状态样式 */
.mermaid-error {
  margin: 0;
}

.error-actions {
  margin-top: 1rem;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .mermaid-content {
    padding: 1rem;
  }

  .mermaid-image {
    max-width: 100%;
  }
}</style>


