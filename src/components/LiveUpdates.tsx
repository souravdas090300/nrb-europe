'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'

interface LiveUpdate {
  _id: string
  time: string
  content: string
  isImportant?: boolean
}

export default function LiveUpdates({ articleId }: { articleId: string }) {
  const [updates, setUpdates] = useState<LiveUpdate[]>([])
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const response = await fetch(`/api/live-updates?articleId=${articleId}`)
        const data = await response.json()
        setUpdates(data)
        setIsLive(true)
      } catch (error) {
        console.error('Failed to fetch live updates:', error)
      }
    }
    
    fetchUpdates()
    
    // Poll for new updates every 10 seconds
    const interval = setInterval(fetchUpdates, 10000)
    
    return () => clearInterval(interval)
  }, [articleId])

  if (updates.length === 0) return null

  return (
    <div className="border-l-4 border-red-600 bg-red-50 rounded-r-lg p-6 my-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse mr-2"></span>
          <h3 className="text-xl font-bold">Live Updates</h3>
        </div>
        <span className="px-3 py-1 bg-red-600 text-white text-sm rounded-full">
          {isLive ? 'LIVE' : 'PAUSED'}
        </span>
      </div>
      
      <div className="space-y-6">
        {updates.map((update, index) => (
          <div key={update._id} className="flex">
            <div className="flex flex-col items-center mr-4">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              {index !== updates.length - 1 && (
                <div className="w-0.5 flex-1 bg-red-300 mt-1"></div>
              )}
            </div>
            <div className="flex-1 pb-6">
              <div className="flex items-center mb-2">
                <time className="text-sm font-semibold text-gray-700">
                  {format(new Date(update.time), 'h:mm a')}
                </time>
                {update.isImportant && (
                  <span className="ml-3 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                    IMPORTANT
                  </span>
                )}
              </div>
              <p className="text-gray-900">{update.content}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t">
        <p className="text-sm text-gray-600">
          Updates refresh automatically every 10 seconds.
          <button className="ml-2 text-red-600 hover:underline">
            Get notifications for updates
          </button>
        </p>
      </div>
    </div>
  )
}
