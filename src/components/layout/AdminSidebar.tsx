'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 font-bold text-xl border-b">NRB Europe Admin</div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link href="/admin" className="block p-2 hover:bg-gray-200 rounded transition">
                📊 Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/users" className="block p-2 hover:bg-gray-200 rounded transition">
                👥 Users
              </Link>
            </li>
            <li>
              <Link href="/admin/subscriptions" className="block p-2 hover:bg-gray-200 rounded transition">
                💳 Subscriptions
              </Link>
            </li>
            <li>
              <Link href="/admin/newsletter" className="block p-2 hover:bg-gray-200 rounded transition">
                📧 Newsletter
              </Link>
            </li>
            <li>
              <Link href="/admin/settings" className="block p-2 hover:bg-gray-200 rounded transition">
                ⚙️ Settings
              </Link>
            </li>
            <li className="border-t pt-2 mt-2">
              <Link href="/studio" className="block p-2 hover:bg-gray-200 rounded transition text-blue-600" target="_blank">
                ✏️ Content Studio
              </Link>
            </li>
            <li>
              <button
                onClick={() => signOut()}
                className="block w-full text-left p-2 hover:bg-gray-200 rounded transition text-red-600"
              >
                🚪 Sign Out
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
