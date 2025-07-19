'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Activity,
  DollarSign,
  ShoppingCart,
  Eye,
  MessageSquare,
  UserCheck,
  Shield
} from 'lucide-react'
import Link from 'next/link'
import { useRbac } from '@/hooks/use-rbac'

const statsCards = [
  {
    title: '总用户数',
    value: '2,847',
    change: '+12.5%',
    changeType: 'positive' as const,
    icon: Users,
    description: '较上月增长'
  },
  {
    title: '文章数量',
    value: '1,234',
    change: '+8.2%',
    changeType: 'positive' as const,
    icon: FileText,
    description: '本月新增'
  },
  {
    title: '页面浏览量',
    value: '45,678',
    change: '+15.3%',
    changeType: 'positive' as const,
    icon: Eye,
    description: '今日访问'
  },
  {
    title: '评论数量',
    value: '892',
    change: '-2.1%',
    changeType: 'negative' as const,
    icon: MessageSquare,
    description: '本周统计'
  }
]

const recentActivities = [
  {
    id: 1,
    user: '张三',
    action: '发布了新文章',
    target: 'React 最佳实践指南',
    time: '2 分钟前',
    type: 'create'
  },
  {
    id: 2,
    user: '李四',
    action: '更新了用户资料',
    target: '',
    time: '5 分钟前',
    type: 'update'
  },
  {
    id: 3,
    user: '王五',
    action: '删除了评论',
    target: '关于 TypeScript 的讨论',
    time: '10 分钟前',
    type: 'delete'
  },
  {
    id: 4,
    user: '赵六',
    action: '注册了新账户',
    target: '',
    time: '15 分钟前',
    type: 'register'
  }
]

export default function DashboardPage() {
  const { hasPermission } = useRbac();

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
        <p className="text-muted-foreground">
          欢迎回来！这里是您的管理概览。
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Badge 
                  variant={card.changeType === 'positive' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {card.change}
                </Badge>
                <span>{card.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 主要内容区域 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* 图表区域 */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>访问趋势</CardTitle>
            <CardDescription>
              最近 7 天的网站访问量统计
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">图表组件占位符</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 最近活动 */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
            <CardDescription>
              系统中的最新动态
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'create' ? 'bg-green-500' :
                      activity.type === 'update' ? 'bg-blue-500' :
                      activity.type === 'delete' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>
                      {' '}{activity.action}
                      {activity.target && (
                        <>
                          {' '}
                          <span className="text-muted-foreground">
                            "{activity.target}"
                          </span>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>
            常用的管理功能快捷入口
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {hasPermission('system.user.view') && (
              <Link href="/users">
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium">用户管理</p>
                    <p className="text-sm text-muted-foreground">管理系统用户</p>
                  </div>
                </div>
              </Link>
            )}
            {hasPermission('system.role.view') && (
              <Link href="/roles">
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                  <UserCheck className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-medium">角色管理</p>
                    <p className="text-sm text-muted-foreground">管理用户角色</p>
                  </div>
                </div>
              </Link>
            )}
            {hasPermission('system.permission.view') && (
              <Link href="/permissions">
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                  <Shield className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="font-medium">权限管理</p>
                    <p className="text-sm text-muted-foreground">查看权限树</p>
                  </div>
                </div>
              </Link>
            )}
            {hasPermission('content.document.view') && (
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                <FileText className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="font-medium">内容管理</p>
                  <p className="text-sm text-muted-foreground">管理文档内容</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
