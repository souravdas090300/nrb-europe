'use client'

import { useState } from 'react'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setStatus('success')
        setMessage('Thank you! Please check your email to confirm.')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 border rounded-xl p-8">
      <div className="max-w-md mx-auto text-center">
        <div className="inline-block p-3 bg-red-100 rounded-full mb-4">
          <span className="text-2xl">📰</span>
        </div>
        
        <h3 className="text-2xl font-bold mb-2">Stay Informed</h3>
        <p className="text-gray-600 mb-6">
          Get daily news digests, breaking news alerts, and exclusive content 
          delivered to your inbox.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              required
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
          
          {message && (
            <p className={`text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
          
          <p className="text-xs text-gray-500">
            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
          </p>
        </form>
        
        <div className="mt-6 flex justify-center space-x-6 text-sm text-gray-600">
          <span className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            10,000+ subscribers
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Daily updates
          </span>
        </div>
      </div>
    </div>
  )
}
