<template>
  <div class="contributors-section" v-if="contributors.length > 0">
    <div class="contributors-grid">
      <div 
        v-for="contributor in contributors" 
        :key="contributor.hash" 
        class="contributor-item"
        :title="`${contributor.name} · ${contributor.count} 次贡献`"
      >
        <img 
          :src="getAvatarUrl(contributor.hash)" 
          :alt="contributor.name"
          class="contributor-avatar"
          loading="lazy"
          @error="handleImageError"
        />
        <div class="contributor-info">
          <div class="contributor-name">{{ contributor.name }}</div>
          <div class="contributor-count">{{ contributor.count }} 次贡献</div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="no-contributors">
    <p>暂无贡献记录</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import contributorsData from 'virtual:contributors'

const props = defineProps({
  docPath: {
    type: String,
    required: true
  }
})

// 获取当前文档的贡献者列表
const contributors = computed(() => {
  console.log(`🔍 [Contributors] 当前文档路径: ${props.docPath}`)
  console.log(`📊 [Contributors] 贡献者数据键列表:`, Object.keys(contributorsData).slice(0, 10))
  console.log(`📋 [Contributors] 数据总数: ${Object.keys(contributorsData).length}`)
  
  const docContributors = contributorsData[props.docPath]
  console.log(`👥 [Contributors] 找到的贡献者:`, docContributors)
  
  if (!docContributors || !Array.isArray(docContributors)) {
    console.log(`❌ [Contributors] 没有找到贡献者数据`)
    return []
  }
  // 最多显示 10 个贡献者
  const result = docContributors.slice(0, 10)
  console.log(`✅ [Contributors] 最终显示的贡献者:`, result)
  return result
})

// 生成头像 URL
function getAvatarUrl(hash) {
  return `https://gravatar.com/avatar/${hash}?d=identicon&s=40`
}

// 处理图片加载错误
function handleImageError(event) {
  // 如果 Gravatar 加载失败，使用默认头像
  event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(event.target.alt)}&size=40&background=random`
}
</script>

<style scoped>
.contributors-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.contributors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.contributor-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--vp-c-bg);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider-light);
  transition: all 0.2s ease;
  cursor: default;
}

.contributor-item:hover {
  background: var(--vp-c-bg-alt);
  border-color: var(--vp-c-brand-light);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.contributor-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid var(--vp-c-divider);
}

.contributor-info {
  flex: 1;
  min-width: 0;
}

.contributor-name {
  font-weight: 500;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
}

.contributor-count {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.no-contributors {
  margin-top: 2rem;
  padding: 1.5rem;
  text-align: center;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .contributor-item:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .contributors-grid {
    grid-template-columns: 1fr;
  }
  
  .contributor-item {
    padding: 1rem;
  }
  
  .contributor-avatar {
    width: 48px;
    height: 48px;
  }
}
</style> 