/**
 * 导航项配置
 * @type {Array}
 */
export const NAV_ITEMS = [
  {text: '首页', link: '/'},
  {text: '客户端', link: '/client/'},
  {text: '服务端', link: '/server/'},
  {text: '系统与底层', link: '/systems/'},
  {text: 'DevOps', link: '/devops/'},
  {text: 'AI应用与大模型', link: '/ai/'},
  {text: '贡献者', link: '/contributors'},
  {text: '关于', link: '/about'}
];

/**
 * 顶级目录列表（用于侧边栏生成）
 * @type {string[]}
 */
export const TOP_LEVEL_DIRS = ['client', 'server', 'systems', 'devops', 'ai'];

/**
 * 特殊目录（不包含在侧边栏中）
 * @type {string[]}
 */
export const SPECIAL_DIRS = ['.git', '.github', 'node_modules', 'public'];