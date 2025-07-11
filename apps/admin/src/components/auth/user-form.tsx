'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRequest } from 'alova/client';
import { userApi, roleApi } from '@/lib/api';
import { User, CreateUserDto } from '@/types/auth';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const userSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位').optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  isActive: z.boolean().default(true),
  attributes: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: User;
  onSuccess?: () => void;
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const isEdit = !!user;

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      password: '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      isActive: user?.isActive ?? true,
      attributes: user?.attributes ? JSON.stringify(user.attributes, null, 2) : '',
    },
  });

  const { send: createUser, loading: creating } = useRequest(
    (data: CreateUserDto) => userApi.createUser(data),
    { immediate: false }
  );

  const { send: updateUser, loading: updating } = useRequest(
    (id: string, data: Partial<CreateUserDto>) => userApi.updateUser(id, data),
    { immediate: false }
  );

  const onSubmit = async (data: UserFormData) => {
    try {
      const { attributes, password, ...userData } = data;
      
      const submitData: CreateUserDto | Partial<CreateUserDto> = {
        ...userData,
        ...(password && { password }),
        ...(attributes && { attributes: JSON.parse(attributes) }),
      };

      if (isEdit) {
        await updateUser(user.id, submitData);
      } else {
        await createUser(submitData as CreateUserDto);
      }

      onSuccess?.();
    } catch (error) {
      console.error('保存用户失败:', error);
    }
  };

  const loading = creating || updating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>用户名</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isEdit} />
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
                <FormLabel>邮箱</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isEdit ? '新密码（留空不修改）' : '密码'}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>名字</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>姓氏</FormLabel>
                <FormControl>
                  <Input {...field} />
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
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>激活状态</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="attributes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>用户属性 (JSON)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder='{"level": 3, "clearance": "high"}'
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? '保存中...' : isEdit ? '更新' : '创建'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
