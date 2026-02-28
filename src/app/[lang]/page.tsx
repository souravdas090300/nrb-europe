import { Locale } from '@/lib/i18n-config'
import { getDictionary } from '@/lib/get-dictionary'
import { client } from '@/lib/sanity/client'
import HeroSection from '@/components/sections/HeroSection'
import TrendingStories from '@/components/sections/TrendingStories'
import VideoSection from '@/components/sections/VideoSection'
import LatestStories from '@/components/sections/LatestStories'
import Newsletter from '@/components/newsletter/Newsletter'

// ISR: Revalidate every 60 seconds for fresh content
export const revalidate = 60

// GROQ Queries
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

async function getHomeData() {
  try {
    const [heroArticles, latestArticles, trendingArticles, videoArticles] = await Promise.all([
      client.fetch(heroArticlesQuery),
      client.fetch(latestArticlesQuery),
      client.fetch(trendingArticlesQuery),
      client.fetch(videoArticlesQuery),
    ])

    return {
      heroArticles,
      latestArticles,
      trendingArticles,
      videoArticles
    }
  } catch (error) {
    console.error('Error fetching home data:', error)
    return {
      heroArticles: [],
      latestArticles: [],
      trendingArticles: [],
      videoArticles: []
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
    getHomeData(),
  ])
  const {
    heroArticles,
    latestArticles,
    trendingArticles,
    videoArticles
  } = homeData

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section — featured stories at the top */}
      <HeroSection articles={heroArticles} lang={lang} dictionary={dictionary} />

      {/* Latest Stories Grid */}
      <section className="bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 border-l-4 border-red-600 pl-4">
            {dictionary.home.latestStories}
          </h2>
          <LatestStories articles={latestArticles} lang={lang} dictionary={dictionary} />
        </div>
      </section>

      {/* Trending Stories */}
      <TrendingStories articles={trendingArticles} lang={lang} dictionary={dictionary} />

      {/* Video Section */}
      <VideoSection videos={videoArticles} lang={lang} dictionary={dictionary} />

      {/* Newsletter */}
      <Newsletter dictionary={dictionary} />
    </main>
  )
}
