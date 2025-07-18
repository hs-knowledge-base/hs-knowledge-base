'use client';

import { useState } from 'react';
import { useRequest } from 'alova/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Plus, Users, Mail, Edit, Trash2 } from 'lucide-react';

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { PermissionGuard } from '@/components/auth/permission-guard';

import { UserRes } from '@/types/auth';
import { userApi } from "@/lib/api/services/users";
import { roleApi } from "@/lib/api/services/roles";
import { UpdateUserReq } from "@/lib/api/services/users/type";

// 用户表单验证 schema
const userFormSchema = z.object({
  username: z.string().min(2, '用户名至少2个字符').max(50, '用户名最多50个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  isActive: z.boolean(),
  roleIds: z.array(z.number()),
});

type UserFormData = z.infer<typeof userFormSchema>;

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRes | null>(null);

  // 表单实例
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      isActive: true,
      roleIds: [],
    },
  });

  const {
    data: users,
    loading,
    error,
    send: refetchUsers,
  } = useRequest(() => userApi.getAllUsers(), {
    immediate: true,
  });

  // 获取所有角色用于选择
  const {
    data: roles,
    loading: rolesLoading,
  } = useRequest(() => roleApi.getAllRoles(), {
    immediate: true,
  });

  const { send: deleteUser } = useRequest(
    (id: number) => userApi.deleteUser(id),
    {
      immediate: false,
    }
  );

  const { send: toggleStatus } = useRequest(
    (id: number, isActive: boolean) => userApi.toggleUserStatus(id, isActive),
    {
      immediate: false,
    }
  );

  const { 
    send: updateUser, 
    loading: updating 
  } = useRequest(
    (id: number, data: UpdateUserReq) => userApi.updateUser(id, data),
    {
      immediate: false,
    }
  );

  const handleDelete = async (id: number, username: string) => {
    if (confirm(`确定要删除用户"${username}"吗？`)) {
      try {
        await deleteUser(id);
        refetchUsers();
      } catch (error) {
        console.error('删除用户失败:', error);
      }
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await toggleStatus(id, !currentStatus);
      refetchUsers();
    } catch (error) {
      console.error('切换用户状态失败:', error);
    }
  };

  const handleEditUser = (user: UserRes) => {
    setSelectedUser(user);
    form.reset({
      username: user.username,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      isActive: user.isActive,
      roleIds: user.roles?.map(r => r.id) || [],
    });
    setShowEditDialog(true);
  };

  const handleUpdateUser = async (data: UserFormData) => {
    if (!selectedUser) return;
    
    try {
      await updateUser(selectedUser.id, data);
      alert('用户更新成功');
      setShowEditDialog(false);
      setSelectedUser(null);
      form.reset({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        isActive: true,
        roleIds: [],
      });
      refetchUsers();
    } catch (error) {
      alert('用户更新失败');
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
        <PermissionGuard permission="system.user.add">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新增用户
          </Button>
        </PermissionGuard>
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
                  <TableHead>状态</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>创建时间</TableHead>
                  <PermissionGuard permissions={['system.user.edit', 'system.user.delete']}>
                    <TableHead className="text-right">操作</TableHead>
                  </PermissionGuard>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={8} 
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
                        <PermissionGuard permission="system.user.edit" fallback={
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? '启用' : '禁用'}
                          </Badge>
                        }>
                          <Badge 
                            variant={user.isActive ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => handleToggleStatus(user.id, user.isActive)}
                          >
                            {user.isActive ? '启用' : '禁用'}
                          </Badge>
                        </PermissionGuard>
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
                      <PermissionGuard permissions={['system.user.edit', 'system.user.delete']}>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <PermissionGuard permission="system.user.edit">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard permission="system.user.delete">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(user.id, user.username)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                          </div>
                        </TableCell>
                      </PermissionGuard>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 编辑用户对话框 */}
      <Dialog 
        open={showEditDialog} 
        onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) {
            form.reset({
              username: '',
              email: '',
              firstName: '',
              lastName: '',
              isActive: true,
              roleIds: [],
            });
            setSelectedUser(null);
          }
        }}
      >
        <DialogContent className="w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
            <DialogDescription>
              修改用户基本信息和角色分配
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateUser)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>用户名 *</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入用户名" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱 *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="请输入邮箱" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>名</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入名" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>姓</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入姓" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>启用用户</FormLabel>
                      <FormDescription>
                        禁用后用户将无法登录系统
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roleIds"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">角色分配</FormLabel>
                      <FormDescription>
                        选择用户的角色，用户将继承所选角色的权限
                      </FormDescription>
                    </div>
                                        {rolesLoading ? (
                      <div className="text-sm text-muted-foreground">加载角色中...</div>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto border rounded-md p-3 bg-muted/30">
                        {roles?.data?.map((role) => (
                          <FormField
                            key={role.id}
                            control={form.control}
                            name="roleIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={role.id}
                                  className="flex items-center space-x-3 space-y-0 p-3 rounded-md hover:bg-accent transition-colors border border-transparent hover:border-border"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(role.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, role.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== role.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <span className="font-medium text-sm">{role.name}</span>
                                        {role.level && (
                                          <Badge variant="secondary" className="text-xs font-normal">
                                            级别 {role.level}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    {role.description && (
                                      <div className="text-xs text-muted-foreground leading-relaxed">
                                        {role.description}
                                      </div>
                                    )}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEditDialog(false)}
                >
                  取消
                </Button>
                <Button type="submit" disabled={updating}>
                  {updating ? '更新中...' : '更新'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
