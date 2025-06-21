<template>
  <div class="contributors-wrapper" v-if="contributors.length > 0">
    <h2 v-if="showTitle" class="contributors-title" id="贡献者">贡献者</h2>
    <div class="contributors-section">
      <div class="contributors-grid">
        <div 
          v-for="contributor in contributors" 
          :key="contributor.hash" 
          class="contributor-item"
          :title="contributor.name"
        >
          <img 
            :src="getAvatarUrl(contributor.hash)" 
            :alt="contributor.name"
            class="contributor-avatar"
            loading="lazy"
            @error="handleImageError"
          />
          <div class="contributor-name">{{ contributor.name }}</div>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="showTitle" class="no-contributors">
    <h2 class="contributors-title" id="贡献者">贡献者</h2>
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
  },
  showTitle: {
    type: Boolean,
    default: false
  }
})

/**
 * 获取当前文档的贡献者列表
 * @returns {Array} 贡献者列表
 */
const contributors = computed(() => {
  const docContributors = contributorsData[props.docPath]
  
  if (!docContributors || !Array.isArray(docContributors)) {
    return []
  }
  return docContributors
})

/**
 * 生成头像 URL
 * @param {string} hash - 邮箱的MD5哈希值
 * @returns {string} 头像 URL
 */
function getAvatarUrl(hash) {
  // 确保hash是有效的32位MD5字符串
  if (!hash || hash.length !== 32) {
    console.warn('Invalid hash for avatar:', hash)
    return getDefaultAvatar('Unknown')
  }
  
  // 使用 Gravatar，如果用户没有注册则会触发 404 错误，然后回退到默认头像
  return `https://www.gravatar.com/avatar/${hash}?s=40&r=g&d=404`
}

/**
 * 生成默认头像URL
 * @param {string} name - 贡献者姓名
 * @returns {string} 默认头像 URL
 */
function getDefaultAvatar(name) {
  // 使用 UI Avatars 生成基于姓名的头像
  const colors = [
    '6366f1', // 蓝紫色
    'ef4444', // 红色
    'f59e0b', // 橙色
    '10b981', // 绿色
    '8b5cf6', // 紫色
    'f97316', // 橙红色
    '06b6d4', // 青色
    'ec4899'  // 粉色
  ]
  
  // 根据姓名生成一个稳定的颜色索引
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  const backgroundColor = colors[colorIndex]
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=40&background=${backgroundColor}&color=ffffff&rounded=true&bold=true&format=svg`
}

/**
 * 处理图片加载错误
 * @param {Event} event - 图片加载错误事件
 */
function handleImageError(event) {
  // 查找对应的贡献者
  const imgSrc = event.target.src
  const contributor = contributors.value.find(c => imgSrc.includes(c.hash))
  
  if (contributor) {
    console.log('Gravatar 加载失败，切换到默认头像:', contributor.name)
    // 如果 Gravatar 加载失败（404 或网络问题），使用基于姓名的美观头像
    event.target.src = getDefaultAvatar(contributor.name)
  }
}
</script>

<style scoped>
.contributors-wrapper {
  margin-top: 2rem;
}

.contributors-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
}

.contributors-section {
  margin-top: 0;
}

.contributors-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.contributor-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  cursor: default;
}

.contributor-item:hover {
  transform: translateY(-1px);
}

.contributor-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid var(--vp-c-divider-light);
  transition: all 0.2s ease;
}

.contributor-item:hover .contributor-avatar {
  border-color: var(--vp-c-brand);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.contributor-name {
  font-size: 0.875rem;
  color: var(--vp-c-text-1);
  white-space: nowrap;
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
  .contributor-item:hover .contributor-avatar {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .contributors-grid {
    gap: 0.5rem;
  }
  
  .contributor-avatar {
    width: 28px;
    height: 28px;
  }
  
  .contributor-name {
    font-size: 0.8rem;
  }
}
</style> 