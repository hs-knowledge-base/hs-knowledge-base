'use client';

import { useState } from 'react';
import { useRequest } from 'alova/client';
import { Plus, Pencil, Trash2, Users, Shield } from 'lucide-react';

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

import { RoleRes } from '@/types/auth';
import { roleApi } from '@/lib/api/services/roles';
import { useRbac } from '@/hooks/use-rbac';

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { hasPermission } = useRbac();

  const {
    data: roles,
    loading,
    error,
    send: refetchRoles,
  } = useRequest(() => roleApi.getAllRoles(), {
    immediate: true,
  });

  const { send: deleteRole } = useRequest(
    (id: string) => roleApi.deleteRole(id),
    {
      immediate: false,
    }
  );

  const { send: toggleStatus } = useRequest(
    (id: string, isActive: boolean) => roleApi.toggleRoleStatus(id, isActive),
    {
      immediate: false,
    }
  );

  const handleDelete = async (id: string, roleName: string) => {
    if (confirm(`确定要删除角色"${roleName}"吗？`)) {
      try {
        await deleteRole(id);
        refetchRoles();
      } catch (error) {
        console.error('删除角色失败:', error);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleStatus(id, !currentStatus);
      refetchRoles();
    } catch (error) {
      console.error('切换角色状态失败:', error);
    }
  };

  // 过滤角色
  const filteredRoles = roles?.data?.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <p className="text-destructive">加载角色列表失败</p>
          <Button 
            variant="outline" 
            onClick={refetchRoles}
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
          <h1 className="text-3xl font-bold">角色管理</h1>
          <p className="text-muted-foreground">管理系统角色和权限分配</p>
        </div>
        {hasPermission('system.role.add') && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新增角色
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            角色列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="搜索角色名称、编码或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>角色名称</TableHead>
                  <TableHead>角色编码</TableHead>
                  <TableHead>层级</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>用户数量</TableHead>
                  <TableHead>创建时间</TableHead>
                  {(hasPermission('system.role.edit') || hasPermission('system.role.delete')) && (
                    <TableHead className="text-right">操作</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={hasPermission('system.role.edit') || hasPermission('system.role.delete') ? 8 : 7} 
                      className="h-24 text-center"
                    >
                      {searchTerm ? '没有找到匹配的角色' : '暂无角色数据'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-1 py-0.5 rounded">
                          {role.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          Level {role.level || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={role.isActive ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => hasPermission('system.role.edit') && handleToggleStatus(role.id, role.isActive)}
                        >
                          {role.isActive ? '启用' : '禁用'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {role.description || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{role.userCount || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(role.createdAt).toLocaleDateString()}
                      </TableCell>
                      {(hasPermission('system.role.edit') || hasPermission('system.role.delete')) && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {hasPermission('system.role.edit') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // TODO: 实现编辑功能
                                  console.log('编辑角色:', role.id);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {hasPermission('system.role.delete') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(role.id, role.name)}
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