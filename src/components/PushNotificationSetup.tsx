'use client'

import { useState, useEffect } from 'react'

export default function PushNotificationSetup() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
      setIsSubscribed(!!sub)
    } catch (error) {
      console.error('Service worker registration failed:', error)
    }
  }

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })

      setSubscription(sub)
      setIsSubscribed(true)
    } catch (error) {
      console.error('Push subscription failed:', error)
    }
  }

  const unsubscribeFromPush = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe()
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })
        setSubscription(null)
        setIsSubscribed(false)
      }
    } catch (error) {
      console.error('Unsubscribe failed:', error)
    }
  }

  if (!isSupported) return null

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Push Notifications</h3>
          <p className="text-sm text-gray-600">Get breaking news alerts</p>
        </div>
        <button
          onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
          className={`px-4 py-2 rounded-lg font-semibold ${
            isSubscribed
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {isSubscribed ? 'Disable' : 'Enable'}
        </button>
      </div>
    </div>
  )
}
