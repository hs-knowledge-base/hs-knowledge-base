#!/usr/bin/env node

/**
 * 在构建时获取GitHub贡献者数据
 * 将数据保存为JSON文件，供前端组件使用
 */

import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 仓库信息
// 优先使用环境变量中的仓库信息（GitHub Actions提供）
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
const [REPO_OWNER, REPO_NAME] = GITHUB_REPOSITORY.split('/');

console.log(`仓库信息: ${REPO_OWNER}/${REPO_NAME}`);

const OUTPUT_DIR = path.join(__dirname, '../public/data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'contributors.json');

// 使用环境变量中的token或GitHub Actions提供的token
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

/**
 * 从GitHub API获取数据，支持重定向
 */
async function fetchFromGitHub(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const makeRequest = (currentUrl, redirectsLeft) => {
      if (redirectsLeft <= 0) {
        reject(new Error('超过最大重定向次数'));
        return;
      }

      const options = {
        headers: {
          'User-Agent': `${REPO_OWNER}-${REPO_NAME}-app`,
          'Accept': 'application/vnd.github.v3+json',
        },
      };
      
      if (GITHUB_TOKEN) {
        options.headers['Authorization'] = `token ${GITHUB_TOKEN}`;
      }
      
      https.get(currentUrl, options, (res) => {
        // 处理重定向
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          console.log(`重定向到: ${res.headers.location}`);
          makeRequest(res.headers.location, redirectsLeft - 1);
          return;
        }
        
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (error) {
              reject(new Error('无法解析GitHub API响应'));
            }
          } else {
            reject(new Error(`GitHub API请求失败: ${res.statusCode} - ${data}`));
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    };
    
    makeRequest(url, maxRedirects);
  });
}

/**
 * 获取单个用户的详细信息
 */
async function fetchUserDetails(username) {
  try {
    const url = `https://api.github.com/users/${username}`;
    console.log(`获取用户详细信息: ${username}`);
    
    const userData = await fetchFromGitHub(url);
    
    return {
      bio: userData.bio,
      location: userData.location,
      company: userData.company,
      blog: userData.blog,
      twitter_username: userData.twitter_username,
      name: userData.name
    };
  } catch (error) {
    console.error(`获取用户 ${username} 详细信息失败:`, error);
    return null;
  }
}

/**
 * 获取所有贡献者
 */
async function fetchContributors(page = 1) {
  try {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contributors?per_page=100&page=${page}`;
    console.log(`请求贡献者数据: ${url}`);
    
    const data = await fetchFromGitHub(url) || [];
    console.log(`API返回贡献者数据: ${data.length} 条记录`);
    
    if (data.length === 0) {
      console.warn('API返回的贡献者数据为空');
      return [];
    }
    
    // 获取基本贡献者信息
    const contributors = [];
    
    for (const contributor of data) {
      // 过滤掉机器人
      if (['renovate[bot]', 'dependabot[bot]'].includes(contributor.login)) {
        continue;
      }
      
      // 获取用户详细信息
      const userDetails = await fetchUserDetails(contributor.login);
      
      contributors.push({
        login: contributor.login,
        avatar_url: contributor.avatar_url,
        contributions: contributor.contributions,
        html_url: contributor.html_url,
        bio: userDetails?.bio || null,
        location: userDetails?.location || null,
        company: userDetails?.company || null,
        blog: userDetails?.blog || null,
        twitter_username: userDetails?.twitter_username || null,
        name: userDetails?.name || contributor.login
      });
    }
    
    if (data.length === 100) {
      console.log(`检测到可能有更多贡献者，请求下一页 (${page + 1})...`);
      const nextPageContributors = await fetchContributors(page + 1);
      contributors.push(...nextPageContributors);
    }
    
    console.log(`获取到 ${contributors.length} 个贡献者的详细信息`);
    return contributors;
  } catch (error) {
    console.error(`获取贡献者失败 (页码 ${page}):`, error);
    return [];
  }
}

/**
 * 获取仓库协作者
 */
async function fetchCollaborators() {
  try {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/collaborators`;
    console.log(`请求协作者数据: ${url}`);
    
    const data = await fetchFromGitHub(url) || [];
    console.log(`API返回协作者数据: ${data.length} 条记录`);
    
    if (data.length === 0) {
      console.warn('API返回的协作者数据为空');
      if (!GITHUB_TOKEN) {
        console.warn('没有设置GITHUB_TOKEN，这可能导致无法获取协作者信息');
      }
    }
    
    const collaborators = data.map(i => i.login);
    return collaborators;
  } catch (error) {
    console.error('获取协作者失败:', error);
    if (error.message && error.message.includes('404')) {
      console.warn('获取协作者需要认证权限，请确保设置了有效的GITHUB_TOKEN');
    }
    return [];
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('开始获取贡献者数据...');
  
  try {
    // 获取所有贡献者
    const allContributors = await fetchContributors();
    console.log(`找到 ${allContributors.length} 个贡献者:`, JSON.stringify(allContributors, null, 2));
    
    // 获取仓库协作者
    const collaboratorLogins = await fetchCollaborators();
    console.log(`找到 ${collaboratorLogins.length} 个协作者:`, JSON.stringify(collaboratorLogins, null, 2));
    
    // 创建协作者集合，用于快速查找
    const collaboratorsSet = new Set(collaboratorLogins);
    
    // 为每个贡献者添加是否为协作者的标记
    const contributors = allContributors.map(contributor => {
      const isCollaborator = collaboratorsSet.has(contributor.login);
      return {
        ...contributor,
        isCollaborator
      };
    });
    
    console.log(`处理后的贡献者数据 (${contributors.length} 个):`, JSON.stringify(contributors, null, 2));
    
    // 保存数据
    const data = {
      contributors,
      lastUpdated: new Date().toISOString()
    };
    
    console.log(`准备保存的数据:`, JSON.stringify(data, null, 2));
    
    // 确保输出目录存在
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
    console.log(`数据已保存到 ${OUTPUT_FILE}`);
    
    // 验证保存的文件
    const savedContent = fs.readFileSync(OUTPUT_FILE, 'utf8');
    console.log(`保存的文件内容:`, savedContent);
  } catch (error) {
    console.error('获取贡献者数据失败:', error);
    process.exit(1);
  }
}

// 执行主函数
main(); 