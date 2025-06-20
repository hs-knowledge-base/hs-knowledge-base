import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '../.vitepress/dist')

console.log('🚀 开始优化构建流程...')

async function optimizedBuild() {
  try {
    // 1. 清理旧的构建文件
    console.log('🧹 清理旧的构建文件...')
    if (await fs.pathExists(distDir)) {
      await fs.remove(distDir)
    }

    // 2. 执行构建
    console.log('📦 开始构建...')
    const { stdout, stderr } = await execAsync('pnpm run build', {
      cwd: path.resolve(__dirname, '..')
    })
    
    if (stderr) {
      console.warn('⚠️ 构建警告:', stderr)
    }
    console.log('✅ 构建完成')

    // 3. 分析构建结果
    console.log('📊 分析构建结果...')
    await analyzeBuildResult()

    // 4. 生成构建报告
    console.log('📋 生成构建报告...')
    await generateBuildReport()

    console.log('🎉 优化构建完成!')

  } catch (error) {
    console.error('❌ 构建失败:', error.message)
    process.exit(1)
  }
}

async function analyzeBuildResult() {
  const assetsDir = path.join(distDir, 'assets')
  
  if (!(await fs.pathExists(assetsDir))) {
    console.log('📁 assets 目录不存在')
    return
  }

  const files = await getAllFiles(assetsDir)
  const stats = {
    js: { count: 0, totalSize: 0, files: [] },
    css: { count: 0, totalSize: 0, files: [] },
    images: { count: 0, totalSize: 0, files: [] },
    other: { count: 0, totalSize: 0, files: [] }
  }

  for (const filePath of files) {
    const stat = await fs.stat(filePath)
    const ext = path.extname(filePath).toLowerCase()
    const size = stat.size
    const relativePath = path.relative(assetsDir, filePath)

    if (ext === '.js') {
      stats.js.count++
      stats.js.totalSize += size
      stats.js.files.push({ path: relativePath, size })
    } else if (ext === '.css') {
      stats.css.count++
      stats.css.totalSize += size
      stats.css.files.push({ path: relativePath, size })
    } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) {
      stats.images.count++
      stats.images.totalSize += size
      stats.images.files.push({ path: relativePath, size })
    } else {
      stats.other.count++
      stats.other.totalSize += size
      stats.other.files.push({ path: relativePath, size })
    }
  }

  console.log('\n📊 构建结果分析:')
  console.log(`JavaScript: ${stats.js.count} 文件, ${formatSize(stats.js.totalSize)}`)
  console.log(`CSS: ${stats.css.count} 文件, ${formatSize(stats.css.totalSize)}`)
  console.log(`图片: ${stats.images.count} 文件, ${formatSize(stats.images.totalSize)}`)
  console.log(`其他: ${stats.other.count} 文件, ${formatSize(stats.other.totalSize)}`)
  console.log(`总计: ${formatSize(stats.js.totalSize + stats.css.totalSize + stats.images.totalSize + stats.other.totalSize)}`)

  // 显示最大的几个文件
  console.log('\n📦 最大的 JavaScript 文件:')
  stats.js.files
    .sort((a, b) => b.size - a.size)
    .slice(0, 5)
    .forEach(file => {
      console.log(`  ${file.path}: ${formatSize(file.size)}`)
    })
}

async function getAllFiles(dir) {
  const files = []
  
  async function scan(currentDir) {
    const items = await fs.readdir(currentDir)
    
    for (const item of items) {
      const itemPath = path.join(currentDir, item)
      const stat = await fs.stat(itemPath)
      
      if (stat.isDirectory()) {
        await scan(itemPath)
      } else {
        files.push(itemPath)
      }
    }
  }
  
  await scan(dir)
  return files
}

async function generateBuildReport() {
  const buildTime = new Date().toISOString()
  const report = {
    buildTime,
    version: '1.0.0',
    vitepress: '1.6.3',
    optimization: {
      codesplitting: true,
      minification: 'esbuild',
      cssCodeSplit: true,
      chunkOptimization: true,
      chunkSizeWarningLimit: 2000
    }
  }

  await fs.writeJSON(path.join(distDir, 'build-report.json'), report, { spaces: 2 })
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

// 执行构建
optimizedBuild() 