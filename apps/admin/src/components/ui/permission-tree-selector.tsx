import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PermissionTree } from '@/components/ui/permission-tree';
import { PermissionRes } from '@/types/auth';

interface PermissionTreeSelectorProps {
  permissions: PermissionRes[];
  selectedIds: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  isLoading?: boolean;
}

export function PermissionTreeSelector({
  permissions,
  selectedIds,
  onSelectionChange,
  isLoading = false,
}: PermissionTreeSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return (
      <div className="text-center py-4 text-sm text-muted-foreground">
        加载权限中...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索权限名称或编码..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>
      
      <PermissionTree
        permissions={permissions}
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        searchTerm={searchTerm}
      />
      
      {selectedIds.length > 0 && (
        <div className="text-sm text-muted-foreground">
          已选择 {selectedIds.length} 个权限
        </div>
      )}
    </div>
  );
} 