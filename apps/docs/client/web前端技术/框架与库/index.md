# 框架与库

## 简介

前端框架与库是现代Web开发的基石，它们提供了结构化的开发范式、可复用的组件和优化的性能，使开发者能够更高效地构建复杂的Web应用。从简单的工具库到全功能框架，不同的解决方案适合不同的项目需求。

本节内容涵盖主流前端框架、状态管理库、UI组件库及其生态系统，帮助开发者选择和掌握适合的技术栈。

## 技术领域

### 前端框架
- React生态系统
  - React核心概念
  - React Server Components
  - React并发模式
  - React性能优化
- Vue生态系统
  - Vue 3组合式API
  - 响应式系统
  - 单文件组件
  - Vue性能优化
- Angular生态系统
  - 依赖注入
  - RxJS与Observable
  - Angular表单
  - Angular Universal
- 轻量级框架
  - Svelte编译时优化
  - Solid细粒度响应性
  - Lit元素与Web组件
  - Qwik即时水合技术

### 全栈框架
- Next.js
  - App Router与Pages Router
  - 服务器组件与客户端组件
  - 数据获取策略
  - 静态生成与服务端渲染
  - 中间件与Edge功能
- Nuxt.js
  - Nuxt 3架构
  - 自动路由与布局系统
  - 服务器API与中间件
  - 组合式API与模块化
  - SEO与性能优化
- Remix
  - 嵌套路由
  - 加载器与动作
  - 错误边界
  - 缓存控制
- Astro
  - 岛屿架构
  - 内容集合
  - 零JS默认
  - 混合渲染策略

### 状态管理
- 集中式状态管理
  - Redux与Redux Toolkit
  - Vuex与Pinia
  - MobX与MobX-State-Tree
  - Zustand与Jotai
- 服务器状态管理
  - React Query/TanStack Query
  - SWR数据获取
  - Apollo Client
  - RTK Query

### 组件库与设计系统
- 通用组件库
  - MUI (Material-UI)
  - Ant Design
  - Chakra UI
  - Tailwind组件
- 专业领域组件
  - 数据可视化库
  - 表格与网格组件
  - 表单解决方案
  - 动画与过渡

### 路由与导航
- React Router
- [Vue Router@3](./vue/vue-router.md) Vue Router - Vue官方路由管理器，支持嵌套路由、路由守卫、懒加载等特性
- Angular Router
- 单页应用架构
- 多页应用架构

## 代码示例

```jsx
// Next.js App Router示例
// app/products/[category]/page.tsx

import { Suspense } from 'react';
import { ProductList } from '@/components/product-list';
import { CategoryHeader } from '@/components/category-header';
import { getProducts, getCategory } from '@/lib/api';

// 生成静态路由参数
export async function generateStaticParams() {
  const categories = await fetch('https://api.example.com/categories').then(res => res.json());
  
  return categories.map((category) => ({
    category: category.slug,
  }));
}

// 生成元数据
export async function generateMetadata({ params }) {
  const category = await getCategory(params.category);
  
  return {
    title: `${category.name} - 我的电商`,
    description: category.description,
    openGraph: {
      images: [{ url: category.image }],
    },
  };
}

// 页面组件
export default async function CategoryPage({ params }) {
  // 直接在服务器获取分类信息
  const category = await getCategory(params.category);
  
  return (
    <main>
      <CategoryHeader 
        title={category.name}
        description={category.description}
        imageUrl={category.image}
      />
      
      <section className="products">
        <h2>产品列表</h2>
        
        <Suspense fallback={<p>加载产品中...</p>}>
          {/* 将加载产品的逻辑封装在组件中，支持流式渲染 */}
          <ProductList categoryId={category.id} />
        </Suspense>
      </section>
    </main>
  );
}

// components/product-list.tsx
export async function ProductList({ categoryId }) {
  // 这部分会在服务器上异步加载，不会阻塞页面其他部分的渲染
  const products = await getProducts(categoryId);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map(product => (
        <div key={product.id} className="product-card">
          <img src={product.image} alt={product.name} />
          <h3>{product.name}</h3>
          <p>{product.price}</p>
          <AddToCartButton product={product} />
        </div>
      ))}
    </div>
  );
}

// 客户端组件
'use client';

import { useState } from 'react';

export function AddToCartButton({ product }) {
  const [isAdding, setIsAdding] = useState(false);
  
  async function handleAddToCart() {
    setIsAdding(true);
    
    try {
      await fetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id }),
      });
      // 显示成功提示
    } catch (error) {
      // 显示错误提示
    } finally {
      setIsAdding(false);
    }
  }
  
  return (
    <button 
      onClick={handleAddToCart}
      disabled={isAdding}
      className="btn btn-primary"
    >
      {isAdding ? '添加中...' : '加入购物车'}
    </button>
  );
}
```

```vue
<!-- Nuxt 3组件示例 -->
<!-- pages/products/[id].vue -->
<script setup>
// 从URL参数获取产品ID
const route = useRoute();
const { id } = route.params;

// 使用Nuxt的数据获取composable
const { data: product, pending, error } = await useFetch(`/api/products/${id}`);

// 头部元数据
useHead({
  title: product.value ? `${product.value.name} - 我的商店` : '加载中...',
  meta: [
    { name: 'description', content: product.value?.description || '' }
  ]
});

// 客户端状态
const quantity = ref(1);
const isAddingToCart = ref(false);

// 添加到购物车方法
async function addToCart() {
  if (!product.value) return;
  
  isAddingToCart.value = true;
  
  try {
    await $fetch('/api/cart', {
      method: 'POST',
      body: {
        productId: product.value.id,
        quantity: quantity.value
      }
    });
    
    // 使用Nuxt的toast模块显示成功消息
    useToast().success('已添加到购物车');
  } catch (err) {
    useToast().error('添加失败，请重试');
  } finally {
    isAddingToCart.value = false;
  }
}
</script>

<template>
  <div>
    <!-- 加载状态 -->
    <div v-if="pending" class="loading-skeleton">
      <div class="skeleton-image"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-text"></div>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <p>抱歉，无法加载产品信息</p>
      <NuxtLink to="/products">返回产品列表</NuxtLink>
    </div>
    
    <!-- 产品详情 -->
    <div v-else-if="product" class="product-detail">
      <div class="product-gallery">
        <img :src="product.imageUrl" :alt="product.name" class="main-image" />
        <div class="thumbnail-list">
          <img 
            v-for="(img, index) in product.gallery" 
            :key="index" 
            :src="img" 
            :alt="`${product.name} - 图片 ${index + 1}`"
            class="thumbnail"
          />
        </div>
      </div>
      
      <div class="product-info">
        <h1>{{ product.name }}</h1>
        <p class="product-price">{{ formatPrice(product.price) }}</p>
        <div class="product-description" v-html="product.description"></div>
        
        <div class="product-actions">
          <div class="quantity-selector">
            <button @click="quantity = Math.max(1, quantity - 1)">-</button>
            <input type="number" v-model="quantity" min="1" />
            <button @click="quantity++">+</button>
          </div>
          
          <button 
            class="add-to-cart-button"
            :disabled="isAddingToCart"
            @click="addToCart"
          >
            {{ isAddingToCart ? '添加中...' : '加入购物车' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .product-detail {
    grid-template-columns: 1fr;
  }
}

/* 其他样式省略 */
</style>
```

## 最佳实践

- 基于项目需求选择适合的框架
- 考虑团队熟悉度与学习曲线
- 状态管理遵循单向数据流
- 提高组件可复用性
- 优化渲染性能
- 逻辑与UI分离 