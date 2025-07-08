/**
 * CDN 依赖加载器
 * 用于动态加载外部库，避免将所有依赖打包到项目中
 */

interface CDNResource {
  url: string
  type: 'script' | 'style'
}

interface CDNLibrary {
  name: string
  resources: CDNResource[] | string
  globalName: string
  version?: string
}

/**
 * CDN 配置
 */
const CDN_LIBRARIES: Record<string, CDNLibrary> = {
  lodash: {
    name: 'lodash',
    resources: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js',
    globalName: '_',
    version: '4.17.21'
  },
  moment: {
    name: 'moment',
    resources: 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/moment.min.js',
    globalName: 'moment',
    version: '2.29.4'
  },
  axios: {
    name: 'axios',
    resources: 'https://cdnjs.cloudflare.com/ajax/libs/axios/1.6.0/axios.min.js',
    globalName: 'axios',
    version: '1.6.0'
  },
  bootstrap: {
    name: 'bootstrap',
    resources: [
      {
        url: 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css',
        type: 'style'
      },
      {
        url: 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js',
        type: 'script'
      }
    ],
    globalName: 'bootstrap',
    version: '5.3.0'
  },
  antd: {
    name: 'antd',
    resources: [
      {
        url: 'https://cdn.jsdelivr.net/npm/antd@5.12.0/dist/reset.css',
        type: 'style'
      },
      {
        url: 'https://cdn.jsdelivr.net/npm/antd@5.12.0/dist/antd.min.js',
        type: 'script'
      }
    ],
    globalName: 'antd',
    version: '5.12.0'
  },
}

/**
 * 加载单个资源（脚本或样式）
 */
function loadResource(resource: CDNResource): Promise<void> {
  return new Promise((resolve, reject) => {
    if (resource.type === 'script') {
      const script = document.createElement('script')
      script.src = resource.url
      script.async = true

      script.onload = () => resolve()
      script.onerror = () => reject(new Error(`加载脚本失败: ${resource.url}`))

      document.head.appendChild(script)
    } else if (resource.type === 'style') {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = resource.url

      link.onload = () => resolve()
      link.onerror = () => reject(new Error(`加载样式表失败: ${resource.url}`))

      document.head.appendChild(link)
    } else {
      reject(new Error(`未知的资源类型: ${resource.type}`))
    }
  })
}

/**
 * 动态加载 CDN 库（支持多资源）
 */
export async function loadCDNLibrary(libraryName: string): Promise<any> {
  if (typeof window === 'undefined') {
    // 服务端渲染时返回 undefined
    return undefined
  }

  const library = CDN_LIBRARIES[libraryName]
  if (!library) {
    console.warn(`未知的库: ${libraryName}`)
    return undefined
  }

  // 检查是否已经加载
  const globalVar = (window as any)[library.globalName]
  if (globalVar) {
    console.log(`✅ ${library.name} 已加载`)
    return globalVar
  }

  try {
    // 处理单个 URL 或多个资源
    if (typeof library.resources === 'string') {
      // 单个脚本文件
      await loadResource({ url: library.resources, type: 'script' })
    } else {
      // 多个资源文件，按顺序加载
      for (const resource of library.resources) {
        await loadResource(resource)
      }
    }

    // 检查全局变量是否可用
    const loadedLibrary = (window as any)[library.globalName]
    if (loadedLibrary) {
      console.log(`✅ 已从 CDN 加载 ${library.name}`)
      return loadedLibrary
    } else {
      throw new Error(`加载后未找到全局变量 ${library.globalName}`)
    }
  } catch (error) {
    console.error(`加载 ${library.name} 失败:`, error)
    throw error
  }
}

/**
 * 批量加载多个 CDN 库
 */
export async function loadMultipleCDNLibraries(libraryNames: string[]): Promise<Record<string, any>> {
  const results: Record<string, any> = {}
  
  for (const name of libraryNames) {
    try {
      results[name] = await loadCDNLibrary(name)
    } catch (error) {
      console.error(`加载 ${name} 失败:`, error)
      results[name] = undefined
    }
  }
  
  return results
}

/**
 * 创建带 CDN 依赖的 scope
 */
export async function createScopeWithCDN(dependencies: string[]): Promise<Record<string, any>> {
  const cdnLibraries = await loadMultipleCDNLibraries(dependencies)
  
  return {
    ...cdnLibraries
  }
}

/**
 * 获取可用的 CDN 库列表
 */
export function getAvailableCDNLibraries(): string[] {
  return Object.keys(CDN_LIBRARIES)
}
