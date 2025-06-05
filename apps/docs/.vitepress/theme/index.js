import DefaultTheme from 'vitepress/theme'
import CodePlayground from './components/CodePlayground.vue'
import RunCode from './components/RunCode.vue'
import './styles/playground.css'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    // 注册自定义组件
    app.component('CodePlayground', CodePlayground)
    app.component('RunCode', RunCode)
  }
} 