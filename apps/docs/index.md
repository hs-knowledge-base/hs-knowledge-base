---
layout: home

hero:
  name: 火山知识库
  text: 知识分享平台
  tagline: 客户端、服务端、系统底层及DevOps的技术知识整理与分享
  image:
    src: img/logo.png
    alt: 火山知识库
  actions:
    - theme: brand
      text: 开始探索
      link: /client/
    - theme: alt
      text: 在 GitHub 上查看
      link: https://github.com/huoshan25/hs-knowledge-base

features:
  - icon: 
      src: svg/client.svg
    title: 客户端技术
    details: Web前端、React Native、小程序、Electron、Three.js等多端开发技术与实践
    link: /client/
  - icon:
      src: svg/server.svg
    title: 服务端技术
    details: Node.js、Go、Java、Python等服务端开发，微服务架构与API设计
    link: /server/
  - icon:
      src: svg/systems.svg
    title: 系统与底层
    details: Rust、系统编程、性能优化、WebAssembly等底层技术
    link: /systems/
  - icon:
      src: svg/devops.svg
    title: DevOps与云原生
    details: CI/CD、容器化、Kubernetes、云服务、监控与可观测性
    link: /devops/
  - icon:
      src: svg/ai.svg
    title: AI应用与大模型
    details: LLM、ChatGPT、Prompt工程、AI集成开发、模型部署与优化
    link: /ai/
---

<div class="custom-block">
  <p class="custom-block-title">💡 每日一题</p>
  <p>React中的useEffect和useLayoutEffect有什么区别？</p>
  <details>
    <summary>查看答案</summary>
    <p>useEffect是异步执行的，而useLayoutEffect是同步执行的。useLayoutEffect会在所有DOM变更之后同步调用，但在浏览器绘制之前完成。这使得它适合于需要在DOM更新后立即执行的操作，如测量DOM元素或者调整布局。而useEffect是在浏览器绘制之后异步执行的，更适合大多数副作用操作。</p>
  </details>
</div>

# 火山知识库

欢迎访问火山知识库！这里整合了从客户端到服务端，从应用层到系统层的全栈技术资料。

## 内容领域

- [客户端技术](/client/) - Web前端、移动应用、桌面应用、3D等
- [服务端技术](/server/) - API开发、数据处理、微服务架构、云服务
- [系统与底层](/systems/) - Rust、系统编程、性能优化、编译原理
- [DevOps与云原生](/devops/) - 自动化部署、容器编排、监控告警、基础设施即代码
- [AI应用与大模型](/ai/) - LLM、ChatGPT、Prompt工程、AI集成开发、模型部署与优化

## 关于本项目

这是一个基于VitePress和Monorepo架构的知识库项目，专注于提供结构化、实用的技术文档。采用内容和展示层分离的设计，便于多人协作和长期维护。 