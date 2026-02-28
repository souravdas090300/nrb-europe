'use client'

import { useEffect, useState } from 'react'

interface Subscription {
  id: string
  user: {
    email: string
    name: string | null
  }
  plan: string
  status: string
  currentPeriodEnd: string
  createdAt: string
}

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/subscriptions')
      .then((res) => res.json())
      .then((data) => {
        setSubscriptions(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'canceled':
        return 'bg-red-100 text-red-800'
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading subscriptions...</div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Subscription Management</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total Active</p>
          <p className="text-2xl font-bold">
            {subscriptions.filter((s) => s.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Monthly Revenue</p>
          <p className="text-2xl font-bold">
            $
            {subscriptions
              .filter((s) => s.status === 'active')
              .reduce((acc, s) => acc + (s.plan === 'monthly' ? 10 : 100), 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Canceled</p>
          <p className="text-2xl font-bold">
            {subscriptions.filter((s) => s.status === 'canceled').length}
          </p>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-left">Plan</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Renewal Date</th>
              <th className="p-4 text-left">Started</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="border-t hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium">{sub.user.name || '—'}</div>
                  <div className="text-sm text-gray-500">{sub.user.email}</div>
                </td>
                <td className="p-4 capitalize">{sub.plan}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}
                  >
                    {sub.status}
                  </span>
                </td>
                <td className="p-4">{new Date(sub.currentPeriodEnd).toLocaleDateString()}</td>
                <td className="p-4">{new Date(sub.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">View</button>
                  <button className="text-red-600 hover:text-red-800">Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
