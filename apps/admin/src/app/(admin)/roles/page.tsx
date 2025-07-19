'use client';

import { useState, useMemo } from 'react';
import { useRequest } from 'alova/client';
import { 
  Plus, 
  Edit, 
  Trash2,
  Shield, 
  MoreHorizontal,
  Eye,
  EyeOff,
  Search,
  Filter
} from 'lucide-react';

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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PermissionTreeSelector } from '@/components/ui/permission-tree-selector';

import { RoleRes, CreateRoleReq, PermissionRes } from '@/types/auth';
import { roleApi } from '@/lib/api/services/roles';
import { permissionApi } from '@/lib/api/services/permissions';
import { usePermission } from '@/hooks/use-permission';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const roleFormSchema = z.object({
  name: z.string().min(1, '角色名称不能为空').max(100, '角色名称不能超过100个字符'),
  description: z.string().optional(),
  level: z.number().min(0, '角色级别不能小于0').optional(),
  isActive: z.boolean().optional(),
  parentId: z.number().optional(),
  permissionIds: z.array(z.number()).optional(),
});

type RoleFormData = z.infer<typeof roleFormSchema>;

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleRes | null>(null);


  // 获取角色列表
  const {
    data: roles,
    loading,
    error,
    send: refetchRoles,
  } = useRequest(() => roleApi.getAllRoles(), {
    immediate: true,
  });

  // 获取权限树
  const {
    data: permissionTree,
    loading: permissionsLoading,
  } = useRequest(() => permissionApi.getPermissionTree(), {
    immediate: true,
  });

  // 创建角色请求
  const { loading: creating, send: createRole } = useRequest(
    (data: CreateRoleReq) => roleApi.createRole(data),
    {
      immediate: false,
    }
  );

  // 更新角色请求
  const { loading: updating, send: updateRole } = useRequest(
    (id: number, data: Partial<CreateRoleReq>) => roleApi.updateRole(id, data),
    {
      immediate: false,
    }
  );

  // 删除角色请求
  const { loading: deleting, send: deleteRole } = useRequest(
    (id: number) => roleApi.deleteRole(id),
    {
      immediate: false,
    }
  );

  // 切换状态请求
  const { loading: toggling, send: toggleStatus } = useRequest(
    (id: number, isActive: boolean) => roleApi.toggleRoleStatus(id, isActive),
    {
      immediate: false,
    }
  );

  // 表单
  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      description: '',
      level: 0,
      isActive: true,
      permissionIds: [],
    },
  });

  // 过滤后的角色列表
  const filteredRoles = useMemo(() => {
    if (!roles?.data) return [];
    
    return roles.data.filter(role => {
      // 搜索过滤
      const matchesSearch = !searchTerm || 
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // 状态过滤
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && role.isActive) ||
        (statusFilter === 'inactive' && !role.isActive);
      
      return matchesSearch && matchesStatus;
    });
  }, [roles?.data, searchTerm, statusFilter]);

  const handleCreateRole = async (data: RoleFormData) => {
    try {
      await createRole(data);
      alert('角色创建成功');
      setShowCreateDialog(false);
      setSelectedRole(null);
      form.reset({
        name: '',
        description: '',
        level: 0,
        isActive: true,
        parentId: undefined,
        permissionIds: [],
      });
      refetchRoles();
    } catch (error) {
      alert('角色创建失败');
    }
  };

  const handleCreateNewRole = () => {
    // 重置表单为默认值
    form.reset({
      name: '',
      description: '',
      level: 0,
      isActive: true,
      parentId: undefined,
      permissionIds: [],
    });
    setSelectedRole(null);
    setShowCreateDialog(true);
  };

  const handleEditRole = (role: RoleRes) => {
    setSelectedRole(role);
    form.reset({
      name: role.name,
      description: role.description || '',
      level: role.level || 0,
      isActive: role.isActive,
      parentId: role.parent?.id,
      permissionIds: role.permissions?.map(p => p.id) || [],
    });
    setShowEditDialog(true);
  };

  const handleUpdateRole = async (data: RoleFormData) => {
    if (!selectedRole) return;
    
    try {
      await updateRole(selectedRole.id, data);
      alert('角色更新成功');
      setShowEditDialog(false);
      setSelectedRole(null);
      form.reset({
        name: '',
        description: '',
        level: 0,
        isActive: true,
        parentId: undefined,
        permissionIds: [],
      });
      refetchRoles();
    } catch (error) {
      alert('角色更新失败');
    }
  };

  const handleDeleteRole = (role: RoleRes) => {
    setSelectedRole(role);
    setShowDeleteDialog(true);
  };

  const confirmDeleteRole = async () => {
    if (!selectedRole) return;
    
    try {
      await deleteRole(selectedRole.id);
      alert('角色删除成功');
      setShowDeleteDialog(false);
      setSelectedRole(null);
      refetchRoles();
    } catch (error) {
      alert('角色删除失败');
    }
  };

  const handleToggleStatus = async (role: RoleRes) => {
    try {
      await toggleStatus(role.id, !role.isActive);
      alert(`角色已${role.isActive ? '禁用' : '启用'}`);
      refetchRoles();
    } catch (error) {
      alert('状态切换失败');
    }
  };

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

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
           <div className="flex">
             <div className="flex items-center gap-2">
               <Search className="h-4 w-4 text-muted-foreground" />
               <Input
                 placeholder="搜索角色名称或描述..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="max-w-sm"
               />
             </div>
             <div className="flex items-center gap-2">
               <Filter className="h-4 w-4 text-muted-foreground" />
               <Select value={statusFilter} onValueChange={setStatusFilter}>
                 <SelectTrigger className="w-40">
                   <SelectValue placeholder="筛选状态" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">全部状态</SelectItem>
                   <SelectItem value="active">已启用</SelectItem>
                   <SelectItem value="inactive">已禁用</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             {(searchTerm || statusFilter !== 'all') && (
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => {
                   setSearchTerm('');
                   setStatusFilter('all');
                 }}
               >
                 清除筛选
               </Button>
             )}
           </div>
            <PermissionGuard permission="system.role.add">
              <Button
                onClick={handleCreateNewRole}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                新增角色
              </Button>
            </PermissionGuard>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>角色名称</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>级别</TableHead>
                <TableHead>权限数量</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    暂无角色数据
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">
                      {role.name}
                      {role.parent && (
                        <div className="text-xs text-muted-foreground">
                          继承自: {role.parent.name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{role.description || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        Level {role.level || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        {role.permissions?.length || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={role.isActive ? 'default' : 'secondary'}>
                        {role.isActive ? '已启用' : '已禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(role.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <PermissionGuard permission="system.role.edit">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditRole(role)}
                            className="h-8 w-8 p-0"
                            title="编辑角色"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        
                        <PermissionGuard permissions={["system.role.edit", "system.role.delete"]}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="更多操作">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <PermissionGuard permission="system.role.edit">
                                <DropdownMenuItem 
                                  onClick={() => handleToggleStatus(role)}
                                >
                                  {role.isActive ? (
                                    <>
                                      <EyeOff className="h-4 w-4 mr-2" />
                                      禁用
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-4 w-4 mr-2" />
                                      启用
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </PermissionGuard>
                              
                              <PermissionGuard permission="system.role.delete">
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteRole(role)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  删除
                                </DropdownMenuItem>
                              </PermissionGuard>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </PermissionGuard>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 创建角色对话框 */}
      <Dialog 
        open={showCreateDialog} 
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) {
            form.reset({
              name: '',
              description: '',
              level: 0,
              isActive: true,
              parentId: undefined,
              permissionIds: [],
            });
            setSelectedRole(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新增角色</DialogTitle>
            <DialogDescription>
              创建新的系统角色
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateRole)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>角色名称 *</FormLabel>
                      <FormControl>
                        <Input placeholder="如: 系统管理员" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>角色级别</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        数值越大级别越高
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>角色描述</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="角色功能描述..."
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>父角色</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value && value !== 'none' ? Number(value) : undefined)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择父角色（可选）" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">无父角色</SelectItem>
                        {roles?.data?.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permissionIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>权限分配</FormLabel>
                    <PermissionTreeSelector
                      permissions={permissionTree?.data || []}
                      selectedIds={field.value || []}
                      onSelectionChange={field.onChange}
                      isLoading={permissionsLoading}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                >
                  取消
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? '创建中...' : '创建'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 编辑角色对话框 */}
      <Dialog 
        open={showEditDialog} 
        onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) {
            form.reset({
              name: '',
              description: '',
              level: 0,
              isActive: true,
              parentId: undefined,
              permissionIds: [],
            });
            setSelectedRole(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑角色</DialogTitle>
            <DialogDescription>
              修改角色信息
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateRole)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>角色名称 *</FormLabel>
                      <FormControl>
                        <Input placeholder="如: 系统管理员" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>角色级别</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        数值越大级别越高
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>角色描述</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="角色功能描述..."
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>父角色</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value && value !== 'none' ? Number(value) : undefined)}
                      value={field.value ? field.value.toString() : 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择父角色（可选）" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">无父角色</SelectItem>
                        {roles?.data?.filter(role => role.id !== selectedRole?.id).map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permissionIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>权限分配</FormLabel>
                    <PermissionTreeSelector
                      permissions={permissionTree?.data || []}
                      selectedIds={field.value || []}
                      onSelectionChange={field.onChange}
                      isLoading={permissionsLoading}
                    />
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

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除角色 "{selectedRole?.name}" 吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
            >
              取消
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteRole}
              disabled={deleting}
            >
              {deleting ? '删除中...' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 