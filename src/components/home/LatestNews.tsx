import React from 'react'
import NewsCard from '@/components/ui/NewsCard'

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

interface LatestNewsProps {
  lang: string
  articles: Article[]
}

const LatestNews = ({ lang, articles }: LatestNewsProps) => {
  return (
    <section className="cnn-section">
      <div className="flex items-center justify-between mb-6">
        <h2 className="headline-2xl">Latest News</h2>
        <a 
          href={`/${lang}/category/all`}
          className="text-sm font-semibold text-cnn-red hover:underline uppercase tracking-wide"
        >
          View All →
        </a>
      </div>

      <div className="cnn-grid-3 gap-6">
        {articles.map((article) => (
          <NewsCard 
            key={article._id}
            article={article}
            lang={lang}
            variant="default"
          />
        ))}
      </div>
    </section>
  )
}

export default LatestNews
