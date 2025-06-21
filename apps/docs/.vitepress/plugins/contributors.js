const VIRTUAL_MODULE_ID = 'virtual:contributors'
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID

/**
 * 贡献者虚拟模块插件
 * @param {Record<string, any>} contributorsData - 贡献者数据
 * @returns {import('vite').Plugin} Vite 插件
 */
export function ContributorsPlugin(contributorsData) {
  return {
    name: 'vueuse-contributors',
    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID
      }
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        console.log(`📦 [Contributors Plugin] 加载虚拟模块，数据条目数: ${Object.keys(contributorsData).length}`)
        console.log(`📋 [Contributors Plugin] 前5个数据键:`, Object.keys(contributorsData).slice(0, 5))
        
        // 返回贡献者数据作为 ES 模块
        const moduleContent = `export default ${JSON.stringify(contributorsData, null, 2)}`
        return moduleContent
      }
    },
    // 在开发模式下启用热更新
    handleHotUpdate({ file, server }) {
      if (file.includes('contributors.js') || file.includes('scripts/contributors')) {
        console.log('贡献者数据已更新，正在重新加载...')
        server.ws.send({
          type: 'full-reload'
        })
      }
    }
  }
} 