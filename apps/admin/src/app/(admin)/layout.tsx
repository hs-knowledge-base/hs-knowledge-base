import { AuthGuard } from '@/components/auth/auth-guard';
import { AdminLayout } from '@/components/layout/admin-layout';

export default function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AdminLayout>{children}</AdminLayout>
    </AuthGuard>
  );
}
