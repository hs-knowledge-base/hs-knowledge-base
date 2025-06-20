---
layout: page
sidebar: false
---

<div class="contributors-page">

<Contributors />

<ContributorGuide />

</div>

<script setup>
import Contributors from './components/Contributors.vue'
import ContributorGuide from './components/ContributorGuide.vue'
</script>

<style>
.contributors-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1rem;
}

.contributors-page h1 {
  text-align: center;
  margin-bottom: 1rem;
  position: relative;
  padding-bottom: 1rem;
}

.contributors-page h1:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 3px;
  background-color: var(--vp-c-brand);
  border-radius: 3px;
}

.contributors-page > p {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 2rem;
}

.contributor-info-section {
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
</style> 