import { client, urlFor } from '@/lib/sanity/client'
import { allArticlesQuery } from '@/lib/sanity/queries'
import { Locale } from '@/lib/i18n-config'
import { getDictionary } from '@/lib/get-dictionary'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'All News - NRB Europe',
  description: 'Browse all the latest news articles from NRB Europe',
}

export default async function NewsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const [articles, dictionary] = await Promise.all([
    client.fetch(allArticlesQuery),
    getDictionary(lang),
  ])

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const publishedDate = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - publishedDate.getTime()) / 1000)
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="border-b-4 border-red-600 mb-6 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {dictionary?.nav?.videos || 'All News'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse the latest news and stories from NRB Europe
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {dictionary?.article?.noArticlesYet || 'No articles yet'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {dictionary?.article?.checkBackSoon || 'Check back soon for the latest news.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: any) => (
              <Link
                key={article._id}
                href={`/${lang}/news/${article.slug.current}`}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700"
              >
                {article.mainImage && (
                  <div className="relative h-[200px] overflow-hidden">
                    <Image
                      src={urlFor(article.mainImage).width(600).height(400).url()}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                    {article.category && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                        {article.category}
                      </span>
                    )}
                  </div>
                )}
                <div className="p-5">
                  {article.isBreaking && (
                    <span className="text-xs font-bold text-red-600 uppercase mb-2 block">
                      Breaking
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                    {article.author && <span>{article.author}</span>}
                    <span>{formatTimeAgo(article.publishedAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
