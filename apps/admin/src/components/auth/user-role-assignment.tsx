'use client';

import { useState, useEffect } from 'react';
import { useRequest } from 'alova/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Role } from '@/types/auth';
import {roleApi, userApi} from "@/lib/api/services";

interface UserRoleAssignmentProps {
  user: User;
  onSuccess?: () => void;
}

export function UserRoleAssignment({ user, onSuccess }: UserRoleAssignmentProps) {
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(
    user.roles?.map(role => role.id) || []
  );

  const {
    data: roles,
    loading: rolesLoading,
    error: rolesError,
  } = useRequest(roleApi.getAll()) as {
    data: Role[] | undefined;
    loading: boolean;
    error: any;
  };

  const {
    loading: updating,
    send: updateUserRoles,
  } = useRequest(
    (roleIds: string[]) => userApi.updateRoles(user.id, roleIds),
    { immediate: false }
  );

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoleIds(prev => [...prev, roleId]);
    } else {
      setSelectedRoleIds(prev => prev.filter(id => id !== roleId));
    }
  };

  const handleSubmit = async () => {
    try {
      await updateUserRoles(selectedRoleIds);
      onSuccess?.();
    } catch (error) {
      console.error('更新用户角色失败:', error);
    }
  };

  if (rolesLoading) {
    return <div className="p-4">加载角色列表...</div>;
  }

  if (rolesError) {
    return <div className="p-4 text-red-500">加载角色失败: {rolesError.message}</div>;
  }

  return (
    <div className="space-y-6">
      {/* 用户信息 */}
      <div>
        <h3 className="text-lg font-medium">为用户分配角色</h3>
        <p className="text-sm text-muted-foreground">
          用户: {user.username} ({user.email})
        </p>
      </div>

      <Separator />

      {/* 当前角色 */}
      <div>
        <Label className="text-sm font-medium">当前角色</Label>
        <div className="mt-2 flex gap-2 flex-wrap">
          {user.roles && user.roles.length > 0 ? (
            user.roles.map(role => (
              <Badge key={role.id} variant="default">
                {role.name}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">暂无角色</span>
          )}
        </div>
      </div>

      <Separator />

      {/* 角色选择 */}
      <div>
        <Label className="text-sm font-medium">选择角色</Label>
        <div className="mt-3 space-y-3">
          {roles && Array.isArray(roles) ? roles.map((role: Role) => (
            <div key={role.id} className="flex items-start space-x-3">
              <Checkbox
                id={`role-${role.id}`}
                checked={selectedRoleIds.includes(role.id)}
                onCheckedChange={(checked) => 
                  handleRoleToggle(role.id, checked as boolean)
                }
              />
              <div className="flex-1">
                <Label 
                  htmlFor={`role-${role.id}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {role.name}
                </Label>
                {role.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {role.description}
                  </p>
                )}
                {role.permissions && role.permissions.length > 0 && (
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {role.permissions.map(permission => (
                      <Badge key={permission.id} variant="outline" className="text-xs">
                        {permission.action}:{permission.subject}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="text-sm text-muted-foreground">暂无可用角色</div>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          onClick={handleSubmit}
          disabled={updating}
        >
          {updating ? '保存中...' : '保存'}
        </Button>
      </div>
    </div>
  );
}
