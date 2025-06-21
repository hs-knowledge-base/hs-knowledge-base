import { defineConfig } from 'vite'
import { ContributorsPlugin } from './plugins/contributors.js'
import { MarkdownTransformPlugin } from './plugins/markdown-transform.js'
import { getDocumentContributors } from '../scripts/contributors.js'

export default defineConfig(async () => {
  // 在构建时分析贡献者数据
  console.log('正在分析文档贡献者数据...')
  const contributorsData = await getDocumentContributors()
  console.log(`贡献者数据分析完成，共找到 ${Object.keys(contributorsData).length} 个文档的贡献者`)

  return {
    plugins: [
      MarkdownTransformPlugin(),
      ContributorsPlugin(contributorsData),
    ],
    build: {
      // 调整chunk大小警告阈值
      chunkSizeWarningLimit: 2000,
      // 启用更好的压缩
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks(id) {
            // 分离node_modules中的依赖
            if (id.includes('node_modules')) {
              return 'vendor'
            }
            // 分离虚拟模块
            if (id.includes('virtual:contributors')) {
              return 'contributors'
            }
          }
        }
      }
    },
    define: {
      __VUE_PROD_DEVTOOLS__: false,
    },
  }
}) 