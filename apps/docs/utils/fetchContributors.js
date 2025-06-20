/**
 * 从GitHub API获取贡献者信息的工具函数
 * 可以在Contributors组件中使用，也可以单独运行生成静态数据
 */

// GitHub API配置
const GITHUB_API_BASE = 'https://api.github.com'
const REPO_OWNER = 'huoshan25'
const REPO_NAME = 'hs-knowledge-base'

/**
 * 获取仓库贡献者列表
 * @param {string} token - GitHub Personal Access Token (可选)
 * @returns {Promise<Array>} 贡献者列表
 */
export async function fetchContributors(token = null) {
  try {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'hs-knowledge-base-contributors'
    }
    
    // 如果提供了token，添加授权头
    if (token) {
      headers['Authorization'] = `token ${token}`
    }

    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contributors`,
      { headers }
    )

    if (!response.ok) {
      throw new Error(`GitHub API请求失败: ${response.status}`)
    }

    const contributors = await response.json()

    console.log(contributors,'contributors')
    
    // 转换为我们需要的格式
    return contributors.map((contributor, index) => ({
      id: contributor.id,
      name: contributor.login,
      avatar: contributor.avatar_url,
      github: contributor.html_url,
      contributions: contributor.contributions,
      type: determineContributorType(contributor, index)
    }))
  } catch (error) {
    console.error('获取贡献者数据失败:', error)
    return []
  }
}

/**
 * 获取更详细的用户信息
 * @param {string} username - GitHub用户名
 * @param {string} token - GitHub Personal Access Token (可选)
 * @returns {Promise<Object>} 用户详细信息
 */
export async function fetchUserDetails(username, token = null) {
  try {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'hs-knowledge-base-contributors'
    }
    
    if (token) {
      headers['Authorization'] = `token ${token}`
    }

    const response = await fetch(
      `${GITHUB_API_BASE}/users/${username}`,
      { headers }
    )

    if (!response.ok) {
      return null
    }

    const user = await response.json()
    
    return {
      name: user.name || user.login,
      bio: user.bio,
      location: user.location,
      website: user.blog,
      company: user.company,
      publicRepos: user.public_repos,
      followers: user.followers,
      createdAt: user.created_at
    }
  } catch (error) {
    console.error(`获取用户${username}详细信息失败:`, error)
    return null
  }
}

/**
 * 获取仓库的Pull Request统计
 * @param {string} username - GitHub用户名
 * @param {string} token - GitHub Personal Access Token (可选)
 * @returns {Promise<number>} PR数量
 */
export async function fetchUserPRCount(username, token = null) {
  try {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'hs-knowledge-base-contributors'
    }
    
    if (token) {
      headers['Authorization'] = `token ${token}`
    }

    const response = await fetch(
      `${GITHUB_API_BASE}/search/issues?q=repo:${REPO_OWNER}/${REPO_NAME}+type:pr+author:${username}`,
      { headers }
    )

    if (!response.ok) {
      return 0
    }

    const data = await response.json()
    return data.total_count || 0
  } catch (error) {
    console.error(`获取用户${username}PR数量失败:`, error)
    return 0
  }
}

/**
 * 确定贡献者类型
 * @param {Object} contributor - GitHub贡献者对象
 * @param {number} index - 在列表中的位置
 * @returns {string} 贡献者类型 (core, active, regular)
 */
function determineContributorType(contributor, index) {
  // 项目创始人或管理员
  if (contributor.login === REPO_OWNER) {
    return 'core'
  }
  
  // 前几名贡献者或贡献数量很高的用户
  if (index < 3 || contributor.contributions > 50) {
    return 'core'
  }
  
  // 活跃贡献者
  if (contributor.contributions > 10) {
    return 'active'
  }
  
  // 普通贡献者
  return 'regular'
}

/**
 * 获取完整的贡献者信息（包含详细信息和PR统计）
 * @param {string} token - GitHub Personal Access Token (可选，但推荐使用以避免API限制)
 * @returns {Promise<Array>} 完整的贡献者列表
 */
export async function fetchCompleteContributors(token = null) {
  const contributors = await fetchContributors(token)
  
  // 为每个贡献者获取详细信息
  const detailedContributors = await Promise.all(
    contributors.map(async (contributor) => {
      const [userDetails, prCount] = await Promise.all([
        fetchUserDetails(contributor.name, token),
        fetchUserPRCount(contributor.name, token)
      ])
      
      return {
        ...contributor,
        role: getUserRole(contributor, userDetails),
        website: userDetails?.website || null,
        bio: userDetails?.bio || null,
        location: userDetails?.location || null,
        pullRequests: prCount,
        displayName: userDetails?.name || contributor.name
      }
    })
  )
  
  return detailedContributors
}

/**
 * 根据用户信息确定角色描述
 * @param {Object} contributor - 贡献者信息
 * @param {Object} userDetails - 用户详细信息
 * @returns {string} 角色描述
 */
function getUserRole(contributor, userDetails) {
  if (contributor.name === REPO_OWNER) {
    return '项目创始人 & 核心开发者'
  }
  
  if (contributor.type === 'core') {
    return '核心贡献者'
  }
  
  if (contributor.type === 'active') {
    return '活跃贡献者'
  }
  
  // 可以根据用户的bio或其他信息推断角色
  if (userDetails?.bio) {
    if (userDetails.bio.toLowerCase().includes('frontend')) {
      return '前端开发工程师'
    }
    if (userDetails.bio.toLowerCase().includes('backend')) {
      return '后端开发工程师'
    }
    if (userDetails.bio.toLowerCase().includes('fullstack')) {
      return '全栈开发工程师'
    }
  }
  
  return '开发者'
}

// 导出默认配置
export const config = {
  repoOwner: REPO_OWNER,
  repoName: REPO_NAME,
  apiBase: GITHUB_API_BASE
}

// 如果直接运行此脚本，输出贡献者信息到控制台
if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('fetchContributors.js')) {
  fetchCompleteContributors()
    .then(contributors => {
      console.log('贡献者信息:')
      console.table(contributors.map(c => ({
        姓名: c.displayName,
        用户名: c.name,
        角色: c.role,
        贡献数: c.contributions,
        PR数: c.pullRequests,
        类型: c.type
      })))
    })
    .catch(console.error)
} 