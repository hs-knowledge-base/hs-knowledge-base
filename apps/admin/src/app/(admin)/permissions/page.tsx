'use client';

import { useState, useMemo } from 'react';
import { useRequest } from 'alova/client';
import { ChevronRight, ChevronDown, Shield, Filter, Search } from 'lucide-react';

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

import { PermissionRes, PermissionType } from '@/types/auth';
import { permissionApi } from '@/lib/api/services/permissions';
import { useRbac } from '@/hooks/use-rbac';

interface PermissionTreeNodeProps {
  permission: PermissionRes;
  children?: PermissionRes[];
  level: number;
  searchTerm: string;
  typeFilter: string;
}

function PermissionTreeNode({ 
  permission, 
  children = [], 
  level, 
  searchTerm,
  typeFilter 
}: PermissionTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  
  const isMatch = (perm: PermissionRes) => {
    const matchesSearch = !searchTerm || 
      perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !typeFilter || perm.type === typeFilter;
    
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

  const getTypeIcon = (type: PermissionType) => {
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

  const getTypeBadgeColor = (type: PermissionType) => {
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
        className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
          level > 0 ? 'ml-' + (level * 4) : ''
        }`}
        onClick={() => children.length > 0 && setIsExpanded(!isExpanded)}
        style={{ marginLeft: level * 20 }}
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
          <span className="font-medium">{permission.name}</span>
          <code className="text-sm bg-muted px-2 py-1 rounded">
            {permission.code}
          </code>
          <Badge variant={getTypeBadgeColor(permission.type)}>
            {permission.type}
          </Badge>
        </div>

        {permission.path && (
          <span className="text-sm text-muted-foreground">
            {permission.path}
          </span>
        )}
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
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PermissionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const { hasPermission } = useRbac();

  const {
    data: permissions,
    loading,
    error,
    send: refetchPermissions,
  } = useRequest(() => permissionApi.getPermissionTree(), {
    immediate: true,
  });

  // 构建权限树
  const permissionTree = useMemo(() => {
    if (!permissions?.data) return [];
    
    // 构建树形结构
    const buildTree = (perms: PermissionRes[], parentId: string | null = null): PermissionRes[] => {
      return perms
        .filter(p => p.parentId === parentId)
        .map(p => ({
          ...p,
          children: buildTree(perms, p.id)
        }))
        .sort((a, b) => (a.sort || 0) - (b.sort || 0));
    };

    return buildTree(permissions.data);
  }, [permissions?.data]);

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
                  <SelectItem value="">全部类型</SelectItem>
                  <SelectItem value={PermissionType.MODULE}>模块</SelectItem>
                  <SelectItem value={PermissionType.MENU}>菜单</SelectItem>
                  <SelectItem value={PermissionType.BUTTON}>按钮</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(searchTerm || typeFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('');
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
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

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