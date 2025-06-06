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
 * @param {*} maxDepth 最大递归深度，-1表示无限制
 * @param {*} currentDepth 当前递归深度
 * @returns 侧边栏结构数组
 */
function scanDirRecursive(dir, rootPath, maxDepth = -1, currentDepth = 0) {
  const fullPath = path.join(rootPath, dir)
  const relativePath = dir // 相对于docs目录的路径

  // 如果目录不存在或者超过最大深度，则返回空数组
  if (!fileExists(fullPath) || (maxDepth !== -1 && currentDepth > maxDepth)) {
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
    const subItems = scanDirRecursive(subDirRelPath, rootPath, maxDepth, currentDepth + 1)
    
    if (subItems.length > 0 || hasIndex) {
      const subGroup = {
        text: formatDirTitle(subDir),
        collapsed: false,
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
 * 创建返回上级的导航项
 * @param {*} currentPath 当前路径
 * @returns 导航项数组
 */
function createNavigationLinks(currentPath) {
  const parts = currentPath.split('/').filter(Boolean);
  const navItems = [];
  
  // 添加返回首页
  navItems.push({
    text: '首页',
    link: '/'
  });
  
  // 添加父级导航链接
  if (parts.length > 0) {
    const topDir = parts[0];
    navItems.push({
      text: formatDirTitle(topDir),
      link: `/${topDir}/`
    });
    
    // 如果有更多层级，添加返回上级
    if (parts.length > 1) {
      // 构建上级目录路径
      const parentPath = parts.slice(0, -1).join('/');
      navItems.push({
        text: `↩️ 返回上级`,
        link: `/${parentPath}/`
      });
    }
  }
  
  return navItems;
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
    // 顶级目录显示所有一级子目录，但不递归更深层次
    const sidebarItems = scanDirRecursive(dir, docsPath, 0);
    if (sidebarItems.length > 0) {
      sidebars[`/${dir}/`] = [
        {
          text: '导航',
          items: [
            { text: '首页', link: '/' }
          ]
        },
        {
          text: formatDirTitle(dir),
          items: sidebarItems
        }
      ];
    }
    
    // 为每个一级子目录生成独立侧边栏
    const dirPath = path.join(docsPath, dir);
    if (fileExists(dirPath)) {
      const subDirs = fs.readdirSync(dirPath).filter(item => {
        const itemPath = path.join(dirPath, item);
        return fs.statSync(itemPath).isDirectory() && 
               !item.startsWith('.') && 
               item !== 'node_modules' && 
               item !== 'public';
      });
      
      for (const subDir of subDirs) {
        const subDirPath = `${dir}/${subDir}`;
        const subItems = scanDirRecursive(subDirPath, docsPath, -1); // 无限深度扫描子目录
        
        if (subItems.length > 0) {
          sidebars[`/${subDirPath}/`] = [
            {
              text: '导航',
              items: createNavigationLinks(subDirPath)
            },
            {
              text: formatDirTitle(subDir),
              items: subItems
            }
          ];
        }
      }
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