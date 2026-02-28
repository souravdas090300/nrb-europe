import { client } from '@/lib/sanity/client'
import { urlFor } from '@/lib/sanity/client'
import { Metadata } from 'next'
import { Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Locale } from '@/lib/i18n-config'
import { getDictionary } from '@/lib/get-dictionary'

interface SearchPageProps {
  params: Promise<{ lang: Locale }>
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  const query = q || ''
  return {
    title: query ? `Search Results for "${query}" - NRB Europe` : 'Search - NRB Europe',
    description: 'Search news articles on NRB Europe',
  }
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { lang } = await params
  const { q } = await searchParams
  const query = q || ''
  const dictionary = await getDictionary(lang)
  const t = dictionary.search

  let articles: any[] = []
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
        "category": categories[0]->title,
        "author": author->name
      }`,
      { searchPattern }
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 dark:text-white">
          <Search className="w-8 h-8 text-red-600" />
          {query ? `${t.resultsFor} "${query}"` : t.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {query
            ? `${t.found} ${articles.length} ${articles.length !== 1 ? t.results : t.result}`
            : t.enterTerms}
        </p>
      </div>

      {query.length < 2 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow text-center py-20">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg dark:text-gray-200">{t.minChars}</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow text-center py-20">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg dark:text-gray-200 mb-2">{t.noArticlesFor} &ldquo;{query}&rdquo;</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t.tryDifferent}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article: any) => (
            <Link
              key={article._id}
              href={`/${lang}/news/${article.slug.current}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
            >
              {article.mainImage && (
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={urlFor(article.mainImage).width(600).height(400).url()}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                {article.category && (
                  <span className="text-xs font-semibold text-red-600 uppercase">
                    {article.category}
                  </span>
                )}
                <h3 className="font-bold text-lg mt-1 line-clamp-2 dark:text-white">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-3">
                  {article.author && <span>{article.author}</span>}
                  <time>{new Date(article.publishedAt).toLocaleDateString()}</time>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
