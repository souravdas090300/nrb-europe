import { urlFor } from '@/lib/sanity/client'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Locale } from '@/lib/i18n-config'
import { getDictionary } from '@/lib/get-dictionary'
import {
  generateCategoryStaticParams,
  generateCategoryMetadata,
  getCategoryArticles,
  getCategoryBySlug,
} from '@/lib/sanity/category'

// Generate static params
export async function generateStaticParams() {
  return generateCategoryStaticParams()
}

// Generate metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string, lang: string }> }): Promise<Metadata> {
  const { slug } = await params
  return generateCategoryMetadata(slug)
}

export const revalidate = 60 // Revalidate every minute

export default async function CategoryPage({ params }: { params: Promise<{ slug: string, lang: Locale }> }) {
  const { slug, lang } = await params
  const [category, dictionary] = await Promise.all([
    getCategoryBySlug(slug),
    getDictionary(lang),
  ])
  
  if (!category) {
    notFound()
  }

  // Fetch articles that reference this category
  const articles = await getCategoryArticles(slug)

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
    <main className="min-h-screen bg-white">
      <div className="nrb-container nrb-section">
        <div className="border-b-4 border-nrb-red mb-6 pb-4">
          <h1 className="headline-3xl text-nrb-text mb-2">{category.title}</h1>
          {category.description && (
            <p className="text-nrb-text-light text-lg">{category.description}</p>
          )}
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="headline-2xl text-nrb-text mb-4">{dictionary.article.noArticlesYet}</h2>
            <p className="text-nrb-text-light">{dictionary.article.checkBackSoon}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article: any) => (
              <Link
                key={article._id}
                href={`/${lang}/news/${article.slug.current}`}
                className="nrb-card rounded overflow-hidden hover:shadow-lg transition-shadow"
              >
                {article.mainImage && (
                  <div className="relative h-[200px] overflow-hidden">
                    <Image
                      src={urlFor(article.mainImage).width(600).height(400).url()}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  {article.isLive && (
                    <span className="nrb-badge-breaking mb-2">
                      LIVE
                    </span>
                  )}
                  <h3 className="headline-xl mb-3">{article.title}</h3>
                  {article.excerpt && (
                    <p className="text-sm text-nrb-text-light mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="text-xs text-nrb-text-light opacity-70">
                    {formatTimeAgo(article.publishedAt)}
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
