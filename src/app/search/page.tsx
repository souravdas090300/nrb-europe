import { client } from '@/lib/sanity/client'
import ArticleCard from '@/components/ArticleCard'

interface SearchPageProps {
  searchParams: { q?: string }
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
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
        isBreaking,
        "category": categories[0]->title,
        "categoryColor": categories[0]->color,
        "author": author->name
      }`,
      { searchPattern }
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">
        {query ? `Search Results for "${query}"` : 'Search News'}
      </h1>
      <p className="text-gray-600 mb-8">
        {query ? `Found ${articles.length} result${articles.length !== 1 ? 's' : ''}` : 'Enter search terms above'}
      </p>

      {query.length < 2 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">Please enter at least 2 characters to search.</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">No articles found for "{query}"</p>
          <p className="text-sm text-gray-500 mt-2">
            Try different keywords or check spelling
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article: any) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
