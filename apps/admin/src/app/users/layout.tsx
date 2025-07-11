import { AdminLayout } from '@/components/layout/admin-layout'

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayout>{children}</AdminLayout>
}
