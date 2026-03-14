'use client'

import { signIn, signOut } from 'next-auth/react'
import { getSession } from 'next-auth/react'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'
import NrbLogo from '@/components/ui/NrbLogo'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const justRegistered = searchParams.get('registered') === 'true'
  const oauthError = searchParams.get('error')
  const isAdminLogin = searchParams.get('admin') === 'true'
  const callbackUrlParam = searchParams.get('callbackUrl')
  const safeCallbackUrl = callbackUrlParam?.startsWith('/') ? callbackUrlParam : null

  // Lockout countdown timer
  const [lockoutSeconds, setLockoutSeconds] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      if (lockedUntil) {
        const remaining = Math.ceil((lockedUntil - Date.now()) / 1000)
        if (remaining <= 0) {
          setLockedUntil(null)
          setLockoutSeconds(0)
          setFailedAttempts(0)
        } else {
          setLockoutSeconds(remaining)
        }
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [lockedUntil])

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked) return

    // Basic client-side validation
    if (!email.trim() || !password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await Sentry.startSpan(
        { op: 'auth', name: 'credentials-sign-in' },
        async () => {
          return await signIn('credentials', {
            email: email.trim().toLowerCase(),
            password,
            redirect: false,
          })
        },
      )

      if (res?.error) {
        const newAttempts = failedAttempts + 1
        setFailedAttempts(newAttempts)

        if (res.error.includes('Too many login attempts')) {
          // Server-side lockout — parse seconds from error message
          const match = res.error.match(/(\d+)\s*seconds/)
          const seconds = match ? parseInt(match[1]) : 900
          setLockedUntil(Date.now() + seconds * 1000)
          setLockoutSeconds(seconds)
          setError(`Account temporarily locked. Try again in ${Math.ceil(seconds / 60)} minutes.`)
        } else if (res.error.includes('verify your email')) {
          setError('Please verify your email before signing in. Check your inbox.')
        } else {
          // Show remaining attempts after 2 failures
          if (newAttempts >= 2) {
            const remaining = 5 - newAttempts
            setError(`Invalid email or password. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Account may be locked soon.'}`)
          } else {
            setError('Invalid email or password')
          }

          // Client-side lockout after 5 attempts
          if (newAttempts >= 5) {
            setLockedUntil(Date.now() + 15 * 60 * 1000) // 15 minutes
            setLockoutSeconds(900)
          }
        }
      } else if (res?.ok) {
        setFailedAttempts(0)
        const session = await getSession()
        const role = session?.user?.role

        if (isAdminLogin && role !== 'admin') {
          await signOut({ redirect: false })
          setError('Only admin accounts can sign in here.')
          return
        }

        if (safeCallbackUrl) {
          if (safeCallbackUrl.startsWith('/admin') && role !== 'admin') {
            router.push('/profile?error=admin_required')
          } else {
            router.push(safeCallbackUrl)
          }
        } else {
          router.push(role === 'admin' ? '/admin' : '/profile')
        }
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
          {isAdminLogin ? 'Admin Sign In' : 'Sign In'}
        </h1>

        {justRegistered && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
            Account created successfully! Please check your email to verify, then sign in.
          </div>
        )}

        {oauthError && !error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {oauthError === 'admin_required'
              ? 'This account does not have admin access.'
              : 'Google sign-in failed. Please try again or sign in with email.'}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {isLocked && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4 text-sm">
            🔒 Too many failed attempts. Try again in {Math.ceil(lockoutSeconds / 60)} min {lockoutSeconds % 60}s
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="on">
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              spellCheck={false}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              disabled={isLocked}
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 text-sm font-bold">Password</label>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              disabled={isLocked}
            />
          </div>

          <button
            type="submit"
            disabled={loading || isLocked}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl: safeCallbackUrl ?? (isAdminLogin ? '/admin' : '/profile') })}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition font-medium"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>

        {!isAdminLogin && (
          <div className="mt-4">
            <Link
              href="/register"
              className="block w-full text-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition font-semibold text-sm"
            >
              Create Account
            </Link>
          </div>
        )}

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-96 text-center text-gray-500">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
