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
 * @param {*} dir 目录名
 * @param {*} rootPath 根路径
 * @returns 侧边栏结构
 */
function scanDir(dir, rootPath) {
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

  // 处理目录（递归）
  for (const subDir of dirs) {
    // 检查子目录是否包含index.md
    const subDirPath = path.join(fullPath, subDir)
    const hasIndex = fileExists(path.join(subDirPath, 'index.md'))

    if (hasIndex) {
      // 如果是生成子目录侧边栏，则不需要递归扫描
      const linkPath = `/${path.join(relativePath, subDir)}/`
      result.push({
        text: formatDirTitle(subDir),
        link: linkPath
      })
    }
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

  return result
}

/**
 * 动态生成子目录侧边栏
 * @param {*} parentDir 父目录
 * @returns 子目录侧边栏
 */
function generateSubDirSidebar(parentDir) {
  const fullParentPath = path.resolve(rootDir, 'apps/docs')
  const items = scanDir(parentDir, fullParentPath)

  if (items.length > 0) {
    // 获取目录的最后一部分作为标题
    const dirParts = parentDir.split('/');
    const dirTitle = formatDirTitle(dirParts[dirParts.length - 1]);

    // 创建一个返回上级目录的链接
    const backItems = [];
    
    // 如果不是顶级目录，添加返回上级链接
    if (dirParts.length > 1) {
      // 构建父目录路径
      const parentPath = dirParts.slice(0, -1).join('/');
      // 获取父目录名称并格式化
      const parentDirName = formatDirTitle(dirParts[dirParts.length - 2]);
      backItems.push({
        text: `↩️ 返回 ${parentDirName}`,
        link: `/${parentPath}/`
      });
    } else {
      // 如果是顶级目录，返回首页
      backItems.push({
        text: '↩️ 返回首页',
        link: '/'
      });
    }

    // 创建一个顶层分组，包含返回链接和原有内容
    return [
      {
        text: '导航',
        collapsed: false,
        items: backItems
      },
      {
        text: dirTitle,
        collapsed: false,
        items: items
      }
    ]
  }

  return []
}

  /**
 * 生成所有可能的路径侧边栏配置
 * @returns 侧边栏配置
 */
export function generateSidebars() {
  const docsPath = path.resolve(rootDir, 'apps/docs')
  const sidebars = {};

  // 扫描所有可能的路径并生成侧边栏配置
  function addSidebarsForPath(currentPath = '', physicalPath = docsPath) {
    // 跳过特殊目录
    if (
        currentPath.startsWith('.') ||
        currentPath === 'node_modules' ||
        currentPath === 'public'
    ) {
      return;
    }

    // 只为有index.md的目录生成侧边栏
    const hasIndex = fileExists(path.join(physicalPath, 'index.md'));
    if (hasIndex && currentPath) {
      sidebars[`/${currentPath}/`] = generateSubDirSidebar(currentPath);
    }

    // 递归处理子目录
    try {
      const items = fs.readdirSync(physicalPath);
      for (const item of items) {
        const itemPath = path.join(physicalPath, item);
        if (fs.statSync(itemPath).isDirectory()) {
          const newPath = currentPath ? `${currentPath}/${item}` : item;
          addSidebarsForPath(newPath, itemPath);
        }
      }
    } catch (err) {
      console.error(`Error reading directory: ${physicalPath}`, err);
    }
  }

  // 开始递归扫描
  addSidebarsForPath();

  return sidebars;
} 