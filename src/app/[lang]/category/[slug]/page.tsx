import { urlFor } from '@/lib/sanity/client'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Locale } from '@/lib/i18n-config'
import { getDictionary } from '@/lib/get-dictionary'
import { categories } from '@/lib/constants'
import { prisma } from '@/lib/prisma'
import {
  generateCategoryStaticParams,
  generateCategoryMetadata,
  getCategoryArticles,
  getCategoryBySlug,
} from '@/lib/sanity/category'

// Generate static params — include all known categories, DB categories, and Sanity ones
export async function generateStaticParams() {
  const sanityParams = await generateCategoryStaticParams()
  const constantSlugs = categories.map((c) => ({ slug: c.slug }))

  let dbSlugs: { slug: string }[] = []
  if (process.env.DATABASE_URL) {
    try {
      const dbCategories = await prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true },
      })
      dbSlugs = dbCategories.map((c) => ({ slug: c.slug }))
    } catch {
      // Ignore DB errors during build
    }
  }

  const seen = new Set<string>()
  const merged: { slug: string }[] = []
  for (const p of [...sanityParams, ...constantSlugs, ...dbSlugs]) {
    if (!seen.has(p.slug)) {
      seen.add(p.slug)
      merged.push(p)
    }
  }
  return merged
}

// Generate metadata — with DB category fallback for admin-created categories
export async function generateMetadata({ params }: { params: Promise<{ slug: string, lang: string }> }): Promise<Metadata> {
  const { slug } = await params
  const sanityMeta = await generateCategoryMetadata(slug)
  // If Sanity found the category, use its metadata
  if (sanityMeta.title !== 'Category Not Found - NRB Europe') {
    return sanityMeta
  }
  // Fallback: check DB for admin-created category
  if (process.env.DATABASE_URL) {
    try {
      const dbCat = await prisma.category.findFirst({
        where: { slug, isActive: true },
        select: { name: true, description: true },
      })
      if (dbCat) {
        return {
          title: `${dbCat.name} News - NRB Europe`,
          description: dbCat.description || `Latest ${dbCat.name} news for NRBs in Europe`,
        }
      }
    } catch {
      // Ignore DB errors
    }
  }
  return sanityMeta
}

export const revalidate = 60 // Revalidate every minute

type DbCategoryInfo = {
  name: string
  description: string | null
  parent: { name: string; slug: string } | null
  children: Array<{ name: string; slug: string }>
}

async function getDbCategoryBySlug(slug: string): Promise<DbCategoryInfo | null> {
  if (!process.env.DATABASE_URL) {
    return null
  }

  try {
    return await prisma.category.findFirst({
      where: { slug, isActive: true },
      select: {
        name: true,
        description: true,
        parent: { select: { name: true, slug: true } },
        children: {
          where: { isActive: true },
          select: { name: true, slug: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })
  } catch (error) {
    console.error('Error fetching DB category by slug:', error)
    return null
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string, lang: Locale }> }) {
  const { slug, lang } = await params
  const [sanityCategory, dbCategory, dictionary] = await Promise.all([
    getCategoryBySlug(slug),
    getDbCategoryBySlug(slug),
    getDictionary(lang),
  ])

  // Fallback to constants if the category doesn't exist in Sanity yet
  const knownCategory = categories.find((c) => c.slug === slug)
  const category = sanityCategory ||
    (dbCategory ? { title: dbCategory.name, description: dbCategory.description } : null) ||
    (knownCategory ? { title: knownCategory.name, description: null } : null)

  if (!category) {
    // Truly unknown category — not in Sanity or constants
    const { notFound } = await import('next/navigation')
    notFound()
  }

  const parentCategory = dbCategory?.parent ?? null
  const subcategories = dbCategory?.children ?? []

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
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <div className="nrb-container nrb-section">
        <div className="border-b-4 border-nrb-red mb-6 pb-4">
          {/* Breadcrumb for subcategories */}
          {parentCategory && (
            <nav className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <Link href={`/${lang}/category/${parentCategory.slug}`} className="hover:text-red-600">
                {parentCategory.name}
              </Link>
              <span>›</span>
              <span className="text-gray-800 dark:text-gray-200 font-semibold">{category.title}</span>
            </nav>
          )}
          <h1 className="headline-3xl text-nrb-text mb-2">{category.title}</h1>
          {category.description && (
            <p className="text-nrb-text-light text-lg">{category.description}</p>
          )}
          {/* Subcategory chips for parent categories */}
          {subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {subcategories.map((sub) => (
                <Link
                  key={sub.slug}
                  href={`/${lang}/category/${sub.slug}`}
                  className="px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300 hover:text-red-600 hover:border-red-400 transition-colors"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
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
