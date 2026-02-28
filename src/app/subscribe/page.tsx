'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

const PLANS = {
  monthly: { amount: 1000, name: 'Monthly' },
  yearly: { amount: 10000, name: 'Yearly' },
}

export default function Subscribe() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    if (!session) {
      router.push('/login?callbackUrl=/subscribe')
      return
    }

    setLoading(plan)

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      } else {
        toast.error('Checkout URL not provided')
      }
    } catch (error) {
      toast.error('Failed to start subscription process')
      setLoading(null)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      toast.error('Failed to open billing portal')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Get unlimited access to all premium content
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border-2 border-transparent hover:border-blue-500 transition">
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Monthly
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Perfect for occasional readers
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                ${PLANS.monthly.amount / 100}
              </span>
              <span className="text-gray-600 dark:text-gray-400">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <span className="text-green-500 mr-2">✓</span>
                Unlimited article access
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <span className="text-green-500 mr-2">✓</span>
                Ad-free experience
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <span className="text-green-500 mr-2">✓</span>
                Exclusive content
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <span className="text-green-500 mr-2">✓</span>
                Cancel anytime
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={loading === 'monthly'}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading === 'monthly' ? 'Processing...' : 'Subscribe Monthly'}
            </button>
          </div>

          {/* Yearly Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border-2 border-blue-500 relative">
            <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
              BEST VALUE
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Yearly
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              For dedicated news enthusiasts
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                ${PLANS.yearly.amount / 100}
              </span>
              <span className="text-gray-600 dark:text-gray-400">/year</span>
              <div className="text-green-600 text-sm mt-1">Save 17%</div>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <span className="text-green-500 mr-2">✓</span>
                Everything in Monthly
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <span className="text-green-500 mr-2">✓</span>
                2 months free
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <span className="text-green-500 mr-2">✓</span>
                Priority support
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <span className="text-green-500 mr-2">✓</span>
                Exclusive newsletters
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe('yearly')}
              disabled={loading === 'yearly'}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading === 'yearly' ? 'Processing...' : 'Subscribe Yearly'}
            </button>
          </div>
        </div>

        {session && (
          <div className="text-center mt-8">
            <button
              onClick={handleManageSubscription}
              className="text-blue-600 hover:underline"
            >
              Manage existing subscription
            </button>
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
