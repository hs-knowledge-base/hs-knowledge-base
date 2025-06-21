import { createHash } from 'crypto'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execAsync = promisify(exec)

// 贡献者信息接口
/**
 * @typedef {Object} ContributorInfo
 * @property {string} name - 贡献者姓名
 * @property {string} email - 贡献者邮箱
 * @property {number} count - 贡献次数
 * @property {string} hash - 邮箱的MD5哈希值
 */

/**
 * 获取指定路径的贡献者信息
 * @param {string} filePath - 文件或目录路径
 * @returns {Promise<ContributorInfo[]>} 贡献者列表
 */
export async function getContributorsAt(filePath) {
  try {
    // 使用 UTF-8 编码处理中文路径
    const gitCommand = `git log --pretty=format:"%an|%ae" --encoding=UTF-8 -- "${filePath}"`
    
    const { stdout } = await execAsync(gitCommand, {
      encoding: 'utf8',
      env: { ...process.env, LC_ALL: 'C.UTF-8' }
    })
    
    if (!stdout.trim()) {
      return []
    }
    
    const commits = stdout
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [name, email] = line.split('|')
        return { name: name?.trim(), email: email?.trim() }
      })
      .filter(commit => commit.name && commit.email)
    
    // 统计每个贡献者的提交次数
    const contributorMap = new Map()
    
    commits.forEach(({ name, email }) => {
      const key = email.toLowerCase()
      if (contributorMap.has(key)) {
        contributorMap.get(key).count++
      } else {
        contributorMap.set(key, {
          name,
          email,
          count: 1,
          hash: createHash('md5').update(email.toLowerCase()).digest('hex')
        })
      }
    })
    
    // 按贡献次数排序
    return Array.from(contributorMap.values())
      .sort((a, b) => b.count - a.count)
  } catch (error) {
    console.warn(`获取贡献者信息失败 (${filePath}):`, error.message)
    return []
  }
}

/**
 * 递归获取目录下所有 Markdown 文件
 * @param {string} dir - 目录路径
 * @returns {string[]} Markdown 文件路径列表
 */
function getAllMarkdownFiles(dir) {
  const files = []
  const items = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const item of items) {
    if (item.name.startsWith('.')) continue
    
    const fullPath = path.join(dir, item.name)
    if (item.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath))
    } else if (item.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }
  
  return files
}

/**
 * 获取所有文档的贡献者信息
 * @returns {Promise<Record<string, ContributorInfo[]>>} 文档路径到贡献者列表的映射
 */
export async function getDocumentContributors() {
  // 获取正确的 docs 目录路径
  const currentDir = process.cwd()
  const docsDir = currentDir.endsWith('apps/docs') || currentDir.endsWith('apps\\docs')
    ? currentDir 
    : path.resolve(currentDir, 'apps/docs')
  
  const targetDirs = ['client', 'server', 'ai', 'devops', 'systems']
  
  const allFiles = []
  for (const dir of targetDirs) {
    const dirPath = path.join(docsDir, dir)
    if (fs.existsSync(dirPath)) {
      allFiles.push(...getAllMarkdownFiles(dirPath))
    }
  }
  
  console.log(`正在分析 ${allFiles.length} 个文档文件的贡献者...`)
  
  const contributorsMap = {}
  
  // 并行处理以提高性能
  const batchSize = 10
  for (let i = 0; i < allFiles.length; i += batchSize) {
    const batch = allFiles.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(async (filePath) => {
        const contributors = await getContributorsAt(filePath)
        // 生成相对于 docs 目录的键名
        const relativePath = path.relative(docsDir, filePath)
        return { key: relativePath, contributors }
      })
    )
    
    batchResults.forEach(({ key, contributors }) => {
      if (contributors.length > 0) {
        // 统一使用正斜杠和生成正确的键格式
        const normalizedKey = generateContributorKey(key.replace(/\\/g, '/'))
        contributorsMap[normalizedKey] = contributors
      }
    })
    
    console.log(`已处理 ${Math.min(i + batchSize, allFiles.length)}/${allFiles.length} 个文件`)
  }
  
  console.log(`成功分析了 ${Object.keys(contributorsMap).length} 个有贡献记录的文档`)
  return contributorsMap
}

/**
 * 根据文档路径生成贡献者组件的唯一键
 * @param {string} filePath - 文档文件路径
 * @returns {string} 组件键名
 */
export function generateContributorKey(filePath) {
  // 移除 .md 扩展名，转换路径分隔符
  return filePath
    .replace(/\.md$/, '')
    .replace(/\\/g, '/')
    .replace(/\/index$/, '') // 移除末尾的 /index
} 