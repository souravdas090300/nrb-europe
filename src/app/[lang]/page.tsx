import { getDictionary } from '@/lib/get-dictionary'
import { Locale } from '@/lib/i18n-config'
import { client } from '@/lib/sanity/client'
import HeroSection from '@/components/HeroSection'
import CategoryGrid from '@/components/CategoryGrid'
import TrendingStories from '@/components/TrendingStories'
import VideoSection from '@/components/VideoSection'
import LatestStories from '@/components/LatestStories'
import Newsletter from '@/components/Newsletter'

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
  body,
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

const categoryArticlesQuery = (categorySlug: string) => `*[_type == "post" && references(*[_type=="category" && slug.current=="${categorySlug}"]._id)] | order(publishedAt desc)[0..3] {
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
    const [heroArticles, latestArticles, worldArticles, politicsArticles, businessArticles, trendingArticles, videoArticles] = await Promise.all([
      client.fetch(heroArticlesQuery),
      client.fetch(latestArticlesQuery),
      client.fetch(categoryArticlesQuery('world')),
      client.fetch(categoryArticlesQuery('politics')),
      client.fetch(categoryArticlesQuery('business')),
      client.fetch(trendingArticlesQuery),
      client.fetch(videoArticlesQuery),
    ])
    
    return {
      heroArticles,
      latestArticles,
      worldArticles,
      politicsArticles,
      businessArticles,
      trendingArticles,
      videoArticles
    }
  } catch (error) {
    console.error('Error fetching home data:', error)
    return {
      heroArticles: [],
      latestArticles: [],
      worldArticles: [],
      politicsArticles: [],
      businessArticles: [],
      trendingArticles: [],
      videoArticles: []
    }
  }
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang)
  const {
    heroArticles,
    latestArticles,
    worldArticles,
    politicsArticles,
    businessArticles,
    trendingArticles,
    videoArticles
  } = await getHomeData()

  const [mainArticle, ...sideArticles] = heroArticles

  return (
    <main className="min-h-screen bg-white">
      {/* CNN-Style Hero Section */}
      <HeroSection />
      
      {/* Category Grid */}
      <CategoryGrid />
      
      {/* Latest Stories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 border-l-4 border-red-600 pl-4">
          Latest Stories
        </h2>
        <LatestStories />
      </div>
      
      {/* Trending Stories */}
      <TrendingStories />
      
      {/* Video Section */}
      <VideoSection />
      
      {/* Newsletter */}
      <Newsletter />

      {/* Empty State - Show if no articles */}
      {heroArticles.length === 0 && (
        <div className="text-center py-20 max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">No articles published yet</h2>
          <p className="text-gray-600 mb-6 text-lg">
            Visit the Sanity Studio to create your first article
          </p>
          <a
            href="/studio"
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-lg inline-block transition"
          >
            Go to Studio
          </a>
        </div>
      )}
    </main>
  )
}
