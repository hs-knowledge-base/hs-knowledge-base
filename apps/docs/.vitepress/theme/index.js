import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import './custom.css'
import DailyQuestion from '../../components/DailyQuestion.vue'
import Contributors from './components/Contributors.vue'
import CodePlaygroundEnhancer from './components/CodePlayground.vue'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    // 注册组件
    app.component('DailyQuestion', DailyQuestion)
    app.component('Contributors', Contributors)
    app.component('CodePlaygroundEnhancer', CodePlaygroundEnhancer)
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // 在布局中添加代码块增强器
      'layout-bottom': () => h(CodePlaygroundEnhancer)
    })
  }
}
