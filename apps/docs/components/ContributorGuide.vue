<template>
  <div class="contributor-guide">
    <div class="become-contributor">
      <h2><span class="icon">🚀</span> 成为贡献者</h2>
      <p>如果你也想为火山知识库做出贡献，欢迎：</p>  
      <p class="check-guide">查看<a href="https://github.com/huoshan25/hs-knowledge-base/blob/main/CONTRIBUTING.md" target="_blank" class="external-link">贡献指南 <span class="external-icon">↗</span></a>了解详细的参与方式。</p>
    </div>

    <div class="contributor-types">
      <h3><span class="icon">👨‍💻</span> 贡献者类型</h3>
      
      <div class="type-description">
        <h4>代码贡献者</h4>
        <p>为项目功能开发、Bug修复、性能优化等做出贡献的开发者。</p>
      </div>
      
      <div class="type-description">
        <h4>内容贡献者</h4>
        <p>为知识库添加技术文章、修正内容错误、完善文档的贡献者。</p>
      </div>
      
      <div class="type-description">
        <h4>社区建设者</h4>
        <p>参与项目讨论、提供反馈建议、帮助新人入门的社区成员。</p>
      </div>
    </div>

    <div class="thank-you-section">
      <p>再次感谢每一位贡献者的付出！ 🙏</p>
    </div>
  </div>
</template>

<style scoped>
.contributor-guide {
  max-width: 800px;
  margin: 2rem auto;
  padding-top: 2rem;
  border-top: 1px solid var(--vp-c-divider);
}

.become-contributor {
  margin-bottom: 2rem;
}

.become-contributor h2 {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  color: var(--vp-c-brand);
}

.become-contributor .icon,
.contributor-types .icon {
  margin-right: 0.5rem;
  font-size: 1.2em;
}

.contribution-types {
  margin: 1.5rem 0;
}

.contribution-type {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.8rem;
}

.type-icon {
  font-size: 1.2rem;
  margin-right: 0.8rem;
  min-width: 1.5rem;
  text-align: center;
}

.type-content {
  flex: 1;
}

.check-guide {
  margin-top: 1rem;
  font-style: italic;
}

.contributor-types {
  margin-top: 2rem;
}

.contributor-types h3 {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  color: var(--vp-c-brand);
}

.type-description {
  margin-bottom: 1rem;
  padding-left: 1rem;
  border-left: 3px solid var(--vp-c-divider);
}

.type-description h4 {
  margin-bottom: 0.3rem;
  color: var(--vp-c-text-1);
}

.type-description p {
  margin: 0;
  color: var(--vp-c-text-2);
}

.thank-you-section {
  text-align: center;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 1.1rem;
  color: var(--vp-c-text-1);
}

.external-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  color: var(--vp-c-brand);
  font-weight: 500;
  transition: color 0.2s;
}

.external-link:hover {
  color: var(--vp-c-brand-dark);
}

.external-icon {
  display: inline-block;
  margin-left: 4px;
  font-size: 0.9em;
}
</style> 