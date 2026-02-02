'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

const breakingNews = [
  { id: 1, title: 'European Summit: Leaders reach agreement on economic reform', url: '/article/european-summit-agreement' },
  { id: 2, title: 'Breaking: Major policy announcement expected from EU Commission', url: '/article/eu-policy-announcement' },
  { id: 3, title: 'Live Updates: Immigration reform discussion ongoing', url: '/article/immigration-reform-live' },
]

export default function BreakingNewsBar() {
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % breakingNews.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-cnn-live text-white py-2 overflow-hidden">
      <div className="cnn-container flex items-center">
        <div className="flex items-center mr-4 flex-shrink-0">
          <AlertTriangle className="w-4 h-4 mr-2 animate-pulse" />
          <span className="font-bold text-sm uppercase tracking-wider">BREAKING</span>
        </div>
        <div className="flex-1 overflow-hidden relative min-h-[24px]">
          {breakingNews.map((news, index) => (
            <Link
              key={news.id}
              href={news.url}
              className={`
                absolute inset-0 flex items-center transition-all duration-500
                ${index === currentNewsIndex ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
              `}
            >
              <span className="truncate hover:underline font-medium text-sm">
                {news.title}
              </span>
            </Link>
          ))}
        </div>
        <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
          {breakingNews.map((_, index) => (
            <button
              key={index}
              className={`
                w-2 h-2 rounded-full transition-all
                ${index === currentNewsIndex ? 'bg-white scale-125' : 'bg-white/50'}
              `}
              onClick={() => setCurrentNewsIndex(index)}
              aria-label={`View breaking news ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
