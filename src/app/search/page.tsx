import { client } from '@/lib/sanity/client'
import NewsCard from '@/components/ui/NewsCard'
import { Metadata } from 'next'
import { Search } from 'lucide-react'

interface SearchPageProps {
  searchParams: { q?: string }
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q || ''
  return {
    title: query ? `Search Results for "${query}" - NRB Europe` : 'Search - NRB Europe',
    description: 'Search news articles on NRB Europe'
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ''
  
  let articles = []
  if (query.length >= 2) {
    const searchPattern = `*${query}*`
    articles = await client.fetch<any[]>(
      `*[_type == "post" && (
        title match $searchPattern ||
        excerpt match $searchPattern
      )] | order(publishedAt desc) {
        _id,
        title,
        slug,
        excerpt,
        mainImage,
        publishedAt,
        isLive,
        body,
        "category": categories[0]->title,
        "categorySlug": categories[0]->slug.current,
        "author": author->name
      }`,
      { searchPattern }
    )
  }

  return (
    <div className="cnn-container py-8">
      <div className="mb-8">
        <h1 className="headline-2xl mb-2 flex items-center gap-2">
          <Search className="w-8 h-8 text-cnn-red" />
          {query ? `Search Results for "${query}"` : 'Search News'}
        </h1>
        <p className="text-cnn-gray">
          {query ? `Found ${articles.length} result${articles.length !== 1 ? 's' : ''}` : 'Enter search terms above'}
        </p>
      </div>

      {query.length < 2 ? (
        <div className="cnn-card text-center py-20">
          <Search className="w-16 h-16 text-cnn-gray mx-auto mb-4" />
          <p className="text-cnn-text text-lg">Please enter at least 2 characters to search.</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="cnn-card text-center py-20">
          <Search className="w-16 h-16 text-cnn-gray mx-auto mb-4" />
          <p className="text-cnn-text text-lg mb-2">No articles found for "{query}"</p>
          <p className="text-sm text-cnn-gray">
            Try different keywords or check spelling
          </p>
        </div>
      ) : (
        <div className="cnn-grid-3 gap-6">
          {articles.map((article: any) => (
            <NewsCard key={article._id} article={article} variant="default" />
          ))}
        </div>
      )}
    </div>
  )
}
