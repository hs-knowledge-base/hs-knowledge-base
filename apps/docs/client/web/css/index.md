# CSS样式与布局

## 简介

CSS（层叠样式表）是一种用于描述HTML或XML文档表现形式的样式表语言。CSS控制网页的视觉呈现，包括布局、颜色、字体和动画等，是现代Web开发的三大核心技术之一（HTML、CSS和JavaScript）。

## 基础语法与选择器

### 基础语法
- 声明与规则集
- 属性与值
- 注释与格式化
- 引入方式（内联、内部、外部）

### 选择器
- 元素、类与ID选择器
- 属性选择器
- 伪类与伪元素
- 组合选择器与优先级
- 关系选择器（子、后代、兄弟）

### 层叠与继承
- 特异性计算
- 层叠规则与`!important`
- 继承属性与非继承属性
- CSS变量（自定义属性）

## 盒模型与布局

### 盒模型
- 内容、内边距、边框与外边距
- `box-sizing`属性
- 外边距折叠
- 视觉格式化模型

### 文档流与定位
- 正常流
- 浮动与清除
- 定位方式（相对、绝对、固定、粘性）
- z-index与层叠上下文

### 弹性盒布局(Flexbox)
- 容器属性（`display`, `flex-direction`, `justify-content`等）
- 项目属性（`flex`, `align-self`等）
- 一维布局与对齐
- 响应式Flex布局

### 网格布局(Grid)
- 容器属性（`grid-template-columns`, `grid-gap`等）
- 项目属性（`grid-column`, `grid-area`等）
- 二维布局与区域
- 显式网格与隐式网格
- 响应式Grid布局

## 响应式设计

### 媒体查询
- 语法与逻辑运算符
- 常用断点设置
- 特性查询（@supports）
- 打印样式

### 视口与单位
- 相对单位（em, rem, vh, vw）
- 视口设置（meta viewport）
- 图片响应式处理
- 移动优先策略

### CSS变量与主题
- 变量声明与使用
- 全局变量与局部变量
- 动态主题切换
- 暗黑模式实现

## 视觉效果

### 颜色与背景
- 颜色表示法（关键字、RGB、HSL）
- 不透明度与RGBA
- 渐变（线性、径向、锥形）
- 背景属性与多重背景

### 文本与排版
- 字体属性（`font-family`, `font-size`等）
- 文本属性（`text-align`, `line-height`等）
- 文本装饰与阴影
- Web字体与字体优化

### 变换与过渡
- 2D/3D变换（`transform`）
- 过渡效果（`transition`）
- 性能优化与硬件加速
- 视差效果实现

### 动画
- 关键帧动画（`@keyframes`）
- 动画属性（`animation`）
- 复杂动画组合
- 性能考量与优化

## 现代CSS特性

### CSS预处理器
- Sass/SCSS
- Less
- Stylus
- PostCSS与插件系统

### CSS架构方法论
- BEM命名规范
- OOCSS对象化CSS
- SMACSS可扩展模块化
- Utility-First（如Tailwind CSS）

### CSS新特性
- 容器查询
- 逻辑属性
- 子网格（Subgrid）
- 颜色函数（如oklch）
- 滚动捕捉

## 实践与优化

### 性能优化
- 关键CSS提取
- 选择器优化
- 渲染性能
- 动画性能

### 可访问性
- 颜色对比度
- 键盘导航与焦点样式
- 缩放与响应式考量
- 减少动画（prefers-reduced-motion）

### 浏览器兼容性
- 特性检测
- 浏览器前缀
- polyfill与fallback
- 渐进增强策略

## 代码示例

```css
/* 现代CSS布局示例 */

/* 使用CSS变量定义主题色 */
:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --text-color: #333;
  --background-color: #f9f9f9;
  --spacing-unit: 1rem;
}

/* 基础样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--background-color);
}

/* 响应式容器 */
.container {
  width: min(90%, 1200px);
  margin: 0 auto;
  padding: var(--spacing-unit);
}

/* 使用Grid实现卡片布局 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: calc(var(--spacing-unit) * 2);
}

.card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.card__image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card__content {
  padding: var(--spacing-unit);
}

.card__title {
  font-size: 1.25rem;
  color: var(--primary-color);
  margin-bottom: calc(var(--spacing-unit) * 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
  
  :root {
    --spacing-unit: 0.75rem;
  }
}

/* 暗黑模式支持 */
@media (prefers-color-scheme: dark) {
  :root {
    --text-color: #f9f9f9;
    --background-color: #121212;
  }
  
  .card {
    background: #1e1e1e;
  }
}