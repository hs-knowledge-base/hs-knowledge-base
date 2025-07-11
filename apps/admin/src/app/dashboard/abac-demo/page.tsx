'use client';

import { useState } from 'react';
import { useCurrentUserPermissions } from '@/hooks/use-permissions';
import { Action, Subject } from '@/types/auth';
import { CanRead, CanCreate, CanUpdate, CanDelete, CanManage } from '@/components/auth/permission-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Users, FileText, Settings } from 'lucide-react';

export default function AbacDemoPage() {
  const { user, permissions, loading, hasPermission } = useCurrentUserPermissions();
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const testCases = [
    { action: Action.READ, subject: Subject.USER, label: '读取用户' },
    { action: Action.CREATE, subject: Subject.USER, label: '创建用户' },
    { action: Action.UPDATE, subject: Subject.USER, label: '更新用户' },
    { action: Action.DELETE, subject: Subject.USER, label: '删除用户' },
    { action: Action.MANAGE, subject: Subject.ALL, label: '管理所有资源' },
    { action: Action.READ, subject: Subject.PERMISSION, label: '读取权限' },
    { action: Action.CREATE, subject: Subject.PERMISSION, label: '创建权限' },
  ];

  const runPermissionTests = () => {
    const results: Record<string, boolean> = {};
    testCases.forEach((testCase) => {
      const key = `${testCase.action}-${testCase.subject}`;
      results[key] = hasPermission(testCase.action, testCase.subject);
    });
    setTestResults(results);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ABAC 权限系统演示</h1>
          <p className="text-muted-foreground">
            演示基于属性的访问控制 (ABAC) 功能
          </p>
        </div>
        <Button onClick={runPermissionTests}>
          <Shield className="mr-2 h-4 w-4" />
          运行权限测试
        </Button>
      </div>

      {/* 当前用户信息 */}
      <Card>
        <CardHeader>
          <CardTitle>当前用户信息</CardTitle>
          <CardDescription>显示当前登录用户的基本信息和权限</CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">用户名</label>
                  <p className="text-sm text-muted-foreground">{user.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">邮箱</label>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">部门</label>
                  <p className="text-sm text-muted-foreground">{user.department || '未设置'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">职位</label>
                  <p className="text-sm text-muted-foreground">{user.position || '未设置'}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">角色</label>
                <div className="flex gap-2 mt-1">
                  {user.roles?.map((role) => (
                    <Badge key={role.id} variant="outline">
                      {role.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">用户属性</label>
                <pre className="text-xs bg-muted p-2 rounded mt-1">
                  {JSON.stringify(user.attributes, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                未找到用户信息，请确保已正确设置当前用户ID
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 权限测试结果 */}
      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>权限测试结果</CardTitle>
            <CardDescription>显示各种操作的权限检查结果</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {testCases.map((testCase) => {
                const key = `${testCase.action}-${testCase.subject}`;
                const hasAccess = testResults[key];
                return (
                  <div key={key} className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">{testCase.label}</span>
                    <Badge variant={hasAccess ? 'default' : 'destructive'}>
                      {hasAccess ? '允许' : '拒绝'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 权限保护组件演示 */}
      <Card>
        <CardHeader>
          <CardTitle>权限保护组件演示</CardTitle>
          <CardDescription>演示如何使用权限保护组件控制UI显示</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <CanRead subject={Subject.USER}>
              <div className="p-4 border rounded bg-green-50">
                <Users className="h-6 w-6 mb-2 text-green-600" />
                <h3 className="font-medium">用户管理</h3>
                <p className="text-sm text-muted-foreground">您有权限查看用户信息</p>
              </div>
            </CanRead>

            <CanCreate subject={Subject.USER}>
              <div className="p-4 border rounded bg-blue-50">
                <Users className="h-6 w-6 mb-2 text-blue-600" />
                <h3 className="font-medium">创建用户</h3>
                <p className="text-sm text-muted-foreground">您有权限创建新用户</p>
              </div>
            </CanCreate>

            <CanRead subject={Subject.PERMISSION}>
              <div className="p-4 border rounded bg-purple-50">
                <Shield className="h-6 w-6 mb-2 text-purple-600" />
                <h3 className="font-medium">权限管理</h3>
                <p className="text-sm text-muted-foreground">您有权限查看权限信息</p>
              </div>
            </CanRead>

            <CanManage subject={Subject.ALL}>
              <div className="p-4 border rounded bg-orange-50">
                <Settings className="h-6 w-6 mb-2 text-orange-600" />
                <h3 className="font-medium">系统管理</h3>
                <p className="text-sm text-muted-foreground">您有系统管理权限</p>
              </div>
            </CanManage>
          </div>

          {/* 无权限时的回退内容演示 */}
          <div className="space-y-2">
            <h4 className="font-medium">权限不足时的回退内容：</h4>
            <CanDelete 
              subject={Subject.PERMISSION}
              fallback={
                <div className="p-4 border rounded bg-red-50">
                  <p className="text-sm text-red-600">您没有删除权限的权限</p>
                </div>
              }
            >
              <div className="p-4 border rounded bg-green-50">
                <p className="text-sm text-green-600">您有删除权限的权限</p>
              </div>
            </CanDelete>
          </div>
        </CardContent>
      </Card>

      {/* 当前权限列表 */}
      <Card>
        <CardHeader>
          <CardTitle>当前用户权限列表</CardTitle>
          <CardDescription>显示当前用户拥有的所有权限</CardDescription>
        </CardHeader>
        <CardContent>
          {permissions.length > 0 ? (
            <div className="space-y-2">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{permission.action}</Badge>
                    <Badge variant="secondary">{permission.subject}</Badge>
                    {permission.inverted && (
                      <Badge variant="destructive">禁止</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {permission.reason || '无说明'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                当前用户没有任何权限
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
