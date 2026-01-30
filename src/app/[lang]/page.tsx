import ArticleCard from '@/components/ArticleCard'
import BreakingNews from '@/components/BreakingNews'
import { getDictionary } from '@/lib/get-dictionary'
import { Locale } from '@/lib/i18n-config'
import { client, urlFor } from '@/lib/sanity/client'
import Image from 'next/image'
import Link from 'next/link'

// ISR: Revalidate every 60 seconds for fresh content without rebuilds
export const revalidate = 60

// GROQ Queries
const topStoryQuery = `*[_type == "post" && isFeatured == true] | order(publishedAt desc)[0] {
  _id,
  title,
  slug,
  excerpt,
  mainImage,
  publishedAt,
  "category": categories[0]->title,
  "categorySlug": categories[0]->slug.current,
  "author": author->name
}`

const latestArticlesQuery = `*[_type == "post"] | order(publishedAt desc)[1..10] {
  _id,
  title,
  slug,
  excerpt,
  mainImage,
  publishedAt,
  isBreaking,
  "category": categories[0]->title,
  "categorySlug": categories[0]->slug.current,
  "author": author->name
}`

const breakingNewsQuery = `*[_type == "post" && isBreaking == true] | order(publishedAt desc)[0..4] {
  title,
  slug
}`

async function getHomeData() {
  try {
    const [topStory, latestArticles, breakingNews] = await Promise.all([
      client.fetch(topStoryQuery),
      client.fetch(latestArticlesQuery),
      client.fetch(breakingNewsQuery),
    ])
    return { topStory, latestArticles, breakingNews }
  } catch (error) {
    console.error('Error fetching home data:', error)
    return { topStory: null, latestArticles: [], breakingNews: [] }
  }
}

export default async function Home({
  params: { lang },
}: {
  params: { lang: Locale }
}) {
  const dictionary = await getDictionary(lang)
  const { topStory, latestArticles, breakingNews } = await getHomeData()

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breaking News Ticker */}
      {breakingNews.length > 0 && (
        <BreakingNews items={breakingNews} lang={lang} />
      )}

      {/* Hero / Top Story Section */}
      {topStory && (
        <section className="mt-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Hero Story */}
            <Link href={`/${lang}/news/${topStory.slug.current}`} className="block group">
              <div className="relative h-96 rounded-lg overflow-hidden">
                {topStory.mainImage && (
                  <Image
                    src={urlFor(topStory.mainImage).width(800).height(600).url()}
                    alt={topStory.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    priority
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  {topStory.category && (
                    <span className="inline-block bg-red-600 px-3 py-1 text-xs font-bold uppercase mb-3 rounded">
                      {topStory.category}
                    </span>
                  )}
                  <h2 className="text-3xl md:text-4xl font-bold mb-2 line-clamp-3">
                    {topStory.title}
                  </h2>
                  {topStory.excerpt && (
                    <p className="text-gray-200 line-clamp-2">{topStory.excerpt}</p>
                  )}
                </div>
              </div>
            </Link>

            {/* Side Stories */}
            <div className="flex flex-col gap-4">
              {latestArticles.slice(0, 3).map((article: any) => (
                <Link
                  key={article._id}
                  href={`/${lang}/news/${article.slug.current}`}
                  className="flex gap-4 bg-white rounded-lg overflow-hidden hover:shadow-lg transition group"
                >
                  {article.mainImage && (
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <Image
                        src={urlFor(article.mainImage).width(200).height(200).url()}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-4">
                    {article.category && (
                      <span className="text-xs text-red-600 font-semibold uppercase">
                        {article.category}
                      </span>
                    )}
                    <h3 className="font-bold text-lg mb-1 line-clamp-2 group-hover:text-red-600 transition">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section Header */}
      <div className="border-b-4 border-red-600 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 pb-2">Latest News</h2>
      </div>

      {/* Latest Articles Grid */}
      {latestArticles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">No articles published yet.</p>
          <p className="text-gray-500">
            Visit <a href="/studio" className="text-blue-600 hover:underline">/studio</a> to create your first article.
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {latestArticles.map((article: any) => (
            <ArticleCard
              key={article._id}
              article={article}
              lang={lang}
            />
          ))}
        </section>
      )}
    </main>
  )
}
            />
          ))}
        </div>
      )}
    </div>
  )
}
