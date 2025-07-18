'use client';

import { useState, useMemo } from 'react';
import { useRequest } from 'alova/client';
import { 
  ChevronRight, 
  ChevronDown, 
  Shield, 
  Filter, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Eye,
  EyeOff
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Textarea } from '@/components/ui/textarea';

import { PermissionRes, PermissionType, PermissionTypeValues, CreatePermissionReq } from '@/types/auth';
import { permissionApi } from '@/lib/api/services/permissions';
import { usePermission } from '@/hooks/use-permission';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const permissionFormSchema = z.object({
  code: z.string().min(1, '权限编码不能为空').max(100, '权限编码不能超过100个字符'),
  name: z.string().min(1, '权限名称不能为空').max(100, '权限名称不能超过100个字符'),
  type: z.enum(['module', 'menu', 'button'], {
    required_error: '请选择权限类型',
  }),
  description: z.string().optional(),
  path: z.string().optional(),
  icon: z.string().optional(),
  sort: z.number().min(0, '排序值不能小于0').optional(),
  parentId: z.number().optional(),
});

type PermissionFormData = z.infer<typeof permissionFormSchema>;

interface PermissionTreeNodeProps {
  permission: PermissionRes;
  children?: PermissionRes[];
  level: number;
  searchTerm: string;
  typeFilter: string;
  onEdit: (permission: PermissionRes) => void;
  onDelete: (permission: PermissionRes) => void;
  onToggleStatus: (permission: PermissionRes) => void;
}

function PermissionTreeNode({ 
  permission, 
  children = [], 
  level, 
  searchTerm,
  typeFilter,
  onEdit,
  onDelete,
  onToggleStatus
}: PermissionTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const { hasPermission } = usePermission();
  
  const isMatch = (perm: PermissionRes) => {
    const matchesSearch = !searchTerm || 
      perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !typeFilter || typeFilter === 'all' || perm.type === typeFilter;
    
    return matchesSearch && matchesType;
  };

  const hasMatchingChildren = (perms: PermissionRes[]): boolean => {
    return perms.some(perm => 
      isMatch(perm) || 
      hasMatchingChildren(perm.children || [])
    );
  };

  const shouldShow = isMatch(permission) || hasMatchingChildren(children);

  if (!shouldShow) return null;

  const getTypeIcon = (type: PermissionTypeValues) => {
    switch (type) {
      case PermissionType.MODULE:
        return '📁';
      case PermissionType.MENU:
        return '📋';
      case PermissionType.BUTTON:
        return '🔘';
      default:
        return '📄';
    }
  };

  const getTypeBadgeColor = (type: PermissionTypeValues) => {
    switch (type) {
      case PermissionType.MODULE:
        return 'default';
      case PermissionType.MENU:
        return 'secondary';
      case PermissionType.BUTTON:
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group ${
          level > 0 ? 'ml-' + (level * 4) : ''
        }`}
        style={{ marginLeft: level * 20 }}
      >
        <div 
          className="flex items-center gap-2 flex-1 cursor-pointer"
          onClick={() => children.length > 0 && setIsExpanded(!isExpanded)}
        >
          {children.length > 0 ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <div className="w-4" />
          )}
          
          <span className="text-lg mr-2">{getTypeIcon(permission.type)}</span>
          
          <div className="flex-1 flex items-center gap-3">
            <span className={`font-medium ${!permission.isActive ? 'text-muted-foreground' : ''}`}>
              {permission.name}
            </span>
            <code className="text-sm bg-muted px-2 py-1 rounded">
              {permission.code}
            </code>
            <Badge variant={getTypeBadgeColor(permission.type)}>
              {permission.type}
            </Badge>
            {!permission.isActive && (
              <Badge variant="destructive" className="text-xs">
                已禁用
              </Badge>
            )}
          </div>

          {permission.path && (
            <span className="text-sm text-muted-foreground">
              {permission.path}
            </span>
          )}
        </div>

        {/* 操作按钮 - 始终显示，但根据权限控制是否可用 */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => hasPermission('system.permission.edit') ? onEdit(permission) : alert('没有编辑权限')}
            className="h-8 w-8 p-0"
            title="编辑权限"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="更多操作">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => hasPermission('system.permission.edit') ? onToggleStatus(permission) : alert('没有编辑权限')}
              >
                {permission.isActive ? (
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
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => hasPermission('system.permission.edit') ? onDelete(permission) : alert('没有删除权限')}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isExpanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <PermissionTreeNode
              key={child.id}
              permission={child}
              children={child.children}
              level={level + 1}
              searchTerm={searchTerm}
              typeFilter={typeFilter}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PermissionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<PermissionRes | null>(null);
  
  const { hasPermission, withPermissionCheck } = usePermission();
  
  // 调试权限信息
  console.log('权限检查结果:', {
    hasEditPermission: hasPermission('system.permission.edit'),
    hasViewPermission: hasPermission('system.permission.view')
  });

  const {
    data: permissions,
    loading,
    error,
    send: refetchPermissions,
  } = useRequest(() => permissionApi.getPermissionTree(), {
    immediate: true,
  });

  // 创建权限请求
  const { loading: creating, send: createPermission } = useRequest(
    (data: CreatePermissionReq) => permissionApi.createPermission(data),
    {
      immediate: false,
    }
  );

  // 更新权限请求
  const { loading: updating, send: updatePermission } = useRequest(
    (id: number, data: Partial<CreatePermissionReq>) => permissionApi.updatePermission(id, data),
    {
      immediate: false,
    }
  );

  // 删除权限请求
  const { loading: deleting, send: deletePermission } = useRequest(
    (id: number) => permissionApi.deletePermission(id),
    {
      immediate: false,
    }
  );

  // 切换状态请求
  const { loading: toggling, send: toggleStatus } = useRequest(
    (id: number, isActive: boolean) => permissionApi.togglePermissionStatus(id, isActive),
    {
      immediate: false,
    }
  );

  // 表单
  const form = useForm<PermissionFormData>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      code: '',
      name: '',
      type: 'button',
      description: '',
      path: '',
      icon: '',
      sort: 0,
    },
  });

  // 后端返回的是构建好的权限树结构（只包含根节点）
  const permissionTree = useMemo(() => {
    if (!permissions?.data) return [];
    return permissions.data;
  }, [permissions?.data]);

  // 获取所有权限的扁平列表（用于父权限选择）
  const flatPermissions = useMemo(() => {
    const flatten = (perms: PermissionRes[]): PermissionRes[] => {
      return perms.reduce((acc, perm) => {
        acc.push(perm);
        if (perm.children && perm.children.length > 0) {
          acc.push(...flatten(perm.children));
        }
        return acc;
      }, [] as PermissionRes[]);
    };
    return flatten(permissionTree);
  }, [permissionTree]);

  const handleCreatePermission = async (data: PermissionFormData) => {
    try {
      await createPermission(data);
      alert('权限创建成功');
      setShowCreateDialog(false);
      form.reset();
      refetchPermissions();
    } catch (error) {
      alert('权限创建失败');
    }
  };

  const handleEditPermission = (permission: PermissionRes) => {
    setSelectedPermission(permission);
    form.reset({
      code: permission.code,
      name: permission.name,
      type: permission.type as any,
      description: permission.description || '',
      path: permission.path || '',
      icon: permission.icon || '',
      sort: permission.sort || 0,
      parentId: permission.parent?.id,
    });
    setShowEditDialog(true);
  };

  const handleUpdatePermission = async (data: PermissionFormData) => {
    if (!selectedPermission) return;
    
    try {
      await updatePermission(selectedPermission.id, data);
      alert('权限更新成功');
      setShowEditDialog(false);
      setSelectedPermission(null);
      form.reset();
      refetchPermissions();
    } catch (error) {
      alert('权限更新失败');
    }
  };

  const handleDeletePermission = (permission: PermissionRes) => {
    setSelectedPermission(permission);
    setShowDeleteDialog(true);
  };

  const confirmDeletePermission = async () => {
    if (!selectedPermission) return;
    
    try {
      await deletePermission(selectedPermission.id);
      alert('权限删除成功');
      setShowDeleteDialog(false);
      setSelectedPermission(null);
      refetchPermissions();
    } catch (error) {
      alert('权限删除失败');
    }
  };

  const handleToggleStatus = async (permission: PermissionRes) => {
    try {
      await toggleStatus(permission.id, !permission.isActive);
      alert(`权限已${permission.isActive ? '禁用' : '启用'}`);
      refetchPermissions();
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
          <p className="text-destructive">加载权限列表失败</p>
          <Button 
            variant="outline" 
            onClick={refetchPermissions}
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
          <h1 className="text-3xl font-bold">权限管理</h1>
          <p className="text-muted-foreground">查看和管理系统权限树结构</p>
        </div>
        <Button 
          onClick={() => hasPermission('system.permission.edit') ? setShowCreateDialog(true) : alert('没有创建权限的权限')} 
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          新增权限
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            权限树
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索权限名称或编码..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="筛选类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value={PermissionType.MODULE}>模块</SelectItem>
                  <SelectItem value={PermissionType.MENU}>菜单</SelectItem>
                  <SelectItem value={PermissionType.BUTTON}>按钮</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(searchTerm || (typeFilter && typeFilter !== 'all')) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                }}
              >
                清除筛选
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {permissionTree.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无权限数据
              </div>
            ) : (
              permissionTree.map((permission) => (
                <PermissionTreeNode
                  key={permission.id}
                  permission={permission}
                  children={permission.children}
                  level={0}
                  searchTerm={searchTerm}
                  typeFilter={typeFilter}
                  onEdit={handleEditPermission}
                  onDelete={handleDeletePermission}
                  onToggleStatus={handleToggleStatus}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 创建权限对话框 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新增权限</DialogTitle>
            <DialogDescription>
              创建新的系统权限
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreatePermission)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>权限编码 *</FormLabel>
                      <FormControl>
                        <Input placeholder="如: system.user.add" {...field} />
                      </FormControl>
                      <FormDescription>
                        权限的唯一标识，建议使用点分层次结构
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>权限名称 *</FormLabel>
                      <FormControl>
                        <Input placeholder="如: 新增用户" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>权限类型 *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择权限类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="module">模块</SelectItem>
                          <SelectItem value="menu">菜单</SelectItem>
                          <SelectItem value="button">按钮</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>父权限</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择父权限（可选）" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">无父权限</SelectItem>
                          {flatPermissions.map((perm) => (
                            <SelectItem key={perm.id} value={perm.id.toString()}>
                              {perm.name} ({perm.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="path"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>路由路径</FormLabel>
                      <FormControl>
                        <Input placeholder="如: /system/user" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>图标</FormLabel>
                      <FormControl>
                        <Input placeholder="如: user" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="sort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>排序值</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      数值越小排序越靠前
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>权限描述</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="权限功能描述..."
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
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

      {/* 编辑权限对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑权限</DialogTitle>
            <DialogDescription>
              修改权限信息
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdatePermission)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>权限编码 *</FormLabel>
                      <FormControl>
                        <Input placeholder="如: system.user.add" {...field} />
                      </FormControl>
                      <FormDescription>
                        权限的唯一标识，建议使用点分层次结构
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>权限名称 *</FormLabel>
                      <FormControl>
                        <Input placeholder="如: 新增用户" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>权限类型 *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择权限类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="module">模块</SelectItem>
                          <SelectItem value="menu">菜单</SelectItem>
                          <SelectItem value="button">按钮</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>父权限</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                        value={field.value ? field.value.toString() : ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择父权限（可选）" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">无父权限</SelectItem>
                          {flatPermissions
                            .filter(perm => perm.id !== selectedPermission?.id)
                            .map((perm) => (
                            <SelectItem key={perm.id} value={perm.id.toString()}>
                              {perm.name} ({perm.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="path"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>路由路径</FormLabel>
                      <FormControl>
                        <Input placeholder="如: /system/user" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>图标</FormLabel>
                      <FormControl>
                        <Input placeholder="如: user" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="sort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>排序值</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      数值越小排序越靠前
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>权限描述</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="权限功能描述..."
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
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
              您确定要删除权限 "{selectedPermission?.name}" 吗？此操作无法撤销。
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
              onClick={confirmDeletePermission}
              disabled={deleting}
            >
              {deleting ? '删除中...' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>权限说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <span className="text-2xl">📁</span>
              <div>
                <div className="font-medium">模块权限</div>
                <div className="text-sm text-muted-foreground">
                  顶层功能模块，如系统管理、内容管理等
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <span className="text-2xl">📋</span>
              <div>
                <div className="font-medium">菜单权限</div>
                <div className="text-sm text-muted-foreground">
                  具体功能页面，如用户管理、角色管理等
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <span className="text-2xl">🔘</span>
              <div>
                <div className="font-medium">按钮权限</div>
                <div className="text-sm text-muted-foreground">
                  具体操作权限，如新增、编辑、删除等
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>
              <strong>权限编码规范：</strong>采用点分层次结构，格式为 
              <code className="mx-1 px-1 py-0.5 bg-muted rounded">模块.功能.操作</code>
            </p>
            <p className="mt-2">
              例如：<code className="mx-1 px-1 py-0.5 bg-muted rounded">system.user.add</code> 
              表示系统管理模块下用户管理功能的新增操作权限
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 