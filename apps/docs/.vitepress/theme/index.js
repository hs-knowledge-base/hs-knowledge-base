import DefaultTheme from 'vitepress/theme'
import './custom.css'
import DailyQuestion from '../../components/DailyQuestion.vue'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    // 注册组件
    app.component('DailyQuestion', DailyQuestion)
  }
}
