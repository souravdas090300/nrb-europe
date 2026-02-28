import RequireAdmin from '@/components/auth/RequireAdmin'
import AdminSidebar from '@/components/layout/AdminSidebar'

export const metadata = {
  title: 'Admin Panel',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireAdmin>
      <AdminSidebar>
        {children}
      </AdminSidebar>
    </RequireAdmin>
  )
}
