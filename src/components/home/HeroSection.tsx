import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity/client'
import CategoryTag from '@/components/ui/CategoryTag'
import LiveBadge from '@/components/ui/LiveBadge'
import { Clock, User } from 'lucide-react'
import { formatDate, calculateReadingTime } from '@/lib/utils'

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
  body?: any[]
}

interface HeroSectionProps {
  lang: string
  mainArticle: Article
  sideArticles: Article[]
}

const HeroSection = ({ lang, mainArticle, sideArticles }: HeroSectionProps) => {
  return (
    <section className="cnn-section">
      <div className="cnn-grid-3 gap-4">
        {/* Main Featured Article - 2/3 width */}
        <Link 
          href={`/${lang}/news/${mainArticle.slug.current}`}
          className="md:col-span-2 group block"
        >
          <div className="relative h-[500px] bg-cnn-gray-light overflow-hidden">
            {mainArticle.mainImage && (
              <Image
                src={urlFor(mainArticle.mainImage).width(1200).height(800).url()}
                alt={mainArticle.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            
            <div className="absolute top-4 left-4 flex gap-2">
              {mainArticle.isLive && <LiveBadge />}
              {mainArticle.category && (
                <CategoryTag 
                  category={mainArticle.category}
                  slug={mainArticle.categorySlug || ''}
                  lang={lang}
                />
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h1 className="headline-3xl text-white mb-3 group-hover:text-cnn-red transition-colors">
                {mainArticle.title}
              </h1>
              {mainArticle.excerpt && (
                <p className="text-lg text-gray-200 mb-4 line-clamp-2">
                  {mainArticle.excerpt}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-300">
                {mainArticle.author && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{mainArticle.author}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(mainArticle.publishedAt)}</span>
                </div>
                {mainArticle.body && (
                  <span>{calculateReadingTime(JSON.stringify(mainArticle.body))} min read</span>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Side Articles - 1/3 width */}
        <div className="flex flex-col gap-4">
          {sideArticles.map((article) => (
            <Link
              key={article._id}
              href={`/${lang}/news/${article.slug.current}`}
              className="group flex flex-col h-[158px]"
            >
              <div className="relative h-32 bg-cnn-gray-light overflow-hidden">
                {article.mainImage && (
                  <Image
                    src={urlFor(article.mainImage).width(400).height(300).url()}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute top-2 left-2 flex gap-2">
                  {article.isLive && <LiveBadge />}
                  {article.category && (
                    <CategoryTag 
                      category={article.category}
                      slug={article.categorySlug || ''}
                      lang={lang}
                    />
                  )}
                </div>
              </div>
              <h3 className="text-base font-bold text-cnn-text mt-2 line-clamp-2 group-hover:text-cnn-red transition-colors">
                {article.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HeroSection
