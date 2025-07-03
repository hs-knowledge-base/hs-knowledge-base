import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import './custom.css'
import DailyQuestion from '../../components/DailyQuestion.vue'
import Contributors from './components/Contributors.vue'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    // 注册组件
    app.component('DailyQuestion', DailyQuestion)
    app.component('Contributors', Contributors)
  },
}
