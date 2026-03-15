import Link from 'next/link'
import { Locale } from '@/lib/i18n-config'
import { getDictionary } from '@/lib/get-dictionary'
import { client } from '@/lib/sanity/client'
import { getLocalizedCategoryValue, getLocalizedOptionalCategoryValue } from '@/lib/category-localization'
import { prisma } from '@/lib/prisma'
import HeroSection from '@/components/sections/HeroSection'
import TrendingStories from '@/components/sections/TrendingStories'
import VideoSection from '@/components/sections/VideoSection'
import LatestStories from '@/components/sections/LatestStories'
import Newsletter from '@/components/newsletter/Newsletter'

export const revalidate = 60

const heroArticlesQuery = `*[_type == "post"] | order(publishedAt desc)[0..3] {
  _id,
  title,
  slug,
  excerpt,
  mainImage,
  publishedAt,
  isLive,
  "category": categories[0]->title,
  "categorySlug": categories[0]->slug.current,
  "categoryTranslations": categories[0]->nameTranslations,
  "author": author->name
}`

const latestArticlesQuery = `*[_type == "post"] | order(publishedAt desc)[4..9] {
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
  "categoryTranslations": categories[0]->nameTranslations,
  "author": author->name
}`

const trendingArticlesQuery = `*[_type == "post"] | order(views desc, publishedAt desc)[0..4] {
  _id,
  title,
  slug,
  mainImage,
  publishedAt,
  views
}`

const videoArticlesQuery = `*[_type == "post" && defined(videoUrl)] | order(publishedAt desc)[0..2] {
  _id,
  title,
  slug,
  mainImage,
  publishedAt
}`

type HomeCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
  sortOrder: number
  children: Array<{
    id: string
    name: string
    slug: string
    parentId: string | null
    sortOrder: number
  }>
}

async function getHomeData(lang: Locale) {
  try {
    const [heroArticles, latestArticles, trendingArticles, videoArticles] = await Promise.all([
      client.fetch(heroArticlesQuery),
      client.fetch(latestArticlesQuery),
      client.fetch(trendingArticlesQuery),
      client.fetch(videoArticlesQuery),
    ])

    let homeCategories: HomeCategory[] = []
    if (process.env.DATABASE_URL) {
      try {
        const flatCategories = await prisma.category.findMany({
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          select: {
            id: true,
            name: true,
            nameTranslations: true,
            slug: true,
            description: true,
            descriptionTranslations: true,
            parentId: true,
            sortOrder: true,
          },
        })

        const localizedCategories = flatCategories.map((category) => ({
          id: category.id,
          name: getLocalizedCategoryValue(category.name, category.nameTranslations, lang),
          slug: category.slug,
          description: getLocalizedOptionalCategoryValue(category.description, category.descriptionTranslations, lang),
          parentId: category.parentId,
          sortOrder: category.sortOrder,
          children: [] as HomeCategory['children'],
        }))

        const byId = new Map(localizedCategories.map((category) => [category.id, category]))
        const roots: HomeCategory[] = []

        for (const category of Array.from(byId.values())) {
          if (category.parentId && byId.has(category.parentId)) {
            byId.get(category.parentId)!.children.push({
              id: category.id,
              name: category.name,
              slug: category.slug,
              parentId: category.parentId,
              sortOrder: category.sortOrder,
            })
            continue
          }

          roots.push(category)
        }

        homeCategories = roots
      } catch (error) {
        console.error('Error fetching homepage categories:', error)
      }
    }

    return {
      heroArticles,
      latestArticles,
      trendingArticles,
      videoArticles,
      homeCategories,
    }
  } catch (error) {
    console.error('Error fetching home data:', error)
    return {
      heroArticles: [],
      latestArticles: [],
      trendingArticles: [],
      videoArticles: [],
      homeCategories: [] as HomeCategory[],
    }
  }
}

export default async function Home({
  params: _params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await _params
  const [dictionary, homeData] = await Promise.all([
    getDictionary(lang),
    getHomeData(lang),
  ])
  const {
    heroArticles,
    latestArticles,
    trendingArticles,
    videoArticles,
    homeCategories,
  } = homeData

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <HeroSection articles={heroArticles} lang={lang} dictionary={dictionary} />

      {homeCategories.length > 0 && (
        <section className="border-y border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <h2 className="mb-3 border-l-4 border-red-600 pl-4 text-3xl font-bold text-gray-900 dark:text-white">
              {dictionary.home.browseCategories}
            </h2>
            <p className="mb-8 text-gray-600 dark:text-gray-400">
              {dictionary.home.browseCategoriesDescription}
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {homeCategories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <Link
                    href={`/${lang}/category/${category.slug}`}
                    className="inline-flex items-center text-lg font-semibold text-gray-900 hover:text-red-600 dark:text-white"
                  >
                    {category.name}
                  </Link>
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    {category.description || dictionary.home.categoryFallbackDescription}
                  </p>
                  {category.children.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {category.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/${lang}/category/${child.slug}`}
                          className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700 hover:text-red-600 dark:border-gray-700 dark:text-gray-200"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="mb-8 border-l-4 border-red-600 pl-4 text-3xl font-bold text-gray-900 dark:text-white">
            {dictionary.home.latestStories}
          </h2>
          <LatestStories articles={latestArticles} lang={lang} dictionary={dictionary} />
        </div>
      </section>

      <TrendingStories articles={trendingArticles} lang={lang} dictionary={dictionary} />
      <VideoSection videos={videoArticles} lang={lang} dictionary={dictionary} />
      <Newsletter dictionary={dictionary} />
    </main>
  )
}
