import { getDictionary } from '@/lib/get-dictionary'
import { Locale } from '@/lib/i18n-config'
import { client } from '@/lib/sanity/client'
import HeroSection from '@/components/home/HeroSection'
import LatestNews from '@/components/home/LatestNews'
import CategorySection from '@/components/home/CategorySection'
import Sidebar from '@/components/layout/Sidebar'

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
    <main className="bg-white">
      <div className="cnn-container py-6">
        {/* Hero Section */}
        {mainArticle && (
          <HeroSection
            lang={lang}
            mainArticle={mainArticle}
            sideArticles={sideArticles}
          />
        )}

        {/* Main Content Grid: Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Latest News */}
            {latestArticles.length > 0 && (
              <LatestNews lang={lang} articles={latestArticles} />
            )}

            {/* World News Section */}
            {worldArticles.length > 0 && (
              <CategorySection
                lang={lang}
                categoryName="World"
                categorySlug="world"
                articles={worldArticles}
              />
            )}

            {/* Politics Section */}
            {politicsArticles.length > 0 && (
              <CategorySection
                lang={lang}
                categoryName="Politics"
                categorySlug="politics"
                articles={politicsArticles}
              />
            )}

            {/* Business Section */}
            {businessArticles.length > 0 && (
              <CategorySection
                lang={lang}
                categoryName="Business"
                categorySlug="business"
                articles={businessArticles}
              />
            )}
          </div>

          {/* Sidebar - 1/3 width */}
          <div>
            <Sidebar
              lang={lang}
              trendingArticles={trendingArticles}
              mostReadArticles={latestArticles.slice(0, 5)}
              videoArticles={videoArticles}
            />
          </div>
        </div>

        {/* Empty State */}
        {heroArticles.length === 0 && latestArticles.length === 0 && (
          <div className="text-center py-20">
            <h2 className="headline-2xl text-cnn-text mb-4">No articles published yet</h2>
            <p className="text-cnn-gray mb-6">
              Visit the Sanity Studio to create your first article
            </p>
            <a
              href="/studio"
              className="cnn-button-primary inline-block"
            >
              Go to Studio
            </a>
          </div>
        )}
      </div>
    </main>
  )
}
