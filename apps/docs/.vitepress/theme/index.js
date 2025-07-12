import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './custom.css'
import DailyQuestion from '../../components/DailyQuestion.vue'
import Contributors from './components/Contributors.vue'
import MermaidChart from './components/MermaidChart.vue'

export default {
  ...DefaultTheme,
  enhanceApp({ app, router }) {
    // 注册Element Plus
    app.use(ElementPlus)

    // 注册组件
    app.component('DailyQuestion', DailyQuestion)
    app.component('Contributors', Contributors)
    app.component('MermaidChart', MermaidChart)
  },
}
