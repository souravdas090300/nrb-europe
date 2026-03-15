'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'
import NrbLogo from '@/components/ui/NrbLogo'

function getPasswordStrength(pw: string): { score: number; label: string; color: string; checks: { hasLength: boolean; hasUpper: boolean; hasLower: boolean; hasNumber: boolean; hasSpecial: boolean } } {
  const checks = {
    hasLength: pw.length >= 8,
    hasUpper: /[A-Z]/.test(pw),
    hasLower: /[a-z]/.test(pw),
    hasNumber: /[0-9]/.test(pw),
    hasSpecial: /[^A-Za-z0-9]/.test(pw),
  }
  const passed = Object.values(checks).filter(Boolean).length
  if (passed <= 1) return { score: 1, label: 'Very Weak', color: 'bg-red-500', checks }
  if (passed === 2) return { score: 2, label: 'Weak', color: 'bg-orange-500', checks }
  if (passed === 3) return { score: 3, label: 'Fair', color: 'bg-yellow-500', checks }
  if (passed === 4) return { score: 4, label: 'Strong', color: 'bg-green-500', checks }
  return { score: 5, label: 'Very Strong', color: 'bg-green-600', checks }
}

export default function AdminRegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [adminSetupCode, setAdminSetupCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0)
  const router = useRouter()

  const strength = useMemo(() => getPasswordStrength(password), [password])
  const meetsRequirements = strength.checks.hasLength && strength.checks.hasUpper && strength.checks.hasLower && strength.checks.hasNumber

  const postRegisterWithRetry = async (payload: { name: string; email: string; password: string; adminSetupCode: string }) => {
    const maxAttempts = 3
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.status !== 503 || attempt === maxAttempts) {
        return res
      }

      await new Promise((resolve) => setTimeout(resolve, 400 * attempt))
    }

    throw new Error('Admin registration retry failed')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const trimmedName = name.trim()
    const sanitizedEmail = email.trim().toLowerCase()

    if (trimmedName.length < 1 || trimmedName.length > 100) {
      setError('Name must be between 1 and 100 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!meetsRequirements) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, and a number')
      return
    }

    if (!adminSetupCode.trim()) {
      setError('Owner setup code is required')
      return
    }

    setLoading(true)

    try {
      const res = await Sentry.startSpan(
        { op: 'http.client', name: 'POST /api/admin/register' },
        async () => postRegisterWithRetry({
          name: trimmedName,
          email: sanitizedEmail,
          password,
          adminSetupCode,
        })
      )

      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('Retry-After') || '60', 10)
        setRateLimited(true)
        setRateLimitSeconds(retryAfter)
        setError('Too many registration attempts. Please try again later.')
        const interval = setInterval(() => {
          setRateLimitSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(interval)
              setRateLimited(false)
              return 0
            }
            return prev - 1
          })
        }, 1000)
        return
      }

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create admin account')
      } else {
        setSuccess(data.message || 'Admin account created successfully.')
        setTimeout(() => {
          router.push('/admin-login?registered=true')
        }, 2000)
      }
    } catch (err) {
      Sentry.captureException(err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="mb-6">
        <Link href="/">
          <NrbLogo height={48} className="dark:invert" />
        </Link>
      </div>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Create Admin Account
        </h1>

        <div className="bg-amber-100 border border-amber-400 text-amber-800 px-4 py-3 rounded mb-4 text-sm">
          This page is restricted to owner-controlled admin account setup.
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">{error}</div>
        )}
        {rateLimited && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4 text-sm">
            Rate limited. Try again in {Math.ceil(rateLimitSeconds / 60)} min {rateLimitSeconds % 60}s
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">{success}</div>
        )}

        <form onSubmit={handleSubmit} autoComplete="on">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Full Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={100} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required disabled={rateLimited} />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Email Address</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" spellCheck={false} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required disabled={rateLimited} />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" maxLength={128} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required disabled={rateLimited} />
            {password.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div key={level} className={`h-1.5 flex-1 rounded-full transition-colors ${level <= strength.score ? strength.color : 'bg-gray-200 dark:bg-gray-600'}`} />
                  ))}
                </div>
                <p className={`text-xs ${strength.score <= 2 ? 'text-red-600' : strength.score === 3 ? 'text-yellow-600' : 'text-green-600'}`}>{strength.label}</p>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Confirm Password</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required disabled={rateLimited} />
          </div>

          <div className="mb-6">
            <label htmlFor="adminSetupCode" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Owner Setup Code</label>
            <input id="adminSetupCode" type="password" value={adminSetupCode} onChange={(e) => setAdminSetupCode(e.target.value)} autoComplete="off" className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required disabled={rateLimited} />
          </div>

          <button type="submit" disabled={loading || rateLimited || !meetsRequirements} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? 'Creating Account...' : 'Create Admin Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          Already have an admin account? <Link href="/admin-login" className="text-blue-600 hover:underline font-semibold">Sign In</Link>
        </p>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
          <Link href="/" className="text-blue-600 hover:underline">Back to Home</Link>
        </p>
      </div>
    </div>
  )
}