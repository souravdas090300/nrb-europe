'use client'

import { useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
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

function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const oauthError = searchParams.get('error')

  const strength = useMemo(() => getPasswordStrength(password), [password])
  const meetsRequirements = strength.checks.hasLength && strength.checks.hasUpper && strength.checks.hasLower && strength.checks.hasNumber

  const postRegisterWithRetry = async (payload: { name: string; email: string; password: string }) => {
    const maxAttempts = 3
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.status !== 503 || attempt === maxAttempts) {
        return res
      }

      await new Promise((resolve) => setTimeout(resolve, 400 * attempt))
    }

    throw new Error('Registration retry failed')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Sanitize inputs
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

    if (password.length > 128) {
      setError('Password must be no more than 128 characters')
      return
    }

    setLoading(true)

    try {
      const res = await Sentry.startSpan(
        { op: 'http.client', name: 'POST /api/auth/register' },
        async () => {
          return await postRegisterWithRetry({ name: trimmedName, email: sanitizedEmail, password })
        },
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
        setError(data.error || 'Failed to create account')
      } else {
        setSuccess(data.message || 'Account created! Check your email to verify your account.')
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login?registered=true')
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
          Create Account
        </h1>

        {(error || oauthError) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error || 'Google sign-up failed. Please try again or create an account with email.'}
          </div>
        )}

        {rateLimited && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4 text-sm">
            🔒 Rate limited. Try again in {Math.ceil(rateLimitSeconds / 60)} min {rateLimitSeconds % 60}s
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="on">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              maxLength={100}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              disabled={rateLimited}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              spellCheck={false}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              disabled={rateLimited}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Min 8 chars, upper, lower & number"
              maxLength={128}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              disabled={rateLimited}
            />
            {password.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        level <= strength.score ? strength.color : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${strength.score <= 2 ? 'text-red-600' : strength.score === 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {strength.label}
                </p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
                  <li className={strength.checks.hasLength ? 'text-green-600' : ''}>
                    {strength.checks.hasLength ? '✓' : '○'} At least 8 characters
                  </li>
                  <li className={strength.checks.hasUpper ? 'text-green-600' : ''}>
                    {strength.checks.hasUpper ? '✓' : '○'} Uppercase letter
                  </li>
                  <li className={strength.checks.hasLower ? 'text-green-600' : ''}>
                    {strength.checks.hasLower ? '✓' : '○'} Lowercase letter
                  </li>
                  <li className={strength.checks.hasNumber ? 'text-green-600' : ''}>
                    {strength.checks.hasNumber ? '✓' : '○'} Number
                  </li>
                  <li className={strength.checks.hasSpecial ? 'text-green-600' : ''}>
                    {strength.checks.hasSpecial ? '✓' : '○'} Special character (optional)
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              disabled={rateLimited}
            />
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || rateLimited || !meetsRequirements}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or sign up with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/profile' })}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition font-medium"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign up with Google
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-semibold">
            Sign In
          </Link>
        </p>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function Register() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-96 text-center text-gray-500">Loading...</div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
