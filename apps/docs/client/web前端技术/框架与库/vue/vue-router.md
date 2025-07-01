# Vue Router 3.x 知识点总结

Vue Router 是 Vue.js 官方的路由管理器，它和 Vue.js 的核心深度集成，让构建单页面应用变得易如反掌。

## 基础知识

### 1. 动态路由匹配

动态路由允许我们把某种模式匹配到的所有路由，全都映射到同个组件。

```javascript
// 路由配置
const routes = [
  // 动态路径参数，以冒号开头
  { path: '/user/:id', component: User },
  // 多个参数
  { path: '/user/:username/post/:postId', component: UserPost }
]

// 在组件中获取参数
export default {
  computed: {
    userId() {
      return this.$route.params.id
    }
  },
  // 或者使用侦听器
  watch: {
    '$route'(to, from) {
      // 对路由变化作出响应...
    }
  }
}
```

**响应路由参数的变化**
提醒一下，当使用路由参数时，例如从 /user/foo 导航到 /user/bar，原来的组件实例会被复用。因为两个路由都渲染同个组件，比起销毁再创建，复用则显得更加高效。不过，这也意味着组件的生命周期钩子不会再被调用。

复用组件时，想对路由参数的变化作出响应的话，你可以简单地 watch (监测变化) $route 对象：
```javascript
watch: {
    $route(to, from) {
      // 对路由变化作出响应...
    }
  }
```
或者使用 2.2 中引入的 beforeRouteUpdate 导航守卫：
```javascript
 beforeRouteUpdate(to, from, next) {
    // react to route changes...
    // don't forget to call next()
  }
```

**高级匹配模式：**
- `*` 匹配任意路径,通常用于客户端 404 错误
- `/user-*` 匹配以 `/user-` 开头的任意路径
- `/user/:id(\\d+)` 只匹配数字的 id

当使用一个通配符时，$route.params 内会自动添加一个名为 pathMatch 参数。它包含了 URL 通过通配符被匹配的部分：
```javascript
// 给出一个路由 { path: '/user-*' }
this.$router.push('/user-admin')
this.$route.params.pathMatch // 'admin'
// 给出一个路由 { path: '*' }
this.$router.push('/non-existing')
this.$route.params.pathMatch // '/non-existing'
```

**匹配优先级**
有时候，同一个路径可以匹配多个路由，此时，匹配的优先级就按照路由的定义顺序：路由定义得越早，优先级就越高。

### 2. 嵌套路由

实际生活中的应用界面，通常由多层嵌套的组件组合而成。

```javascript
const routes = [
  {
    path: '/user/:id',
    component: User,
    children: [
      // 空路径代表默认子路由
      { path: '', component: UserHome },
      // /user/:id/profile
      { path: 'profile', component: UserProfile },
      // /user/:id/posts
      { path: 'posts', component: UserPosts }
    ]
  }
]
```

在父组件中需要使用 `<router-view>` 来渲染子路由组件。

### 3. 命名路由

通过一个名称来标识一个路由，在进行路由跳转时更加方便。

```javascript
const routes = [
  {
    path: '/user/:userId',
    name: 'user',
    component: User
  }
]

// 使用命名路由
this.$router.push({ name: 'user', params: { userId: 123 }})

// 在模板中
<router-link :to="{ name: 'user', params: { userId: 123 }}">User</router-link>
```

### 4. 编程式导航

除了使用 `<router-link>` 创建 a 标签来定义导航链接，我们还可以借助 router 的实例方法，通过编写代码来实现。

```javascript
// 字符串
this.$router.push('/home')

// 对象
this.$router.push({ path: '/home' })

// 命名的路由
this.$router.push({ name: 'user', params: { userId: '123' }})

// 带查询参数，变成 /register?plan=private
this.$router.push({ path: '/register', query: { plan: 'private' }})

// 替换当前路由，不会向 history 添加新记录
this.$router.replace({ path: '/home' })

// 横跨历史
this.$router.go(1)  // 前进一步
this.$router.go(-1) // 后退一步
this.$router.back() // 后退
this.$router.forward() // 前进
```

### 5. 命名视图

有时候想同时 (同级) 展示多个视图，而不是嵌套展示。

```javascript
const routes = [
  {
    path: '/',
    components: {
      default: Foo,
      a: Bar,
      b: Baz
    }
  }
]
```

```html
<router-view></router-view>
<router-view name="a"></router-view>
<router-view name="b"></router-view>
```

### 6. 重定向和别名

**重定向：**
```javascript
const routes = [
  { path: '/a', redirect: '/b' },
  { path: '/a', redirect: { name: 'foo' }},
  { path: '/a', redirect: to => {
    // 方法接收目标路由作为参数
    // return 重定向的字符串路径/路径对象
  }}
]
```

**别名：**
“重定向”的意思是，当用户访问 /a时，URL 将会被替换成 /b，然后匹配路由为 /b，那么“别名”又是什么呢？

/a 的别名是 /b，意味着，当用户访问 /b 时，URL 会保持为 /b，但是路由匹配则为 /a，就像用户访问 /a 一样。
```javascript
const routes = [
  { path: '/a', component: A, alias: '/b' }
]
```

### 7. 路由组件传参

在组件中使用 `$route` 会使之与其对应路由形成高度耦合，通过 props 将组件和路由解耦。

```javascript
// 布尔模式
const routes = [
  { path: '/user/:id', component: User, props: true }
]

// 对象模式
const routes = [
  { path: '/promotion/from-newsletter', component: Promotion, props: { newsletterPopup: false } }
]

// 函数模式
const routes = [
  { path: '/search', component: SearchUser, props: (route) => ({ query: route.query.q }) }
]
```

### 8. 匹配当前路由的链接

`<router-link>` 默认会给激活的链接添加 `router-link-active` 类名。

```html
<!-- 精确匹配 -->
<router-link to="/" exact>Home</router-link>

<!-- 包含匹配 -->
<router-link to="/user">User</router-link>
```

自定义激活类名：
```javascript
const router = new VueRouter({
  routes,
  linkActiveClass: 'active',
  linkExactActiveClass: 'exact-active'
})
```

### 9. HTML5 History 模式

vue-router 默认 hash 模式，使用 URL 的 hash 来模拟一个完整的 URL。

```javascript
const router = new VueRouter({
  mode: 'history',
  routes: [...]
})
```

**注意：** History 模式需要服务器配置支持，否则会出现 404 错误。

## 进阶知识

### 1. 导航守卫

导航守卫主要用来通过跳转或取消的方式守卫导航。

**全局前置守卫：**
```javascript
router.beforeEach((to, from, next) => {
  // to: Route: 即将要进入的目标路由对象
  // from: Route: 当前导航正要离开的路由
  // next: Function: 一定要调用该方法来 resolve 这个钩子
  
  if (to.name !== 'Login' && !isAuthenticated) {
    next({ name: 'Login' })
  } else {
    next()
  }
})
```

**全局解析守卫：**
```javascript
router.beforeResolve((to, from, next) => {
  // 在导航被确认之前，同时在所有组件内守卫和异步路由组件被解析之后调用
  next()
})
```

**全局后置钩子：**
```javascript
router.afterEach((to, from) => {
  // 不接受 next 函数，也不会改变导航本身
})
```

**路由独享守卫：**
```javascript
const routes = [
  {
    path: '/foo',
    component: Foo,
    beforeEnter: (to, from, next) => {
      // ...
    }
  }
]
```

**组件内守卫：**
```javascript
export default {
  beforeRouteEnter (to, from, next) {
    // 在渲染该组件的对应路由被 confirm 前调用
    // 不能获取组件实例 `this`
    next(vm => {
      // 通过 `vm` 访问组件实例
    })
  },
  beforeRouteUpdate (to, from, next) {
    // 在当前路由改变，但是该组件被复用时调用
    // 可以访问组件实例 `this`
    next()
  },
  beforeRouteLeave (to, from, next) {
    // 导航离开该组件的对应路由时调用
    // 可以访问组件实例 `this`
    const answer = window.confirm('确定要离开吗？')
    if (answer) {
      next()
    } else {
      next(false)
    }
  }
}
```

### 2. 路由元信息

定义路由的时候可以配置 meta 字段。

```javascript
const routes = [
  {
    path: '/foo',
    component: Foo,
    children: [
      {
        path: 'bar',
        component: Bar,
        meta: { requiresAuth: true, title: '用户中心' }
      }
    ]
  }
]

// 在导航守卫中使用
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 这个路由需要auth，检查是否已登录
    if (!auth.loggedIn()) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})
```

### 3. 数据获取

进入某个路由后，需要从服务器获取数据。有两种方式：

**导航完成后获取：**
```javascript
export default {
  data () {
    return {
      loading: false,
      post: null,
      error: null
    }
  },
  created () {
    this.fetchData()
  },
  watch: {
    '$route' () {
      this.fetchData()
    }
  },
  methods: {
    fetchData () {
      this.error = this.post = null
      this.loading = true
      
      getPost(this.$route.params.id, (err, post) => {
        this.loading = false
        if (err) {
          this.error = err.toString()
        } else {
          this.post = post
        }
      })
    }
  }
}
```

**导航完成前获取：**
```javascript
export default {
  data () {
    return {
      post: null,
      error: null
    }
  },
  beforeRouteEnter (to, from, next) {
    getPost(to.params.id, (err, post) => {
      next(vm => vm.setData(err, post))
    })
  },
  beforeRouteUpdate (to, from, next) {
    this.post = null
    getPost(to.params.id, (err, post) => {
      this.setData(err, post)
      next()
    })
  },
  methods: {
    setData (err, post) {
      if (err) {
        this.error = err.toString()
      } else {
        this.post = post
      }
    }
  }
}
```

### 4. 过渡动效

`<router-view>` 是基本的动态组件，可以用 `<transition>` 组件给它添加一些过渡效果。

```html
<transition name="fade">
  <router-view></router-view>
</transition>
```

单个路由的过渡：
```javascript
const routes = [
  {
    path: '/foo',
    component: Foo,
    meta: { transition: 'slide' }
  }
]
```

```html
<transition :name="$route.meta.transition || 'fade'">
  <router-view></router-view>
</transition>
```

### 5. 滚动行为

使用前端路由，当切换到新路由时，想要页面滚到顶部，或者是保持原先的滚动位置。

```javascript
const router = new VueRouter({
  routes: [...],
  scrollBehavior (to, from, savedPosition) {
    // return 期望滚动到哪个的位置
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})
```

异步滚动：
```javascript
scrollBehavior (to, from, savedPosition) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ x: 0, y: 0 })
    }, 500)
  })
}
```

滚动到锚点：
```javascript
scrollBehavior (to, from, savedPosition) {
  if (to.hash) {
    return {
      selector: to.hash
    }
  }
}
```

### 6. 路由懒加载

把不同路由对应的组件分割成不同的代码块，然后当路由被访问的时候才加载对应组件。

```javascript
// 使用动态 import
const Foo = () => import('./Foo.vue')
const Bar = () => import('./Bar.vue')

const routes = [
  { path: '/foo', component: Foo },
  { path: '/bar', component: Bar }
]
```

把组件按组分块：
```javascript
const Foo = () => import(/* webpackChunkName: "group-foo" */ './Foo.vue')
const Bar = () => import(/* webpackChunkName: "group-foo" */ './Bar.vue')
const Baz = () => import(/* webpackChunkName: "group-boo" */ './Baz.vue')
```

### 7. 导航故障

当使用 `router.push` 或者 `router.replace` 时，你可能想要得知导航何时完成以及是否成功。

```javascript
import { isNavigationFailure, NavigationFailureType } from 'vue-router'

// 判断编辑页面是否有未保存的内容，有几种常见方法：

// 方法一：在编辑组件中使用 beforeRouteLeave 守卫（推荐，简单直接）
export default {
  data() {
    return {
      content: '',
      originalContent: '', // 保存原始内容
      isContentChanged: false
    }
  },
  watch: {
    content(newVal) {
      // 监听内容变化
      this.isContentChanged = newVal !== this.originalContent
    }
  },
  beforeRouteLeave(to, from, next) {
    // 判断是否有未保存的更改
    if (this.isContentChanged) {
      // 可以使用更友好的确认框
      this.$confirm('您有未保存的更改，确定要离开吗？', '提示', {
        confirmButtonText: '离开',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        next() // 确认离开
      }).catch(() => {
        next(false) // 取消导航
      })
    } else {
      next() // 没有更改，直接通过
    }
  },
  methods: {
    async saveContent() {
      try {
        await api.save(this.content)
        this.originalContent = this.content
        this.isContentChanged = false
        this.$message.success('保存成功')
      } catch (error) {
        this.$message.error('保存失败')
      }
    }
  }
}

// 方法二：使用全局状态管理（Vuex）
// store/modules/editor.js
const state = {
  hasUnsavedChanges: false,
  currentEditingPage: null
}

const mutations = {
  SET_UNSAVED_CHANGES(state, hasChanges) {
    state.hasUnsavedChanges = hasChanges
  },
  SET_EDITING_PAGE(state, page) {
    state.currentEditingPage = page
  }
}

// 在路由守卫中使用
router.beforeEach((to, from, next) => {
  const hasUnsavedChanges = store.state.editor.hasUnsavedChanges
  const isLeavingEditPage = from.path.includes('/edit') && !to.path.includes('/edit')
  
  if (hasUnsavedChanges && isLeavingEditPage) {
    const answer = window.confirm('您有未保存的更改，确定要离开吗？')
    if (answer) {
      store.commit('SET_UNSAVED_CHANGES', false)
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
})

// 方法三：使用浏览器的 beforeunload 事件（页面刷新/关闭时）
export default {
  data() {
    return {
      hasUnsavedChanges: false
    }
  },
  mounted() {
    // 监听浏览器关闭/刷新事件
    window.addEventListener('beforeunload', this.handleBeforeUnload)
  },
  beforeDestroy() {
    window.removeEventListener('beforeunload', this.handleBeforeUnload)
  },
  methods: {
    handleBeforeUnload(e) {
      if (this.hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }
  }
}

// isNavigationFailure 主要用于编程式导航的异常处理场景
// 比如：用户通过按钮触发路由跳转，但被组件内守卫拦截的情况
methods: {
  async goToArticles() {
    try {
      await this.$router.push('/articles')
    } catch (failure) {
      if (isNavigationFailure(failure, NavigationFailureType.aborted)) {
        // 导航被用户取消（在 beforeRouteLeave 中 next(false)）
        console.log('用户取消了导航')
      } else if (isNavigationFailure(failure, NavigationFailureType.cancelled)) {
        // 导航被新的导航取消
        console.log('导航被新的导航覆盖')
      } else if (isNavigationFailure(failure, NavigationFailureType.duplicated)) {
        // 重复导航到当前位置
        console.log('已经在目标位置')
      }
    }
  }
}

// 几种方法的对比总结：
// 方法一（组件内守卫）：
//   - 优点：简单直接，无需额外配置，逻辑集中在组件内
//   - 缺点：每个编辑组件都需要单独实现
//   - 适用：单个或少数编辑页面

// 方法二（全局状态）：
//   - 优点：统一管理，适合复杂应用
//   - 缺点：需要额外的状态管理，增加复杂度
//   - 适用：多个编辑页面的大型应用

// 方法三（浏览器事件）：
//   - 优点：能拦截页面刷新/关闭
//   - 缺点：只能处理浏览器级别的离开，不能处理 SPA 内部路由跳转
//   - 适用：作为补充方案，配合其他方法使用
```

导航故障类型：
- `aborted`：在导航守卫中调用了 `next(false)` 中断了本次导航
- `cancelled`：在当前导航完成之前又有了一个新的导航
- `duplicated`：导航被阻止，因为我们已经在目标位置了

## 常用配置示例

```javascript
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('@/views/User.vue'),
    props: true,
    children: [
      {
        path: '',
        component: () => import('@/views/UserHome.vue')
      },
      {
        path: 'profile',
        component: () => import('@/views/UserProfile.vue')
      }
    ]
  },
  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // 权限验证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!localStorage.getItem('token')) {
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
```

## 最佳实践

1. **合理使用路由懒加载**：对于大型应用，应该把组件按功能模块分割成不同的代码块
2. **使用命名路由**：便于维护和重构
3. **合理设置路由元信息**：用于权限控制、页面标题设置等
4. **正确处理导航守卫**：避免死循环，确保调用 next()
5. **使用 props 解耦组件和路由**：提高组件的可复用性
6. **处理 404 情况**：设置通配符路由处理未匹配的路径
7. **考虑 SEO**：如果需要 SEO，使用 History 模式并配置服务器支持

