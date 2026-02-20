import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '../../lib/sanity/client'

interface Article {
  _id: string
  title: string
  slug?: { current: string }
  excerpt?: string
  mainImage?: any
  publishedAt: string
  isLive?: boolean
  category?: string
  categorySlug?: string
  author?: string
}

interface NewsLayoutPremiumProps {
  categoryTitle: string
  categoryDescription?: string
  featured: Article | null
  articles: Article[]
  lang: string
}

function formatTimeAgo(date: string) {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) return 'Just now'
  if (diffHours === 1) return '1h ago'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffHours < 48) return 'Yesterday'
  return `${Math.floor(diffHours / 24)}d ago`
}

export default function NewsLayoutPremium({
  categoryTitle,
  categoryDescription,
  featured,
  articles,
  lang,
}: NewsLayoutPremiumProps) {
  const basePath = lang ? `/${lang}` : ''
  const secondaryArticles = articles.filter((a) => a._id !== featured?._id).slice(0, 4)
  const bottomArticles = articles.slice(5, 7)

  return (
    <div className="nrb-premium-wrapper">
      {/* Masthead */}
      <div className="nrb-premium-masthead">
        <div className="nrb-premium-title">
          📰 {categoryTitle.toUpperCase()}
        </div>
        <div className="nrb-premium-edition">
          NRB EUROPE · {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="nrb-premium-breadcrumb">
        <span>🏠 HOME</span>
        <span>🌍 EUROPE</span>
        <span>📢 {categoryTitle.toUpperCase()}</span>
        <span>LATEST</span>
      </div>

      {/* Description */}
      {categoryDescription && (
        <p className="mb-6 text-gray-700 italic">{categoryDescription}</p>
      )}

      {/* Main Grid Layout */}
      {articles.length > 0 ? (
        <>
          <div className="nrb-premium-grid-news">
            {/* LEFT: Featured Story */}
            {featured && (
              <div className="nrb-premium-lead-story">
                <div className="nrb-premium-lead-category">
                  {featured.isLive && '⚡ BREAKING · '}
                  {featured.category || categoryTitle}
                </div>

                <h1 className="nrb-premium-lead-headline">{featured.title}</h1>

                {featured.excerpt && (
                  <div className="nrb-premium-lead-deck">{featured.excerpt}</div>
                )}

                <div className="nrb-premium-gold-accent"></div>

                <div className="nrb-premium-meta">
                  {featured.author && <span>✍️ {featured.author}</span>}
                  <span>🕐 {formatTimeAgo(featured.publishedAt)}</span>
                  {featured.category && <span>📍 {featured.category}</span>}
                </div>
              </div>
            )}

            {/* RIGHT: Story Stack */}
            {secondaryArticles.length > 0 && (
              <div className="nrb-premium-story-stack">
                {secondaryArticles.map((article, idx) => (
                  <Link
                    key={article._id}
                    href={`${basePath}/news/${article.slug?.current || '#'}`}
                    className="nrb-premium-story-card"
                  >
                    <div className="nrb-premium-story-icon">
                      {idx === 0 && '🏛️'}
                      {idx === 1 && '⚖️'}
                      {idx === 2 && '📊'}
                      {idx === 3 && '🔬'}
                    </div>
                    <div className="nrb-premium-story-content">
                      <div className={`nrb-premium-story-headline ${idx === 0 ? 'large' : ''}`}>
                        {article.title}
                      </div>
                      <div className="nrb-premium-story-meta">
                        {article.category && <span className="nrb-premium-badge">{article.category}</span>}
                        <span>🕐 {formatTimeAgo(article.publishedAt)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Section: Breaking Stories */}
          {bottomArticles.length > 0 && (
            <div className="nrb-premium-bottom-split">
              {bottomArticles.map((article, idx) => (
                <Link
                  key={article._id}
                  href={`${basePath}/news/${article.slug?.current || '#'}`}
                  className="nrb-premium-bottom-item"
                >
                  <div className="nrb-premium-bottom-icon">
                    {idx === 0 ? '🎯' : '🏅'}
                  </div>
                  <div className="nrb-premium-bottom-text">
                    <div className="nrb-premium-section-tag">
                      {article.category || categoryTitle}
                    </div>
                    <p className="nrb-premium-bottom-headline">{article.title}</p>
                    {article.excerpt && (
                      <p className="nrb-premium-bottom-excerpt">{article.excerpt}</p>
                    )}
                    <div className="nrb-premium-bottom-meta">
                      <span>🕐 {formatTimeAgo(article.publishedAt)}</span>
                      {article.author && <span>✍️ {article.author}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* More From Section */}
          {articles.length > 0 && (
            <div className="nrb-premium-more-from">
              <span className="font-semibold">📌 MORE FROM {categoryTitle.toUpperCase()}:</span>
              <span>
                {articles.slice(0, 3).map((a) => a.title).join(' · ')}
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="py-16 text-center">
          <p className="text-xl text-gray-600 mb-4">No articles published yet in {categoryTitle}</p>
          <p className="text-gray-500">Check back soon for the latest {categoryTitle} news</p>
          <Link
            href={`${basePath}/studio`}
            className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Studio
          </Link>
        </div>
      )}

      {/* Footer */}
      <div className="nrb-premium-footer-note">
        <span>© 2026 NRB EUROPE — {categoryTitle} Section</span>
        <span className="text-xs">Updated {new Date().toLocaleTimeString('en-US')}</span>
      </div>
    </div>
  )
}
