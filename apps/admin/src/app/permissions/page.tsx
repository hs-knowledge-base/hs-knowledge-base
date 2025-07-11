'use client';

import { useState } from 'react';
import { useRequest } from 'alova/client';
import { Permission, Subject, Action } from '@/types/auth';
import { CanRead, CanCreate, CanUpdate, CanDelete } from '@/components/auth/permission-guard';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PermissionForm } from '@/components/auth/permission-form';
import {permissionApi} from "@/lib/api/services";

export default function PermissionsPage() {
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const {
    data: permissions,
    loading,
    error,
    send: refetchPermissions,
  } = useRequest(() => permissionApi.getAllPermissions(), {
    immediate: true,
  });

  const { send: deletePermission } = useRequest(
    (id: string) => permissionApi.deletePermission(id),
    {
      immediate: false,
    }
  );

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个权限吗？')) {
      try {
        await deletePermission(id);
        refetchPermissions();
      } catch (error) {
        console.error('删除权限失败:', error);
      }
    }
  };

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsEditDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedPermission(null);
    refetchPermissions();
  };

  const getActionLabel = (action: Action) => {
    const labels = {
      [Action.CREATE]: '创建',
      [Action.READ]: '读取',
      [Action.UPDATE]: '更新',
      [Action.DELETE]: '删除',
      [Action.MANAGE]: '管理',
    };
    return labels[action] || action;
  };

  const getSubjectLabel = (subject: Subject) => {
    const labels = {
      [Subject.USER]: '用户',
      [Subject.ROLE]: '角色',
      [Subject.PERMISSION]: '权限',
      [Subject.DOCUMENT]: '文档',
      [Subject.KNOWLEDGE_BASE]: '知识库',
      [Subject.ALL]: '全部',
    };
    return labels[subject] || subject;
  };

  if (loading) {
    return <div className="p-6">加载中...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">加载失败: {error.message}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">权限管理</h1>
        <CanCreate subject={Subject.PERMISSION}>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>创建权限</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>创建权限</DialogTitle>
              </DialogHeader>
              <PermissionForm onSuccess={handleFormSuccess} />
            </DialogContent>
          </Dialog>
        </CanCreate>
      </div>

      <CanRead subject={Subject.PERMISSION}>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>操作</TableHead>
                <TableHead>资源</TableHead>
                <TableHead>条件</TableHead>
                <TableHead>字段限制</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>说明</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions?.map((permission: Permission) => (
                <TableRow key={permission.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {getActionLabel(permission.action)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getSubjectLabel(permission.subject)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {permission.conditions ? (
                      <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                        {JSON.stringify(permission.conditions)}
                      </code>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{permission.fields || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={permission.inverted ? 'destructive' : 'default'}>
                      {permission.inverted ? '禁止' : '允许'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {permission.reason || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <CanUpdate subject={Subject.PERMISSION}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(permission)}
                        >
                          编辑
                        </Button>
                      </CanUpdate>
                      <CanDelete subject={Subject.PERMISSION}>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(permission.id)}
                        >
                          删除
                        </Button>
                      </CanDelete>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CanRead>

      {/* 编辑权限对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑权限</DialogTitle>
          </DialogHeader>
          {selectedPermission && (
            <PermissionForm
              permission={selectedPermission}
              onSuccess={handleFormSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
