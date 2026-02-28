<<<<<<< Updated upstream
import { urlFor } from '@/lib/sanity/client'
=======
import { client, urlFor } from '../../../../lib/sanity/client'
import { categoryBySlugQuery } from '../../../../lib/sanity/queries'
>>>>>>> Stashed changes
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
<<<<<<< Updated upstream
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
=======

// Generate static params
export async function generateStaticParams() {
  const categories = await client.fetch(`*[_type == "category"]{ "slug": slug.current }`)
  return categories.map((category: any) => ({
    slug: category.slug,
  }))
>>>>>>> Stashed changes
}

// Generate metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string, lang: string }> }): Promise<Metadata> {
  const { slug } = await params
<<<<<<< Updated upstream
  return generateCategoryMetadata(slug)
=======
  const category = await client.fetch(categoryBySlugQuery, { slug })
  
  if (!category) {
    return {
      title: 'Category Not Found - NRB Europe',
    }
  }

  return {
    title: `${category.title} News - NRB Europe`,
    description: category.description || `Latest ${category.title} news for NRBs in Europe`,
  }
>>>>>>> Stashed changes
}

export const revalidate = 60 // Revalidate every minute

<<<<<<< Updated upstream
export default async function CategoryPage({ params }: { params: Promise<{ slug: string, lang: Locale }> }) {
  const { slug, lang } = await params
  const [category, dictionary] = await Promise.all([
    getCategoryBySlug(slug),
    getDictionary(lang),
  ])
=======
export default async function CategoryPage({ params }: { params: Promise<{ slug: string, lang: string }> }) {
  const { slug, lang } = await params
  const category = await client.fetch(categoryBySlugQuery, { slug })
>>>>>>> Stashed changes
  
  if (!category) {
    notFound()
  }

  // Fetch articles that reference this category
<<<<<<< Updated upstream
  const articles = await getCategoryArticles(slug)
=======
  const articles = await client.fetch(
    `*[_type == "post" && references(*[_type == "category" && slug.current == $slug][0]._id)] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      mainImage,
      publishedAt,
      isLive,
      body,
      "category": categories[0]->title,
      "categorySlug": categories[0]->slug.current,
      "author": author->name
    }`,
    { slug }
  )
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
            <h2 className="headline-2xl text-nrb-text mb-4">{dictionary.article.noArticlesYet}</h2>
            <p className="text-nrb-text-light">{dictionary.article.checkBackSoon}</p>
=======
            <h2 className="headline-2xl text-nrb-text mb-4">No articles yet</h2>
            <p className="text-nrb-text-light">Check back soon for updates</p>
>>>>>>> Stashed changes
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
