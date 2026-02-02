import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity/client'
import CategoryTag from '@/components/ui/CategoryTag'
import LiveBadge from '@/components/ui/LiveBadge'
import { formatDate } from '@/lib/utils'

interface Article {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  mainImage?: any
  publishedAt: string
  isLive?: boolean
  category?: string
  categorySlug?: string
  author?: string
}

interface CategorySectionProps {
  lang: string
  categoryName: string
  categorySlug: string
  articles: Article[]
}

const CategorySection = ({ lang, categoryName, categorySlug, articles }: CategorySectionProps) => {
  if (articles.length === 0) return null

  const [featuredArticle, ...sideArticles] = articles

  return (
    <section className="cnn-section">
      <div className="flex items-center justify-between mb-6">
        <h2 className="headline-2xl">{categoryName}</h2>
        <Link 
          href={`/${lang}/category/${categorySlug}`}
          className="text-sm font-semibold text-cnn-red hover:underline uppercase tracking-wide"
        >
          More {categoryName} →
        </Link>
      </div>

      <div className="cnn-grid-3 gap-6">
        {/* Featured Article - 2/3 width */}
        <Link 
          href={`/${lang}/news/${featuredArticle.slug.current}`}
          className="md:col-span-2 group block"
        >
          <div className="relative h-[400px] bg-cnn-gray-light overflow-hidden">
            {featuredArticle.mainImage && (
              <Image
                src={urlFor(featuredArticle.mainImage).width(900).height(600).url()}
                alt={featuredArticle.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            <div className="absolute top-4 left-4 flex gap-2">
              {featuredArticle.isLive && <LiveBadge />}
              <CategoryTag 
                category={categoryName}
                slug={categorySlug}
                lang={lang}
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="headline-xl text-white mb-2 group-hover:text-cnn-red transition-colors">
                {featuredArticle.title}
              </h3>
              {featuredArticle.excerpt && (
                <p className="text-base text-gray-200 mb-3 line-clamp-2">
                  {featuredArticle.excerpt}
                </p>
              )}
              <div className="text-sm text-gray-300">
                {formatDate(featuredArticle.publishedAt)}
              </div>
            </div>
          </div>
        </Link>

        {/* Side Articles - 1/3 width */}
        <div className="flex flex-col gap-6">
          {sideArticles.slice(0, 3).map((article) => (
            <Link
              key={article._id}
              href={`/${lang}/news/${article.slug.current}`}
              className="group"
            >
              <div className="flex gap-3">
                <div className="relative w-32 h-24 flex-shrink-0 bg-cnn-gray-light overflow-hidden">
                  {article.mainImage && (
                    <Image
                      src={urlFor(article.mainImage).width(200).height(150).url()}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  {article.isLive && (
                    <div className="absolute top-1 left-1">
                      <LiveBadge />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-cnn-text line-clamp-3 group-hover:text-cnn-red transition-colors">
                    {article.title}
                  </h4>
                  <p className="text-xs text-cnn-gray mt-1">
                    {formatDate(article.publishedAt)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategorySection
