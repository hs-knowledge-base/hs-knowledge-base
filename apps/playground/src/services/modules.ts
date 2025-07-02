/** CDN 类型定义 */
export type CDN = 'jsdelivr' | 'unpkg' | 'esm.sh' | 'skypack' | 'cdnjs';

/** NPM CDN 列表 */
export const npmCDNs: CDN[] = ['jsdelivr', 'unpkg', 'esm.sh'];

/** 模块 CDN 列表 */
export const moduleCDNs: CDN[] = ['esm.sh', 'skypack', 'jsdelivr'];

/** GitHub CDN 列表 */
export const ghCDNs: CDN[] = ['jsdelivr', 'unpkg'];

/** 获取应用默认 CDN */
export const getAppCDN = (): CDN => 'jsdelivr';

/** 根据 CDN 类型获取 URL */
export const getCdnUrl = (
  moduleName: string,
  isModule: boolean = true,
  cdn: CDN = 'jsdelivr'
): string | null => {
  // 移除版本号中的特殊标记
  const cleanModuleName = moduleName.replace(/#nobundle/g, '');
  
  switch (cdn) {
    case 'jsdelivr':
      return isModule 
        ? `https://cdn.jsdelivr.net/npm/${cleanModuleName}/+esm`
        : `https://cdn.jsdelivr.net/npm/${cleanModuleName}`;
        
    case 'unpkg':
      return `https://unpkg.com/${cleanModuleName}`;
      
    case 'esm.sh':
      return isModule 
        ? `https://esm.sh/${cleanModuleName}`
        : `https://cdn.jsdelivr.net/npm/${cleanModuleName}`;
        
    case 'skypack':
      return isModule 
        ? `https://cdn.skypack.dev/${cleanModuleName}`
        : `https://cdn.jsdelivr.net/npm/${cleanModuleName}`;
        
    case 'cdnjs':
      // CDNJS 需要特殊处理，这里简化为 jsdelivr
      return `https://cdn.jsdelivr.net/npm/${cleanModuleName}`;
      
    default:
      return null;
  }
};

/** 模块服务 */
export const modulesService = {
  /** 获取模块 URL */
  getModuleUrl: (
    moduleName: string,
    {
      isModule = true,
      defaultCDN = 'esm.sh',
      external,
    }: { isModule?: boolean; defaultCDN?: CDN; external?: string } = {},
  ) => {
    moduleName = moduleName.replace(/#nobundle/g, '');

    const addExternalParam = (url: string) =>
      !external || !url.includes('https://esm.sh')
        ? url
        : url.includes('?')
          ? `${url}&external=${external}`
          : `${url}?external=${external}`;

    const moduleUrl = getCdnUrl(moduleName, isModule, defaultCDN);
    if (moduleUrl) {
      return addExternalParam(moduleUrl);
    }

    return isModule
      ? addExternalParam('https://esm.sh/' + moduleName)
      : 'https://cdn.jsdelivr.net/npm/' + moduleName;
  },

  /** 获取资源 URL */
  getUrl: (path: string, cdn?: CDN) =>
    path.startsWith('http') || path.startsWith('data:')
      ? path
      : getCdnUrl(path, false, cdn || getAppCDN()) || path,

  /** CDN 列表 */
  cdnLists: { npm: npmCDNs, module: moduleCDNs, gh: ghCDNs },

  /** 检查 CDN 可用性 */
  checkCDNs: async (testModule: string, preferredCDN?: CDN) => {
    const cdns: CDN[] = [preferredCDN, ...modulesService.cdnLists.npm].filter(Boolean) as CDN[];
    for (const cdn of cdns) {
      try {
        const res = await fetch(modulesService.getUrl(testModule, cdn), {
          method: 'HEAD',
        });
        if (res.ok) return cdn;
      } catch {
        // continue;
      }
    }
    // fall back to first
    return modulesService.cdnLists.npm[0];
  },
};
