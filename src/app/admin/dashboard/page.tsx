'use client'

import { useState, useEffect } from 'react'

interface DashboardStats {
  totalViews: number
  viewsGrowth: number
  articlesPublished: number
  avgArticlesPerDay: number
  newsletterSubs: number
  subsGrowth: number
  revenue: number
  revenueGrowth: number
  topArticles: Array<{ title: string; views: number }>
  topCountries: Array<{ name: string; flag: string; percentage: number }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [timeRange])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/stats?range=${timeRange}`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor your site's performance and growth</p>
        
        <div className="flex gap-2 mt-4">
          {['1d', '7d', '30d', '90d'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                timeRange === range
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border'
              }`}
            >
              {range === '1d' ? 'Today' : range === '7d' ? 'Week' : range === '30d' ? 'Month' : 'Quarter'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
            <span className="text-2xl">👁️</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
          <p className="text-sm text-green-600 mt-2 flex items-center">
            <span className="mr-1">↑</span> {stats.viewsGrowth}% from previous period
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Articles Published</h3>
            <span className="text-2xl">📝</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.articlesPublished}</p>
          <p className="text-sm text-gray-600 mt-2">Avg. {stats.avgArticlesPerDay}/day</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Newsletter Subscribers</h3>
            <span className="text-2xl">📧</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.newsletterSubs.toLocaleString()}</p>
          <p className="text-sm text-green-600 mt-2 flex items-center">
            <span className="mr-1">↑</span> {stats.subsGrowth} new today
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">${stats.revenue.toLocaleString()}</p>
          <p className="text-sm text-green-600 mt-2 flex items-center">
            <span className="mr-1">↑</span> {stats.revenueGrowth}% growth
          </p>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-bold mb-4 text-gray-900">Top Articles</h3>
          <div className="space-y-3">
            {stats.topArticles.map((article, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center flex-1">
                  <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-sm font-semibold mr-3">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700 line-clamp-1">{article.title}</span>
                </div>
                <span className="ml-4 font-semibold text-gray-900">{article.views.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-bold mb-4 text-gray-900">Top Countries</h3>
          <div className="space-y-3">
            {stats.topCountries.map((country, index) => (
              <div key={index} className="flex items-center">
                <span className="text-2xl mr-3">{country.flag}</span>
                <span className="flex-1 text-sm text-gray-700">{country.name}</span>
                <div className="flex items-center">
                  <div className="w-24 h-2 bg-gray-200 rounded-full mr-3 overflow-hidden">
                    <div 
                      className="h-full bg-red-600 rounded-full"
                      style={{ width: `${country.percentage}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-gray-900 w-12 text-right">{country.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-bold mb-4 text-gray-900">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button className="px-4 py-3 border rounded-lg hover:bg-gray-50 text-left">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold">Export Report</div>
            <div className="text-sm text-gray-600">Download analytics data</div>
          </button>
          <button className="px-4 py-3 border rounded-lg hover:bg-gray-50 text-left">
            <div className="text-2xl mb-2">📝</div>
            <div className="font-semibold">New Article</div>
            <div className="text-sm text-gray-600">Create content in CMS</div>
          </button>
          <button className="px-4 py-3 border rounded-lg hover:bg-gray-50 text-left">
            <div className="text-2xl mb-2">⚙️</div>
            <div className="font-semibold">Settings</div>
            <div className="text-sm text-gray-600">Configure site options</div>
          </button>
        </div>
      </div>
    </div>
  )
}
