#!/usr/bin/env node

import { getDocumentContributors, generateContributorKey } from './contributors.js'

async function testContributors() {
  console.log('🚀 开始测试贡献者组件功能...\n')

  try {
    // 测试贡献者数据获取
    console.log('📊 正在分析贡献者数据...')
    const contributorsData = await getDocumentContributors()
    
    console.log(`✅ 成功分析了 ${Object.keys(contributorsData).length} 个文档的贡献者\n`)

    // 显示前几个示例
    const entries = Object.entries(contributorsData).slice(0, 5)
    console.log('📋 贡献者数据示例:')
    console.log('================')
    
    for (const [path, contributors] of entries) {
      console.log(`\n📄 文档: ${path}`)
      console.log(`🔑 组件键: ${generateContributorKey(path)}`)
      console.log(`👥 贡献者 (${contributors.length} 人):`)
      
      contributors.slice(0, 3).forEach(contributor => {
        console.log(`   - ${contributor.name} (${contributor.count} 次贡献)`)
      })
      
      if (contributors.length > 3) {
        console.log(`   ... 还有 ${contributors.length - 3} 人`)
      }
    }

    // 测试键名生成
    console.log('\n🔧 测试键名生成功能:')
    console.log('=====================')
    const testPaths = [
      'client/web前端技术/index.md',
      'server/数据存储技术/MySQL优化.md',
      'ai/基础模型技术/index.md'
    ]
    
    testPaths.forEach(path => {
      const key = generateContributorKey(path)
      console.log(`${path} -> ${key}`)
    })

    console.log('\n✅ 贡献者组件功能测试完成!')
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// 直接执行测试函数
testContributors() 