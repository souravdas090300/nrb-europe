'use client'

import { useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'

type AdminProfileData = {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  emailVerified: string | null
  newsletterSubscribed: boolean
  createdAt: string
  hasPassword: boolean
  providers: string[]
}

export default function AdminProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<AdminProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [newsletter, setNewsletter] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/admin/profile', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        setProfile(data)
        setName(data.name || '')
        setNewsletter(data.newsletterSubscribed)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, newsletterSubscribed: newsletter }),
      })

      if (!res.ok) {
        setMessage('Failed to update admin profile')
        return
      }

      const data = await res.json()
      setProfile((current) => (current ? { ...current, ...data } : current))
      setMessage('Admin profile updated successfully')
    } catch {
      setMessage('Failed to update admin profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-gray-500 dark:text-gray-400">Loading admin profile...</p>
      </div>
    )
  }

  if (!profile || session?.user?.role !== 'admin') {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold dark:text-white">Admin Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Separate account surface for administrator access and settings.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white text-2xl font-bold">
            {profile.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.image} alt={profile.name || profile.email} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              (profile.name || profile.email).charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{profile.name || 'No name set'}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{profile.email}</p>
            <div className="flex gap-2 mt-1 flex-wrap">
              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 capitalize">
                {profile.role}
              </span>
              {profile.emailVerified && (
                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Verified
                </span>
              )}
              {profile.providers.map((provider) => (
                <span key={provider} className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 capitalize">
                  {provider}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Admin member since {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Admin Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <label className="flex items-center gap-2 text-sm dark:text-gray-300">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
            />
            Receive newsletter emails on admin account
          </label>
          {message && (
            <p className={`text-sm ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/admin-login' })}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
            >
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}