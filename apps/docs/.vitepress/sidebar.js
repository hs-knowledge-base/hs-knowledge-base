import fs from 'fs'
import path from 'path'
import {resolve} from 'path'
import {fileURLToPath} from 'url'

/**
 * 获取当前文件的目录路径
 */
const __dirname = fileURLToPath(new URL('.', import.meta.url))

/**
   * 项目根目录
   */
const rootDir = resolve(__dirname, '../../..')

/**
 * 检查文件是否存在
 * @param {*} filePath 文件路径
 * @returns 文件是否存在
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath)
  } catch (err) {
    return false
  }
}

/**
 * 获取目录名的格式化标题
 * @param {*} dirName 目录名
 * @returns 格式化后的标题
 */
function formatDirTitle(dirName) {
  // 将目录名转换为标题格式（首字母大写，替换连字符为空格）
  return dirName.charAt(0).toUpperCase() +
      dirName.slice(1).replace(/-/g, ' ');
}

/**
 * 递归扫描目录，生成侧边栏结构
 * @param {*} dir 目录路径
 * @param {*} rootPath 根路径
 * @returns 侧边栏结构数组
 */
function scanDirRecursive(dir, rootPath) {
  const fullPath = path.join(rootPath, dir)
  const relativePath = dir // 相对于docs目录的路径

  // 如果目录不存在，则返回空数组
  if (!fileExists(fullPath)) {
    return []
  }

  const result = []

  // 读取目录内容
  const items = fs.readdirSync(fullPath)

  // 先找出所有目录和文件
  const dirs = []
  const files = []

  for (const item of items) {
    const itemPath = path.join(fullPath, item)
    const stats = fs.statSync(itemPath)

    if (stats.isDirectory()) {
      dirs.push(item)
    } else if (stats.isFile() && item.endsWith('.md')) {
      files.push(item)
    }
  }

  // 处理index.md文件（如果存在）
  const indexFile = files.find(file => file === 'index.md')
  if (indexFile) {
    const linkPath = `/${relativePath}/`
    result.push({
      text: '概述',
      link: linkPath
    })

    // 从files中移除index.md，因为已经单独处理了
    files.splice(files.indexOf(indexFile), 1)
  }

  // 处理其他markdown文件
  for (const file of files) {
    const filePath = path.join(fullPath, file)
    const content = fs.readFileSync(filePath, 'utf-8')

    // 尝试从文件内容中提取标题
    const titleMatch = content.match(/^#\s+(.*?)$/m)
    const fileName = file.replace(/\.md$/, '')
    const title = titleMatch ? titleMatch[1] : formatDirTitle(fileName)

    const linkPath = `/${path.join(relativePath, fileName)}`
    result.push({
      text: title,
      link: linkPath
    })
  }

  // 处理子目录（递归）
  for (const subDir of dirs) {
    // 跳过特殊目录
    if (
      subDir.startsWith('.') ||
      subDir === 'node_modules' ||
      subDir === 'public'
    ) {
      continue;
    }

    // 检查子目录是否包含markdown文件
    const subDirPath = path.join(fullPath, subDir)
    const subDirRelPath = path.join(relativePath, subDir)
    const hasIndex = fileExists(path.join(subDirPath, 'index.md'))
    
    // 递归扫描子目录
    const subItems = scanDirRecursive(subDirRelPath, rootPath)
    
    if (subItems.length > 0) {
      const subGroup = {
        text: formatDirTitle(subDir),
        collapsed: true,
        items: subItems
      }
      
      // 如果存在index.md，则添加链接
      if (hasIndex) {
        subGroup.link = `/${subDirRelPath}/`
      }
      
      result.push(subGroup)
    }
  }

  return result
}

/**
 * 生成主要目录的侧边栏
 * @returns 所有侧边栏配置
 */
export function generateSidebars() {
  const docsPath = path.resolve(rootDir, 'apps/docs')
  const sidebars = {};
  
  // 获取顶级目录
  const topDirs = ['client', 'server', 'systems', 'devops'];
  
  // 为每个顶级目录生成侧边栏
  for (const dir of topDirs) {
    const sidebarItems = scanDirRecursive(dir, docsPath);
    if (sidebarItems.length > 0) {
      sidebars[`/${dir}/`] = [
        {
          text: formatDirTitle(dir),
          items: sidebarItems
        }
      ];
    }
  }
  
  // 添加默认侧边栏（用于首页和其他页面）
  sidebars['/'] = [
    {
      text: '导航',
      items: [
        { text: '首页', link: '/' },
        { text: '客户端', link: '/client/' },
        { text: '服务端', link: '/server/' },
        { text: '系统与底层', link: '/systems/' },
        { text: 'DevOps', link: '/devops/' },
        { text: '关于', link: '/about' }
      ]
    }
  ];
  
  return sidebars;
} 