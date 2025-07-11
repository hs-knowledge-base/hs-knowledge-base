import { AdminLayout } from '@/components/layout/admin-layout'

export default function PermissionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayout>{children}</AdminLayout>
}
