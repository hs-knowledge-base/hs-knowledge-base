import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { PermissionRes, PermissionType, PermissionTypeValues } from '@/types/auth';

interface PermissionTreeProps {
  permissions: PermissionRes[];
  selectedIds: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  searchTerm?: string;
}

interface PermissionTreeNodeProps {
  permission: PermissionRes;
  children?: PermissionRes[];
  level: number;
  selectedIds: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  searchTerm?: string;
}

function PermissionTreeNode({
  permission,
  children = [],
  level,
  selectedIds,
  onSelectionChange,
  searchTerm = '',
}: PermissionTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);

  const isMatch = (perm: PermissionRes) => {
    if (!searchTerm) return true;
    return (
      perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
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

  // 检查当前节点和所有子节点的选中状态
  const getAllChildIds = (perms: PermissionRes[]): number[] => {
    const ids: number[] = [];
    perms.forEach(perm => {
      ids.push(perm.id);
      if (perm.children && perm.children.length > 0) {
        ids.push(...getAllChildIds(perm.children));
      }
    });
    return ids;
  };

  const allChildIds = getAllChildIds(children);
  const allIds = [permission.id, ...allChildIds];
  
  const selectedCount = allIds.filter(id => selectedIds.includes(id)).length;
  const isChecked = selectedIds.includes(permission.id);
  const isIndeterminate = !isChecked && selectedCount > 0;
  const isFullySelected = selectedCount === allIds.length;

  const handleCheck = (checked: boolean) => {
    let newSelectedIds = [...selectedIds];
    
    if (checked) {
      // 选中当前节点和所有子节点
      allIds.forEach(id => {
        if (!newSelectedIds.includes(id)) {
          newSelectedIds.push(id);
        }
      });
    } else {
      // 取消选中当前节点和所有子节点
      newSelectedIds = newSelectedIds.filter(id => !allIds.includes(id));
    }
    
    onSelectionChange(newSelectedIds);
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/50 transition-colors ${
          level > 0 ? 'ml-' + (level * 4) : ''
        }`}
        style={{ marginLeft: level * 20 }}
      >
        <div className="flex items-center gap-2 flex-1">
          {children.length > 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="flex items-center justify-center w-4 h-4 hover:bg-muted rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}

          <Checkbox
            id={`permission-${permission.id}`}
            checked={isFullySelected}
            onCheckedChange={handleCheck}
            className={isIndeterminate ? 'data-[state=checked]:bg-primary/50' : ''}
          />

          <span className="text-sm mr-2">{getTypeIcon(permission.type)}</span>
          
          <label
            htmlFor={`permission-${permission.id}`}
            className="flex-1 flex items-center gap-2 cursor-pointer text-sm"
          >
            <span className={`font-medium ${!permission.isActive ? 'text-muted-foreground line-through' : ''}`}>
              {permission.name}
            </span>
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              {permission.code}
            </code>
            {!permission.isActive && (
              <span className="text-xs text-destructive">(已禁用)</span>
            )}
          </label>
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
              selectedIds={selectedIds}
              onSelectionChange={onSelectionChange}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function PermissionTree({
  permissions,
  selectedIds,
  onSelectionChange,
  searchTerm = '',
}: PermissionTreeProps) {
  if (permissions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        暂无权限数据
      </div>
    );
  }

  return (
    <div className="space-y-1 max-h-80 overflow-y-auto border rounded-md p-2">
      {permissions.map((permission) => (
        <PermissionTreeNode
          key={permission.id}
          permission={permission}
          children={permission.children}
          level={0}
          selectedIds={selectedIds}
          onSelectionChange={onSelectionChange}
          searchTerm={searchTerm}
        />
      ))}
    </div>
  );
} 