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
const REPO_OWNER = 'huoshan25';
const REPO_NAME = 'hs-knowledge-base';
const OUTPUT_DIR = path.join(__dirname, '../public/data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'contributors.json');

// 使用环境变量中的token或GitHub Actions提供的token
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

/**
 * 从GitHub API获取数据
 */
async function fetchFromGitHub(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': `${REPO_OWNER}-${REPO_NAME}-app`,
        'Accept': 'application/vnd.github.v3+json',
      },
    };
    
    if (GITHUB_TOKEN) {
      options.headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }
    
    https.get(url, options, (res) => {
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
  });
}

/**
 * 获取所有贡献者
 */
async function fetchContributors(page = 1) {
  try {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contributors?per_page=100&page=${page}`;
    const data = await fetchFromGitHub(url) || [];
    
    const contributors = data.map(i => ({
      login: i.login,
      avatar_url: i.avatar_url,
      contributions: i.contributions,
      html_url: i.html_url
    }));
    
    if (data.length === 100) {
      const nextPageContributors = await fetchContributors(page + 1);
      contributors.push(...nextPageContributors);
    }
    
    return contributors.filter(
      contributor => !['renovate[bot]', 'dependabot[bot]'].includes(contributor.login)
    );
  } catch (error) {
    console.error('获取贡献者失败:', error);
    return [];
  }
}

/**
 * 获取仓库协作者
 */
async function fetchCollaborators() {
  try {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/collaborators`;
    const data = await fetchFromGitHub(url) || [];
    return data.map(i => i.login);
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
    console.log(`找到 ${allContributors.length} 个贡献者`);
    
    // 获取仓库协作者
    const collaboratorLogins = await fetchCollaborators();
    console.log(`找到 ${collaboratorLogins.length} 个协作者`);
    
    // 创建协作者集合，用于快速查找
    const collaboratorsSet = new Set(collaboratorLogins);
    
    // 为每个贡献者添加是否为协作者的标记
    const contributors = allContributors.map(contributor => ({
      ...contributor,
      isCollaborator: collaboratorsSet.has(contributor.login)
    }));
    
    // 保存数据
    const data = {
      contributors,
      lastUpdated: new Date().toISOString()
    };
    
    // 确保输出目录存在
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
    console.log(`数据已保存到 ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('获取贡献者数据失败:', error);
    process.exit(1);
  }
}

// 执行主函数
main(); 