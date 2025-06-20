import {defineConfig} from 'vitepress'
import {resolve} from 'path'
import {fileURLToPath} from 'url'
import {generateSidebars} from './sidebar.js'

// 获取当前文件的目录路径
const __dirname = fileURLToPath(new URL('.', import.meta.url))

// 项目根目录
const rootDir = resolve(__dirname, '../../..')

export default defineConfig({
  base: '/',
  title: '火山知识库',
  description: '客户端、服务端、系统底层及DevOps的技术知识整理与分享',
  head: [
    ['link', { rel: 'icon', href: '/img/logo.png' }]
  ],
  lang: 'zh-CN',

  // 内容配置
  srcDir: './',

  // 忽略死链接检查
  ignoreDeadLinks: true,

  // 配置额外的内容目录
  srcExclude: ['**/node_modules/**'],

  // 添加Markdown配置
  markdown: {
    // 代码块中启用行号
    lineNumbers: true,

    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  },

  vite: {
    server: {
      fs: {
        // 允许访问上层目录
        allow: [rootDir]
      }
    },
    build: {
      // 调整chunk大小警告阈值
      chunkSizeWarningLimit: 2000,
      // 禁用CSS代码分割，避免Vue组件样式加载顺序问题
      cssCodeSplit: false,
      // 启用更好的压缩
      minify: 'esbuild',
      // 基础的rollup配置用于代码分割
      rollupOptions: {
        output: {
          // 使用函数形式的manualChunks来避免外部模块冲突
          manualChunks(id) {
            // 分离node_modules中的依赖
            if (id.includes('node_modules')) {
              // 将shiki代码高亮库单独分离（通常比较大）
              if (id.includes('shiki')) {
                return 'shiki'
              }
              // 将markdown-it相关库分离
              if (id.includes('markdown-it')) {
                return 'markdown'
              }
              // 将搜索相关的库分离
              if (id.includes('minisearch')) {
                return 'search'
              }
              // 其他第三方依赖
              return 'vendor'
            }
          }
        }
      }
    }
  },

  themeConfig: {
    logo: "/img/logo.png",
    nav: [
      {text: '首页', link: '/'},
      {text: '客户端', link: '/client/'},
      {text: '服务端', link: '/server/'},
      {text: '系统与底层', link: '/systems/'},
      {text: 'DevOps', link: '/devops/'},
      {text: 'AI应用与大模型', link: '/ai/'},
      {text: '贡献者', link: '/contributors'},
      {text: '关于', link: '/about'}
    ],

    sidebar: generateSidebars(),

    socialLinks: [
      {icon: 'github', link: 'https://github.com/huoshan25'},
      {icon: 'discord', link: 'https://discord.gg/m86wyGfs'}
    ],

    footer: {
      message: '用知识点燃技术的火山',
      copyright: 'Copyright ©2025 火山知识库'
    },

    search: {
      provider: 'local'
    }
  }
})