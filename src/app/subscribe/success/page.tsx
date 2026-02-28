'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import confetti from 'canvas-confetti'

export default function SubscribeSuccess() {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto text-center px-4">
        <div className="bg-green-100 dark:bg-green-900/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🎉</span>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Thank You for Subscribing!
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          You now have unlimited access to all premium content.
        </p>
        <div className="space-x-4">
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-block"
          >
            Start Reading
          </Link>
          <Link
            href="/subscribe"
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition inline-block"
          >
            Manage Subscription
          </Link>
        </div>
      </div>
    </div>
  )
}
