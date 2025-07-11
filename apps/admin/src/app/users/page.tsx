'use client';

import { useState } from 'react';
import { useRequest } from 'alova/client';
import { userApi } from '@/lib/api';
import { User, Subject } from '@/types/auth';
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
import { UserForm } from '@/components/auth/user-form';
import { UserRoleAssignment } from '@/components/auth/user-role-assignment';

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

  const {
    data: users,
    loading,
    error,
    send: refetchUsers,
  } = useRequest(() => userApi.getUsers(), {
    immediate: true,
  }) as {
    data: User[] | undefined;
    loading: boolean;
    error: any;
    send: () => void;
  };

  const { send: deleteUser } = useRequest(
    (id: string) => userApi.deleteUser(id),
    {
      immediate: false,
    }
  );

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个用户吗？')) {
      try {
        await deleteUser(id);
        refetchUsers();
      } catch (error) {
        console.error('删除用户失败:', error);
      }
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleAssignRoles = (user: User) => {
    setSelectedUser(user);
    setIsRoleDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsRoleDialogOpen(false);
    setSelectedUser(null);
    refetchUsers();
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
        <h1 className="text-2xl font-bold">用户管理</h1>
        <CanCreate subject={Subject.USER}>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>创建用户</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>创建用户</DialogTitle>
              </DialogHeader>
              <UserForm onSuccess={handleFormSuccess} />
            </DialogContent>
          </Dialog>
        </CanCreate>
      </div>

      <CanRead subject={Subject.USER}>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户名</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>姓名</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users && Array.isArray(users) ? users.map((user: User) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? '激活' : '禁用'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {user.roles?.map((role) => (
                        <Badge key={role.id} variant="outline">
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <CanUpdate subject={Subject.USER}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          编辑
                        </Button>
                      </CanUpdate>
                      <CanUpdate subject={Subject.ROLE}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignRoles(user)}
                        >
                          分配角色
                        </Button>
                      </CanUpdate>
                      <CanDelete subject={Subject.USER}>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                        >
                          删除
                        </Button>
                      </CanDelete>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    暂无用户数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CanRead>

      {/* 编辑用户对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserForm
              user={selectedUser}
              onSuccess={handleFormSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 分配角色对话框 */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>分配角色</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserRoleAssignment
              user={selectedUser}
              onSuccess={handleFormSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
