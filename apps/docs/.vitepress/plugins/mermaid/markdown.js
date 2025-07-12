import MarkdownItContainer from 'markdown-it-container'

/**
 * Mermaid Markdown 插件
 * 负责在构建时解析 :::mermaid 语法，渲染为 Vue 组件
 * @param {import('markdown-it')} md - markdown-it 实例
 */
export function MermaidMarkdownPlugin(md) {
  md.use(MarkdownItContainer, 'mermaid', {
    validate: function(params) {
      return params.trim().match(/^mermaid\s*(.*)$/)
    },

    render: function(tokens, idx) {
      const token = tokens[idx]

      if (token.nesting === 1) {
        // 开始标签
        const info = token.info.trim().slice(7).trim() // 移除 'mermaid' 前缀
        const title = info || ''

        // 收集内容
        let content = ''
        let nextIdx = idx + 1

        // 查找内容直到结束标签
        while (nextIdx < tokens.length && tokens[nextIdx].nesting !== -1) {
          if (tokens[nextIdx].type === 'container_mermaid_close') {
            break
          }
          if (tokens[nextIdx].content) {
            content += tokens[nextIdx].content + '\n'
          }
          nextIdx++
        }

        // 转义内容用于 props
        const escapedContent = md.utils.escapeHtml(content.trim())
        const escapedTitle = md.utils.escapeHtml(title)

        // 渲染 Vue 组件
        return `<MermaidChart title="${escapedTitle}" code="${escapedContent}">`
      } else {
        // 结束标签
        return `</MermaidChart>`
      }
    }
  })
}
