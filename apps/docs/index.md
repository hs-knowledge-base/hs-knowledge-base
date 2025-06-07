---
layout: home

hero:
  name: "火山知识库"
  text: "个人技术笔记与经验分享"
  tagline: 记录学习心得，分享技术经验
  image:
    src: /img/logo.png
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
    details: 开发语言与框架、数据存储技术、中间件技术、架构与设计模式、运维与部署、安全技术等
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

# 欢迎来到火山知识库

这是一个个人维护的技术笔记分享平台，记录了我在学习和工作过程中的心得体会与技术总结。希望这些内容能对你有所帮助！

## 知识领域

火山知识库分为五大技术领域：

- [客户端技术](/client/) - Web前端、React Native、小程序、Electron、Three.js等
- [服务端技术](/server/) - 包含以下六个方面：
  - [开发语言与框架](/server/开发语言与框架/) - Node.js、Go、Java、Python等语言及其框架
  - [数据存储技术](/server/数据存储技术/) - 关系型数据库、NoSQL、内存数据库、时序数据库等
  - [中间件技术](/server/中间件技术/) - 消息队列、缓存系统、API网关、服务发现等
  - [架构与设计模式](/server/架构与设计模式/) - 微服务架构、DDD、事件驱动架构等
  - [运维与部署](/server/运维与部署/) - 从服务端开发者视角的应用部署与运维
  - [安全技术](/server/安全技术/) - 认证授权、数据加密、安全最佳实践等
- [系统与底层](/systems/) - Rust、C/C++、系统编程、性能优化、WebAssembly等
- [DevOps与云原生](/devops/) - 从平台工程与运维视角的CI/CD、容器化、Kubernetes、监控、云服务等
- [AI应用与大模型](/ai/) - LLM应用开发、提示工程、AI集成、机器学习等

## 关于服务端运维与DevOps的区别

- [服务端 - 运维与部署](/server/运维与部署/)侧重于**开发者视角**，关注如何将服务端应用部署到生产环境
- [DevOps与云原生](/devops/)侧重于**平台工程与运维视角**，关注如何构建和管理整个技术基础设施

## 本站特点

- **内容原创** - 所有内容均为个人学习与实践的真实记录
- **持续更新** - 随着学习和工作的深入，不断补充和完善
- **实用为主** - 注重实用性，避免过于理论化的内容
- **交流开放** - 欢迎讨论和指正，共同进步

开始探索你感兴趣的技术领域吧！

<div class="custom-block">
  <p class="custom-block-title">💡 每日一题</p>
  <p>React中的useEffect和useLayoutEffect有什么区别？</p>
  <details>
    <summary>查看答案</summary>
    <p>useEffect是异步执行的，而useLayoutEffect是同步执行的。useLayoutEffect会在所有DOM变更之后同步调用，但在浏览器绘制之前完成。这使得它适合于需要在DOM更新后立即执行的操作，如测量DOM元素或者调整布局。而useEffect是在浏览器绘制之后异步执行的，更适合大多数副作用操作。</p>
  </details>
</div> 