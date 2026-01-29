import ArticleCard from '@/components/ArticleCard'
import { getDictionary } from '@/lib/get-dictionary'
import { Locale } from '@/lib/i18n-config'
import { client } from '@/lib/sanity/client'
import { allArticlesQuery } from '@/lib/sanity/queries'

// ISR: Revalidate every 60 seconds for fresh content without rebuilds
export const revalidate = 60

async function getArticles() {
  try {
    const articles = await client.fetch(allArticlesQuery)
    return articles
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

export default async function Home({
  params: { lang },
}: {
  params: { lang: Locale }
}) {
  const dictionary = await getDictionary(lang)
  const articles = await getArticles()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {dictionary.home.title}
        </h1>
        <p className="text-xl text-gray-600">{dictionary.home.description}</p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">No articles published yet.</p>
          <p className="text-gray-500">
            Visit <a href="/studio" className="text-blue-600 hover:underline">/studio</a> to create your first article.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article: any) => (
            <ArticleCard
              key={article._id}
              article={article}
              lang={lang}
            />
          ))}
        </div>
      )}
    </div>
  )
}
