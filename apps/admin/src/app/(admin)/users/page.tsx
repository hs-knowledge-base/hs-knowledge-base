'use client';

import { useState } from 'react';
import { useRequest } from 'alova/client';
import { Plus, Pencil, Trash2, Users, Shield, Mail, Phone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { UserRes } from '@/types/auth';
import { userApi } from "@/lib/api/services/users";
import { useRbac } from '@/hooks/use-rbac';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { hasPermission } = useRbac();

  const {
    data: users,
    loading,
    error,
    send: refetchUsers,
  } = useRequest(() => userApi.getAllUsers(), {
    immediate: true,
  });

  const { send: deleteUser } = useRequest(
    (id: string) => userApi.deleteUser(id),
    {
      immediate: false,
    }
  );

  const { send: toggleStatus } = useRequest(
    (id: string, isActive: boolean) => userApi.toggleUserStatus(id, isActive),
    {
      immediate: false,
    }
  );

  const handleDelete = async (id: string, username: string) => {
    if (confirm(`确定要删除用户"${username}"吗？`)) {
      try {
        await deleteUser(id);
        refetchUsers();
      } catch (error) {
        console.error('删除用户失败:', error);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleStatus(id, !currentStatus);
      refetchUsers();
    } catch (error) {
      console.error('切换用户状态失败:', error);
    }
  };

  // 过滤用户
  const filteredUsers = users?.data?.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-destructive">加载用户列表失败</p>
          <Button 
            variant="outline" 
            onClick={refetchUsers}
            className="mt-2"
          >
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">用户管理</h1>
          <p className="text-muted-foreground">管理系统用户账号和权限</p>
        </div>
        {hasPermission('system.user.add') && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新增用户
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            用户列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="搜索用户名、邮箱或姓名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户</TableHead>
                  <TableHead>用户名</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>电话</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>创建时间</TableHead>
                  {(hasPermission('system.user.edit') || hasPermission('system.user.delete')) && (
                    <TableHead className="text-right">操作</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={hasPermission('system.user.edit') || hasPermission('system.user.delete') ? 8 : 7} 
                      className="h-24 text-center"
                    >
                      {searchTerm ? '没有找到匹配的用户' : '暂无用户数据'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {user.firstName?.charAt(0) || user.username.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user.username}
                            </div>
                            {user.firstName && user.lastName && (
                              <div className="text-sm text-muted-foreground">
                                @{user.username}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-1 py-0.5 rounded">
                          {user.username}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {/* TODO: 添加phone字段到用户类型 */}
                        <span className="text-muted-foreground">-</span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.isActive ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => hasPermission('system.user.edit') && handleToggleStatus(user.id, user.isActive)}
                        >
                          {user.isActive ? '启用' : '禁用'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <Badge key={role.id} variant="outline" className="text-xs">
                                {role.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">无角色</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      {(hasPermission('system.user.edit') || hasPermission('system.user.delete')) && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {hasPermission('system.user.edit') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // TODO: 实现编辑功能
                                  console.log('编辑用户:', user.id);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {hasPermission('system.user.delete') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(user.id, user.username)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
