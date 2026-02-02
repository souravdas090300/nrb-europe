import Image from 'next/image'
import Link from 'next/link'
import { Clock, User } from 'lucide-react'
import { urlFor } from '@/lib/sanity/client'
import { calculateReadingTime, formatDate } from '@/lib/utils'
import CategoryTag from './CategoryTag'
import LiveBadge from './LiveBadge'

interface NewsCardProps {
  article: {
    _id: string
    title: string
    slug: { current: string }
    excerpt?: string
    mainImage?: any
    category?: string
    categorySlug?: string
    author?: string
    publishedAt: string
    isLive?: boolean
    body?: any
  }
  lang?: string
  variant?: 'default' | 'compact'
  showCategory?: boolean
  showExcerpt?: boolean
  showMeta?: boolean
}

export default function NewsCard({
  article,
  lang = 'en',
  variant = 'default',
  showCategory = true,
  showExcerpt = true,
  showMeta = true,
}: NewsCardProps) {
  const readingTime = article.body ? calculateReadingTime(JSON.stringify(article.body)) : 3

  if (variant === 'compact') {
    return (
      <Link
        href={`/${lang}/news/${article.slug.current}`}
        className="group flex items-start space-x-4 py-3 border-b last:border-b-0"
      >
        {article.mainImage && (
          <div className="relative w-20 h-16 flex-shrink-0 overflow-hidden rounded">
            <Image
              src={urlFor(article.mainImage).width(160).height(120).url()}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="80px"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm group-hover:text-cnn-red transition-colors line-clamp-2">
            {article.title}
          </h3>
          {showMeta && (
            <div className="flex items-center space-x-2 text-xs text-cnn-gray mt-1">
              <time>{formatDate(article.publishedAt)}</time>
            </div>
          )}
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/${lang}/news/${article.slug.current}`}
      className="cnn-card cnn-card-hover block group"
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        {article.mainImage ? (
          <Image
            src={urlFor(article.mainImage).width(800).height(450).url()}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-cnn-gray-light flex items-center justify-center">
            <span className="text-cnn-gray font-bold text-2xl">NRB</span>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          {article.isLive && <LiveBadge />}
          {showCategory && article.category && article.categorySlug && (
            <CategoryTag 
              category={article.category}
              slug={article.categorySlug}
              lang={lang}
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="headline-md mb-2 group-hover:text-cnn-red transition-colors line-clamp-2">
          {article.title}
        </h3>
        
        {showExcerpt && article.excerpt && (
          <p className="text-cnn-gray mb-3 line-clamp-2">
            {article.excerpt}
          </p>
        )}

        {showMeta && (
          <div className="flex items-center justify-between text-sm text-cnn-gray">
            <div className="flex items-center space-x-3">
              {article.author && (
                <span className="flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {article.author}
                </span>
              )}
              <time className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {formatDate(article.publishedAt)}
              </time>
            </div>
            <span className="text-xs font-medium">{readingTime} min read</span>
          </div>
        )}
      </div>
    </Link>
  )
}
