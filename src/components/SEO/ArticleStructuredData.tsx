'use client'

interface Article {
  title: string
  excerpt?: string
  mainImage?: string
  publishedAt: string
  _updatedAt?: string
  slug: { current: string }
  author?: { name: string }
  categories?: Array<{ title: string }>
}

interface Props {
  article: Article
  lang: string
}

export default function ArticleStructuredData({ article, lang }: Props) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nrb-europe.vercel.app'
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt || '',
    image: article.mainImage ? [article.mainImage] : [],
    datePublished: article.publishedAt,
    dateModified: article._updatedAt || article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.author?.name || 'NRB Europe Editorial Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'NRB Europe',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/${lang}/news/${article.slug.current}`,
    },
    inLanguage: lang,
    articleSection: article.categories?.[0]?.title || 'News',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
