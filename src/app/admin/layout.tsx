import RequireAdmin from '@/components/auth/RequireAdmin'
import AdminSidebar from '@/components/layout/AdminSidebar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ThemeProvider from '@/components/ui/ThemeProvider'
import BreakingNewsTicker from '@/components/layout/BreakingNewsTicker'
import { getDictionary } from '@/lib/get-dictionary'

export const metadata = {
  title: 'Admin Panel | NRB Europe',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const dictionary = await getDictionary('en')

  return (
    <RequireAdmin>
      <ThemeProvider>
        <BreakingNewsTicker />
        <Header lang="en" dictionary={dictionary} />
        <div className="flex flex-col min-h-screen pt-[80px]">
          <div className="flex-1 bg-gray-50 dark:bg-gray-900">
            <AdminSidebar>
              {children}
            </AdminSidebar>
          </div>
          <Footer lang="en" dictionary={dictionary} />
        </div>
      </ThemeProvider>
    </RequireAdmin>
  )
}
