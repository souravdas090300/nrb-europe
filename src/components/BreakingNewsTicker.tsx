'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function BreakingNewsTicker() {
  const [breakingNews, setBreakingNews] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Fetch breaking news
  useEffect(() => {
    const fetchBreakingNews = async () => {
      try {
        const response = await fetch('/api/breaking-news')
        const data = await response.json()
        setBreakingNews(data)
      } catch (error) {
        console.error('Failed to fetch breaking news:', error)
      }
    }

    fetchBreakingNews()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchBreakingNews, 30000)
    return () => clearInterval(interval)
  }, [])

  // Auto-rotate news ticker
  useEffect(() => {
    if (breakingNews.length <= 1 || isPaused) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingNews.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [breakingNews.length, isPaused])

  if (breakingNews.length === 0) return null

  const currentNews = breakingNews[currentIndex]

  return (
    <div 
      className="bg-red-600 text-white py-3"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center">
          <span className="font-bold px-3 py-1 bg-white text-red-600 rounded mr-4 flex-shrink-0">
            🔴 BREAKING
          </span>
          
          <div className="flex-1 overflow-hidden">
            <div className="whitespace-nowrap">
              <Link 
                href={`/article/${currentNews.slug.current}`}
                className="font-semibold hover:underline"
              >
                {currentNews.title}
              </Link>
              <span className="mx-4">•</span>
              <span className="text-sm opacity-90">
                {new Date(currentNews.publishedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          {/* Ticker Controls */}
          {breakingNews.length > 1 && (
            <div className="flex items-center ml-4 flex-shrink-0">
              <button
                onClick={() => setCurrentIndex(prev => prev > 0 ? prev - 1 : breakingNews.length - 1)}
                className="p-1 hover:bg-red-700 rounded"
                aria-label="Previous breaking news"
              >
                ◀
              </button>
              <span className="mx-2 text-sm">
                {currentIndex + 1} / {breakingNews.length}
              </span>
              <button
                onClick={() => setCurrentIndex(prev => (prev + 1) % breakingNews.length)}
                className="p-1 hover:bg-red-700 rounded"
                aria-label="Next breaking news"
              >
                ▶
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
