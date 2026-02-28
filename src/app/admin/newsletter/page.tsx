'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface Subscriber {
  id: string
  email: string
  name: string | null
  status: string
  createdAt: string
}

interface Stats {
  total: number
  active: number
  unsubscribed: number
}

export default function NewsletterAdmin() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/admin/newsletter/subscribers')
      if (res.ok) {
        const data = await res.json()
        setSubscribers(data.subscribers)
        setStats(data.stats)
      }
    } catch {
      toast.error('Failed to load subscribers')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject || !content) return

    const confirmed = window.confirm(
      `Send newsletter to ${stats?.active || 0} active subscribers?`
    )
    if (!confirmed) return

    setSending(true)
    try {
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">NRB Europe</h1>
            ${content.split('\n').map((p) => `<p>${p}</p>`).join('')}
          </div>`,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(data.message)
        setSubject('')
        setContent('')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to send')
      }
    } catch {
      toast.error('Failed to send newsletter')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Newsletter Management</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Total Subscribers</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Unsubscribed</p>
            <p className="text-2xl font-bold text-red-600">{stats.unsubscribed}</p>
          </div>
        </div>
      )}

      {/* Send Newsletter */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Send Newsletter</h2>
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Newsletter subject line"
              required
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content (plain text, each line becomes a paragraph)
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Write your newsletter content..."
              required
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            {sending ? 'Sending...' : `Send to ${stats?.active || 0} subscribers`}
          </button>
        </form>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-bold p-6 pb-4">Subscribers</h2>
        {loading ? (
          <p className="p-6 text-gray-500">Loading...</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscribers.map((sub) => (
                <tr key={sub.id}>
                  <td className="px-6 py-4 text-sm">{sub.email}</td>
                  <td className="px-6 py-4 text-sm">{sub.name || '-'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sub.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
