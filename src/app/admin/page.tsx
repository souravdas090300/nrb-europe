'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import TopArticles from '@/components/Analytics/TopArticles'

const UserGrowthChart = dynamic(
  () => import('@/components/Analytics/UserGrowthChart'),
  { ssr: false }
)
const RevenueChart = dynamic(
  () => import('@/components/Analytics/RevenueChart'),
  { ssr: false }
)

interface Analytics {
  userGrowth: Array<{ date: string; count: number }>
  revenue: Array<{ month: string; revenue: number }>
  totalUsers: number
  activeSubscriptions: number
  totalRevenue: number
  newsletterSubs: number
}

export default function Dashboard() {
  const { data: session } = useSession()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/admin/analytics')
        if (res.ok) {
          const data = await res.json()
          setAnalytics(data)
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back, {session?.user?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Users</p>
              <p className="text-3xl font-bold dark:text-white">{analytics?.totalUsers ?? 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Active Subscriptions</p>
              <p className="text-3xl font-bold dark:text-white">{analytics?.activeSubscriptions ?? 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-2xl">💳</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Revenue (6m)</p>
              <p className="text-3xl font-bold dark:text-white">${analytics?.totalRevenue ?? 0}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Newsletter Subs</p>
              <p className="text-3xl font-bold dark:text-white">{analytics?.newsletterSubs ?? 0}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <span className="text-2xl">📧</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {!loading && analytics && (
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <UserGrowthChart data={analytics.userGrowth} />
          <RevenueChart data={analytics.revenue} />
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center h-40 mb-8">
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      )}
    </>
  )
}
