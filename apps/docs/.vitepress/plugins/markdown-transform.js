import path from 'path'
import { generateContributorKey } from '../../scripts/contributors.js'

/**
 * Markdown 转换插件
 * @returns {import('vite').Plugin} Vite 插件
 */
export function MarkdownTransformPlugin() {
  return {
    name: 'docs-markdown-transform',
    enforce: 'pre',
    async transform(code, id) {
      // 只处理 Markdown 文件
      if (!id.endsWith('.md')) {
        return null
      }

      // 获取文件相对路径
      let relativePath = path.relative(process.cwd(), id)
      
      // 如果当前在 apps/docs 目录，则直接使用相对路径
      // 如果不在，则检查是否以 apps/docs/ 开头
      const isInDocsDir = process.cwd().endsWith('apps/docs') || process.cwd().endsWith('apps\\docs')
      if (!isInDocsDir && !relativePath.startsWith('apps/docs/')) {
        return null
      }
      
      // 如果路径以 apps/docs/ 开头，则移除这部分
      if (relativePath.startsWith('apps/docs/')) {
        relativePath = relativePath.substring('apps/docs/'.length)
      }

      const targetDirs = ['client', 'server', 'ai', 'devops', 'systems']
      const pathSegments = relativePath.split(path.sep) // 使用系统路径分隔符
      
      // 检查是否在目标目录中
      if (pathSegments.length < 1 || !targetDirs.includes(pathSegments[0])) {
        return null
      }

      // 只跳过最顶层的 index.md（即 docs 根目录下的 index.md）
      if (pathSegments.length === 1 && pathSegments[0] === 'index.md') {
        return null
      }

      // 生成贡献者组件的键
      const docsRelativePath = pathSegments.join('/')
      const contributorKey = generateContributorKey(docsRelativePath)

      // 添加贡献者组件到文档末尾
      const contributorsSection = `

<Contributors doc-path="${contributorKey}" show-title />
`

      // 使用 replacer 函数处理内容注入
      const updatedCode = replacer(code, contributorsSection, 'CONTRIBUTORS', 'tail')
      
      return updatedCode
    },
  }
}

/**
 * 内容替换工具函数
 * @param {string} code - 原始代码
 * @param {string} value - 要插入的内容
 * @param {string} key - 标识键
 * @param {'head' | 'tail' | 'none'} insert - 插入位置
 * @returns {string} 处理后的代码
 */
function replacer(code, value, key, insert = 'none') {
  const START = `<!--${key}_STARTS-->`
  const END = `<!--${key}_ENDS-->`
  const regex = new RegExp(`${START}[\\s\\S]*?${END}`, 'im')

  const target = value ? `${START}${value.trim()}\n${END}` : `${START}${END}`

  if (!code.match(regex)) {
    if (insert === 'none') {
      return code
    } else if (insert === 'head') {
      return `${target}\n\n${code}`
    } else {
      // 'tail' - 添加到末尾
      return `${code}\n\n${target}`
    }
  }

  return code.replace(regex, target)
} 