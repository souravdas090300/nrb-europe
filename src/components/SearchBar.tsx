'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface SearchBarProps {
  placeholder?: string
  loading?: string
  noResults?: string
}

export default function SearchBar({ 
  placeholder = 'Search news...',
  loading: loadingText = 'Searching...',
  noResults = 'No results found'
}: SearchBarProps = {}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const lang = pathname.split('/')[1] || 'en'

  const searchArticles = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Debounced search
  const debouncedSearch = useCallback((q: string) => {
    const timer = setTimeout(() => searchArticles(q), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const cleanup = debouncedSearch(query)
    return cleanup
  }, [query, debouncedSearch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/${lang}/search?q=${encodeURIComponent(query)}`)
      setShowResults(false)
    }
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowResults(true)
          }}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-600"
        >
          🔍
        </button>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (query.length >= 2) && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-600">{loadingText}</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-600">
              {query.length >= 2 ? noResults : 'Type at least 2 characters'}
            </div>
          ) : (
            <div>
              {results.slice(0, 8).map((article) => (
                <a
                  key={article._id}
                  href={`/${lang}/news/${article.slug.current}`}
                  className="block p-4 hover:bg-gray-50 border-b last:border-b-0"
                  onClick={() => setShowResults(false)}
                >
                  <h4 className="font-semibold text-gray-900">{article.title}</h4>
                  <p className="text-sm text-gray-600 mt-1 truncate">{article.excerpt}</p>
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                      {article.category}
                    </span>
                    <span className="ml-3">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </a>
              ))}
              {results.length > 8 && (
                <a
                  href={`/${lang}/search?q=${encodeURIComponent(query)}`}
                  className="block p-4 text-center text-red-600 hover:bg-gray-50 font-semibold"
                  onClick={() => setShowResults(false)}
                >
                  View all results ({results.length})
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  )
}
