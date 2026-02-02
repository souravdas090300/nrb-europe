'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity/client'
import { TrendingUp, Eye, Play, Mail } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Article {
  _id: string
  title: string
  slug: { current: string }
  mainImage?: any
  publishedAt: string
  views?: number
}

interface SidebarProps {
  lang: string
  trendingArticles?: Article[]
  mostReadArticles?: Article[]
  videoArticles?: Article[]
}

const Sidebar = ({ lang, trendingArticles = [], mostReadArticles = [], videoArticles = [] }: SidebarProps) => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        setMessage('Successfully subscribed!')
        setEmail('')
      } else {
        setMessage('Subscription failed. Please try again.')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <aside className="space-y-8">
      {/* Trending Section */}
      {trendingArticles.length > 0 && (
        <div className="cnn-card">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-cnn-gray-light">
            <TrendingUp className="w-5 h-5 text-cnn-red" />
            <h3 className="headline-lg">Trending Now</h3>
          </div>
          <div className="space-y-4">
            {trendingArticles.slice(0, 5).map((article, index) => (
              <Link
                key={article._id}
                href={`/${lang}/news/${article.slug.current}`}
                className="flex gap-3 group"
              >
                <span className="text-3xl font-black text-cnn-red flex-shrink-0 w-8">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-cnn-text line-clamp-3 group-hover:text-cnn-red transition-colors">
                    {article.title}
                  </h4>
                  <p className="text-xs text-cnn-gray mt-1">
                    {formatDate(article.publishedAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Most Read Section */}
      {mostReadArticles.length > 0 && (
        <div className="cnn-card">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-cnn-gray-light">
            <Eye className="w-5 h-5 text-cnn-red" />
            <h3 className="headline-lg">Most Read</h3>
          </div>
          <div className="space-y-4">
            {mostReadArticles.slice(0, 5).map((article) => (
              <Link
                key={article._id}
                href={`/${lang}/news/${article.slug.current}`}
                className="group block"
              >
                <h4 className="text-sm font-bold text-cnn-text line-clamp-2 group-hover:text-cnn-red transition-colors">
                  {article.title}
                </h4>
                <p className="text-xs text-cnn-gray mt-1">
                  {formatDate(article.publishedAt)}
                  {article.views && ` • ${article.views.toLocaleString()} views`}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Video Section */}
      {videoArticles.length > 0 && (
        <div className="cnn-card">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-cnn-gray-light">
            <Play className="w-5 h-5 text-cnn-red" />
            <h3 className="headline-lg">Must-Watch Videos</h3>
          </div>
          <div className="space-y-4">
            {videoArticles.slice(0, 3).map((article) => (
              <Link
                key={article._id}
                href={`/${lang}/news/${article.slug.current}`}
                className="group block"
              >
                <div className="relative h-40 bg-cnn-gray-light overflow-hidden mb-2">
                  {article.mainImage && (
                    <Image
                      src={urlFor(article.mainImage).width(400).height(300).url()}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-cnn-red ml-1" />
                    </div>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-cnn-text line-clamp-2 group-hover:text-cnn-red transition-colors">
                  {article.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter Section */}
      <div className="cnn-card bg-cnn-blue text-white">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5" />
          <h3 className="headline-lg">Stay Informed</h3>
        </div>
        <p className="text-sm text-gray-300 mb-4">
          Get the latest European news delivered to your inbox daily.
        </p>
        <form onSubmit={handleSubscribe} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-2 rounded bg-white text-cnn-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cnn-red"
            required
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="w-full cnn-button-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </button>
          {message && (
            <p className={`text-xs ${message.includes('Success') ? 'text-green-300' : 'text-red-300'}`}>
              {message}
            </p>
          )}
        </form>
      </div>

      {/* Follow Us Section */}
      <div className="cnn-card">
        <h3 className="headline-lg mb-4">Follow Us</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'Facebook', color: 'bg-blue-600' },
            { name: 'Twitter', color: 'bg-sky-500' },
            { name: 'Instagram', color: 'bg-pink-600' },
            { name: 'YouTube', color: 'bg-red-600' },
            { name: 'LinkedIn', color: 'bg-blue-700' },
            { name: 'Telegram', color: 'bg-sky-600' },
          ].map((social) => (
            <a
              key={social.name}
              href="#"
              className={`${social.color} text-white text-xs font-semibold py-2 px-3 rounded text-center hover:opacity-90 transition-opacity`}
            >
              {social.name}
            </a>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
