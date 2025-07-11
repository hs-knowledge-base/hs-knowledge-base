'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRequest } from 'alova/client';
import { Permission, CreatePermissionDto, Action, Subject } from '@/types/auth';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {permissionApi} from "@/lib/api/services";

const permissionSchema = z.object({
  action: z.nativeEnum(Action),
  subject: z.nativeEnum(Subject),
  conditions: z.string().optional(),
  fields: z.string().optional(),
  inverted: z.boolean(),
  reason: z.string().optional(),
});

type PermissionFormData = z.infer<typeof permissionSchema>;

interface PermissionFormProps {
  permission?: Permission;
  onSuccess?: () => void;
}

export function PermissionForm({ permission, onSuccess }: PermissionFormProps) {
  const isEdit = !!permission;

  const form = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      action: permission?.action || Action.READ,
      subject: permission?.subject || Subject.USER,
      conditions: permission?.conditions ? JSON.stringify(permission.conditions, null, 2) : '',
      fields: permission?.fields || '',
      inverted: permission?.inverted ?? false,
      reason: permission?.reason || '',
    },
  });

  const { send: createPermission, loading: creating } = useRequest(
    (data: CreatePermissionDto) => permissionApi.createPermission(data),
    { immediate: false }
  );

  const { send: updatePermission, loading: updating } = useRequest(
    (id: string, data: Partial<CreatePermissionDto>) => permissionApi.updatePermission(id, data),
    { immediate: false }
  );

  const onSubmit = async (data: PermissionFormData) => {
    try {
      const { conditions, ...permissionData } = data;
      
      const submitData: CreatePermissionDto | Partial<CreatePermissionDto> = {
        ...permissionData,
        ...(conditions && { conditions: JSON.parse(conditions) }),
      };

      if (isEdit) {
        await updatePermission(permission.id, submitData);
      } else {
        await createPermission(submitData as CreatePermissionDto);
      }

      onSuccess?.();
    } catch (error) {
      console.error('保存权限失败:', error);
    }
  };

  const loading = creating || updating;

  const actionOptions = [
    { value: Action.CREATE, label: '创建' },
    { value: Action.READ, label: '读取' },
    { value: Action.UPDATE, label: '更新' },
    { value: Action.DELETE, label: '删除' },
    { value: Action.MANAGE, label: '管理' },
  ];

  const subjectOptions = [
    { value: Subject.USER, label: '用户' },
    { value: Subject.ROLE, label: '角色' },
    { value: Subject.PERMISSION, label: '权限' },
    { value: Subject.DOCUMENT, label: '文档' },
    { value: Subject.KNOWLEDGE_BASE, label: '知识库' },
    { value: Subject.ALL, label: '全部' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="action"
            render={({ field }) => (
              <FormItem>
                <FormLabel>操作类型</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择操作类型" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {actionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>资源类型</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择资源类型" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subjectOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="conditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>条件限制 (JSON)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder='{"department": "IT", "level": {"$gte": 3}}'
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fields"
          render={({ field }) => (
            <FormItem>
              <FormLabel>字段限制</FormLabel>
              <FormControl>
                <Input {...field} placeholder="name,email,department" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inverted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>禁止权限</FormLabel>
                <div className="text-sm text-muted-foreground">
                  开启后表示这是一个禁止权限
                </div>
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
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>权限说明</FormLabel>
              <FormControl>
                <Input {...field} placeholder="描述这个权限的用途" />
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
