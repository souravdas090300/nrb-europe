'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type ProfileData = {
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

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  // Profile edit state
  const [name, setName] = useState('')
  const [newsletter, setNewsletter] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPw, setChangingPw] = useState(false)
  const [pwMsg, setPwMsg] = useState('')
  const [pwError, setPwError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, router])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setName(data.name || '')
        setNewsletter(data.newsletterSubscribed)
      }
    } catch {
      console.error('Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setProfileMsg('')

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, newsletterSubscribed: newsletter }),
      })

      if (res.ok) {
        setProfileMsg('Profile updated successfully!')
        const data = await res.json()
        setProfile((prev) => prev ? { ...prev, ...data } : prev)
      } else {
        setProfileMsg('Failed to update profile')
      }
    } catch {
      setProfileMsg('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwMsg('')
    setPwError('')

    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setPwError('Password must be at least 6 characters')
      return
    }

    setChangingPw(true)

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json()

      if (res.ok) {
        setPwMsg(data.message)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        // Refresh profile to update hasPassword
        fetchProfile()
      } else {
        setPwError(data.error)
      }
    } catch {
      setPwError('An error occurred')
    } finally {
      setChangingPw(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!session || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <div className="flex gap-3">
            <Link
              href="/"
              className="text-sm text-blue-600 hover:underline"
            >
              Home
            </Link>
            {['admin', 'editor'].includes(profile.role) && (
              <Link
                href="/admin"
                className="text-sm text-blue-600 hover:underline"
              >
                Dashboard
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-sm text-red-600 hover:underline"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Account Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h2>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {profile.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.image} alt={profile.name || ''} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                (profile.name || profile.email).charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{profile.name || 'No name set'}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{profile.email}</p>
              <div className="flex gap-2 mt-1">
                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                  {profile.role}
                </span>
                {profile.emailVerified && (
                  <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Verified
                  </span>
                )}
                {profile.providers.map((p) => (
                  <span key={p} className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 capitalize">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Edit Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Profile</h2>

          {profileMsg && (
            <div className={`px-4 py-3 rounded mb-4 text-sm ${profileMsg.includes('success') ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`}>
              {profileMsg}
            </div>
          )}

          <form onSubmit={handleProfileUpdate}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email-readonly" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Email Address
              </label>
              <input
                id="email-readonly"
                type="email"
                value={profile.email}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300 text-gray-500 cursor-not-allowed"
                disabled
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div className="mb-4 flex items-center gap-3">
              <input
                id="newsletter"
                type="checkbox"
                checked={newsletter}
                onChange={(e) => setNewsletter(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="newsletter" className="text-gray-700 dark:text-gray-300 text-sm">
                Subscribe to newsletter
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {profile.hasPassword ? 'Change Password' : 'Set Password'}
          </h2>

          {!profile.hasPassword && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You signed up with {profile.providers.join(', ')}. Set a password to also sign in with email and password.
            </p>
          )}

          {pwMsg && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
              {pwMsg}
            </div>
          )}

          {pwError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {pwError}
            </div>
          )}

          <form onSubmit={handlePasswordChange}>
            {profile.hasPassword && (
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="confirmNewPassword" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmNewPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={changingPw}
              className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {changingPw ? 'Changing...' : profile.hasPassword ? 'Change Password' : 'Set Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
