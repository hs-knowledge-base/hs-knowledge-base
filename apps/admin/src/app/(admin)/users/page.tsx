'use client';

import { useState } from 'react';
import { useRequest } from 'alova/client';
import { UserRes } from '@/types/auth';

import { userApi } from "@/lib/api/services/users";


export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<UserRes | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAttributeDialogOpen, setIsAttributeDialogOpen] = useState(false);



  const {
    data: users,
    loading,
    error,
    send: refetchUsers,
  } = useRequest(() => userApi.getAllUsers(), {
    immediate: true,
  });

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

  const handleEdit = (user: UserRes) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleEditAttributes = (user: UserRes) => {
    setSelectedUser(user);
    setIsAttributeDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsAttributeDialogOpen(false);
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

      </div>

    </div>
  );
}
