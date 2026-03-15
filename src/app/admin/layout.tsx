import AdminSidebar from '@/components/layout/AdminSidebar'
import ThemeProvider from '@/components/ui/ThemeProvider'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Admin Panel | NRB Europe',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/admin-login')
  }

  if (session.user.role !== 'admin') {
    redirect('/login?error=admin_required')
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
          <div className="mx-auto max-w-[1400px] px-4 py-3">
            <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">NRB Europe Admin</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Restricted workspace - administrators only</p>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[1400px] py-2">
          <AdminSidebar>
            {children}
          </AdminSidebar>
        </div>
      </div>
    </ThemeProvider>
  )
}
