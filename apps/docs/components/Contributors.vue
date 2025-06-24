<template>
  <div class="contributors">
    <!-- 团队成员 -->
    <section class="contributor-section" v-if="teamCollaborators.length > 0">
      <div class="section-header">
        <div class="divider-line"></div>
        <h2 class="section-title">团队成员</h2>
        <div class="divider-line"></div>
      </div>
      
      <div class="contributors-grid">
        <div 
          v-for="collaborator in teamCollaborators" 
          :key="collaborator.id"
          class="contributor-card"
        >
          <div class="contributor-avatar">
            <img :src="collaborator.avatar" :alt="collaborator.name" />
          </div>
          <div class="contributor-info">
            <h3 class="contributor-name">{{ collaborator.name }}</h3>
            <p v-if="collaborator.realName && collaborator.realName !== collaborator.name" class="contributor-real-name">{{ collaborator.realName }}</p>
            <p v-if="collaborator.bio" class="contributor-bio">{{ collaborator.bio }}</p>
            <div v-if="collaborator.location || collaborator.company" class="contributor-meta">
              <span v-if="collaborator.company && collaborator.company !== 'none'" class="meta-item">🏢 {{ collaborator.company }}</span>
              <span v-if="collaborator.location" class="meta-item">📍 {{ collaborator.location }}</span>
            </div>
          </div>
          <div class="contributor-links">
            <a 
              v-if="collaborator.github" 
              :href="collaborator.github" 
              target="_blank"
              title="GitHub"
              class="github-link"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span class="link-tooltip">GitHub</span>
            </a>
            <a 
              v-if="collaborator.twitter" 
              :href="collaborator.twitter" 
              target="_blank"
              title="Twitter"
              class="twitter-link"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              <span class="link-tooltip">Twitter</span>
            </a>
            <a 
              v-if="collaborator.website" 
              :href="collaborator.website" 
              target="_blank"
              title="个人网站"
              class="website-link"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              <span class="link-tooltip">访问网站</span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- 贡献者头像墙 -->
    <section class="contributor-section" v-if="allContributors.length > 0">
      <div class="section-header">
        <div class="divider-line"></div>
        <h2 class="section-title">贡献者</h2>
        <div class="divider-line"></div>
      </div>
      <p class="section-desc">感谢以下为火山知识库做出贡献的人。</p>
      
      <div class="avatar-wall">
        <a 
          v-for="contributor in allContributors" 
          :key="contributor.id"
          :href="contributor.github"
          target="_blank"
          class="avatar-item"
          :title="contributor.name"
        >
          <img :src="contributor.avatar" :alt="contributor.name" />
        </a>
      </div>
    </section>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <p>正在加载贡献者信息...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-if="!loading && allContributors.length === 0" class="error-message">
      <p>暂无贡献者数据</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 响应式数据
const loading = ref(false)
const allContributors = ref([])

const teamCollaborators = computed(() => {
  return allContributors.value.filter(c => c.isCollaborator)
})

// 从生成的JSON文件加载贡献者数据
const loadContributors = async () => {
  loading.value = true;
  
  try {
    const response = await fetch('/data/contributors.json');
    
    if (!response.ok) {
      throw new Error(`加载贡献者数据失败: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 确保contributors字段存在
    if (!data.contributors || !Array.isArray(data.contributors)) {
      console.error('贡献者数据格式错误');
      allContributors.value = [];
      return;
    }
    
    // 格式化贡献者数据
    const formattedContributors = data.contributors.map(contributor => {
      // 确保网站链接是完整URL
      let websiteUrl = contributor.blog || null;
      if (websiteUrl && !websiteUrl.startsWith('http')) {
        websiteUrl = 'https://' + websiteUrl;
      }
      
      // Twitter链接
      const twitterUrl = contributor.twitter_username 
        ? `https://twitter.com/${contributor.twitter_username}` 
        : null;
      
      return {
        id: contributor.login,
        name: contributor.name || contributor.login,
        realName: contributor.name,
        bio: contributor.bio,
        location: contributor.location,
        company: contributor.company,
        avatar: contributor.avatar_url,
        github: contributor.html_url,
        twitter: twitterUrl,
        website: websiteUrl,
        contributions: contributor.contributions,
        isCollaborator: contributor.isCollaborator,
        type: contributor.isCollaborator ? 'core' : 'community'
      }
    });
    
    allContributors.value = formattedContributors;
    console.log('成功加载贡献者数据:', formattedContributors);
  } catch (error) {
    console.error('加载失败:', error.message);
    allContributors.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadContributors()
})
</script>

<style scoped>
.contributors {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
  box-sizing: border-box;
}

/* 章节样式 */
.contributor-section {
  margin-bottom: 4rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  width: 100%;
}

.section-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--vp-c-text-1);
  text-align: center;
  margin: 0 1rem;
  white-space: nowrap;
}

.divider-line {
  height: 1px;
  background-color: var(--vp-c-divider);
  flex-grow: 1;
  max-width: 300px;
}

.section-desc {
  font-size: 1.1rem;
  color: var(--vp-c-text-2);
  margin-bottom: 2rem;
  line-height: 1.6;
  text-align: center;
}

/* 贡献者网格 */
.contributors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

/* 贡献者卡片 */
.contributor-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.3s ease;
  position: relative;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.contributor-card:hover {
  cursor: pointer;
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  border-color: var(--vp-c-brand-1);
}

/* 头像 */
.contributor-avatar {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.contributor-avatar img {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 4px solid var(--vp-c-divider);
  transition: border-color 0.3s ease;
  display: block;
}

.contributor-card:hover .contributor-avatar img {
  border-color: var(--vp-c-brand-1);
}

/* 贡献者信息 */
.contributor-info {
  margin-bottom: 1.5rem;
  flex-grow: 1;
}

.contributor-name {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-1);
}

.contributor-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  margin-bottom: 0.75rem;
}

.contributor-real-name {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin: 0.25rem 0;
  font-style: italic;
}

.contributor-bio {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  line-height: 1.4;
  margin: 0.75rem 0;
  max-height: 3.6em; /* 限制最多显示3行 */
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.contributor-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.75rem;
}

.meta-item {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
}

/* 链接 */
.contributor-links {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: auto;
}

.contributor-links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  transition: all 0.3s ease;
  text-decoration: none;
  border: 1px solid var(--vp-c-divider);
}

.contributor-links a:hover {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
  transform: scale(1.1);
}

.website-link {
  position: relative;
}

.link-tooltip {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s, visibility 0.3s;
  border: 1px solid var(--vp-c-divider);
  pointer-events: none;
}

.website-link:hover .link-tooltip {
  opacity: 1;
  visibility: visible;
}

/* 贡献者头像墙 */

.avatar-wall {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 0;
}

.avatar-item {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2px solid var(--vp-c-divider);
}

.avatar-item:hover {
  transform: translateY(-3px);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
}

.avatar-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 加载状态 */
.loading {
  text-align: center;
  padding: 3rem;
  color: var(--vp-c-text-2);
  font-size: 1.1rem;
}

/* 错误消息 */
.error-message {
  text-align: center;
  padding: 3rem;
  color: var(--vp-c-text-2);
  font-size: 1.1rem;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
  margin: 2rem 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .contributors-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .contributor-card {
    padding: 1.5rem;
  }
  
  .contributor-avatar img {
    width: 80px;
    height: 80px;
  }
  
  .section-title {
    font-size: 1.7rem;
  }
  
  .section-desc {
    font-size: 1rem;
  }
  
  .avatar-item {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .contributors {
    padding: 1rem;
  }
  
  .contributor-card {
    padding: 1.25rem;
  }
  
  .contributor-avatar img {
    width: 72px;
    height: 72px;
  }
  
  .contributor-links a {
    width: 36px;
    height: 36px;
  }
  
  .avatar-item {
    width: 35px;
    height: 35px;
  }
}
</style> 