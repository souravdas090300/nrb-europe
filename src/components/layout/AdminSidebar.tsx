'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/profile', label: 'Profile', icon: '👤' },
  { href: '/admin/categories', label: 'Categories', icon: '📁' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: '💳' },
  { href: '/admin/newsletter', label: 'Newsletter', icon: '📧' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  { href: '/admin/studio', label: 'Content Studio', icon: '✏️' },
]

export default function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      {/* Admin navigation bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 overflow-x-auto">
        <nav className="flex items-center gap-1 p-2">
          {adminNav.map((item) => {
            const isActive = item.href === '/admin'
              ? pathname === '/admin' || pathname === '/admin/'
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            )
          })}
          <div className="flex-1" />
          <button
            onClick={() => signOut({ callbackUrl: '/admin-login' })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 whitespace-nowrap transition-colors"
          >
            🚪 <span className="hidden sm:inline">Sign Out</span>
          </button>
        </nav>
      </div>

      {/* Page content */}
      {children}
    </div>
  )
}
