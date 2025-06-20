import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, '../public')

console.log('🖼️ 开始优化图片资源...')

async function optimizeImages() {
  try {
    if (!(await fs.pathExists(publicDir))) {
      console.log('📁 public 目录不存在，跳过图片优化')
      return
    }

    const imageStats = await analyzeImages(publicDir)
    console.log('\n📊 图片分析结果:')
    console.log(`总计: ${imageStats.count} 个图片文件`)
    console.log(`总大小: ${formatSize(imageStats.totalSize)}`)
    
    // 输出建议
    console.log('\n💡 优化建议:')
    console.log('1. 考虑将大图片转换为 WebP 格式')
    console.log('2. 使用 next-gen 图片格式 (WebP, AVIF)')
    console.log('3. 实施图片懒加载')
    console.log('4. 为不同屏幕尺寸提供响应式图片')

  } catch (error) {
    console.error('❌ 图片优化失败:', error.message)
  }
}

async function analyzeImages(dir) {
  const stats = { count: 0, totalSize: 0 }
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp']

  async function scanDirectory(currentDir) {
    const items = await fs.readdir(currentDir)

    for (const item of items) {
      const itemPath = path.join(currentDir, item)
      const stat = await fs.stat(itemPath)

      if (stat.isDirectory()) {
        await scanDirectory(itemPath)
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase()
        if (imageExtensions.includes(ext)) {
          stats.count++
          stats.totalSize += stat.size

          // 检查大文件
          if (stat.size > 500 * 1024) { // 大于 500KB
            console.log(`⚠️ 大文件发现: ${path.relative(publicDir, itemPath)} (${formatSize(stat.size)})`)
          }
        }
      }
    }
  }

  await scanDirectory(dir)
  return stats
}

function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}

// 执行图片优化分析
optimizeImages() 