import { client } from '@/lib/sanity/client'
import { articlesByCategoryQuery, categoryBySlugQuery, trendingArticlesQuery } from '@/lib/sanity/queries'
import ArticleCard from '@/components/ArticleCard'
import { notFound } from 'next/navigation'
import Link from 'next/link'

// Generate static params
export async function generateStaticParams() {
  const categories = await client.fetch(`*[_type == "category"]{ "slug": slug.current }`)
  return categories.map((category: any) => ({
    slug: category.slug,
  }))
}

// Generate metadata
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = await client.fetch(categoryBySlugQuery, { slug: params.slug })
  
  if (!category) {
    return {
      title: 'Category Not Found - NRB Europe',
    }
  }

  return {
    title: `${category.title} News - NRB Europe`,
    description: category.description || `Latest ${category.title} news for NRBs in Europe`,
  }
}

export const revalidate = 60 // Revalidate every minute

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await client.fetch(categoryBySlugQuery, { slug: params.slug })
  
  if (!category) {
    notFound()
  }

  // Fetch articles that reference this category
  const articles = await client.fetch(
    `*[_type == "post" && references(*[_type == "category" && slug.current == $slug][0]._id)] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      mainImage,
      publishedAt,
      isBreaking,
      "category": categories[0]->title,
      "categoryColor": categories[0]->color,
      "author": author->name
    }`,
    { slug: params.slug }
  )

  // Get trending articles for sidebar
  const trendingArticles = await client.fetch(trendingArticlesQuery)

  // Get color class based on category color
  const getColorClass = (color: string) => {
    const colors: { [key: string]: string } = {
      red: 'bg-red-600',
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      purple: 'bg-purple-600',
      orange: 'bg-orange-600',
      gray: 'bg-gray-600'
    }
    return colors[color] || 'bg-red-600'
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Category Header */}
      <div className={`${getColorClass(category.color)} text-white p-6 rounded-lg mb-8`}>
        <h1 className="text-4xl font-bold mb-2">{category.title}</h1>
        {category.description && (
          <p className="text-xl opacity-90">{category.description}</p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Articles */}
        <div className="lg:w-2/3">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Latest {category.title} News</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {articles.length === 0 ? (
                <div className="col-span-2 text-center py-10">
                  <p className="text-gray-600">No articles found in this category yet.</p>
                </div>
              ) : (
                articles.map((article: any) => (
                  <ArticleCard key={article._id} article={article} />
                ))
              )}
            </div>
          </div>

          {/* Breaking News Section */}
          {articles.filter((a: any) => a.isBreaking).length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <span className="bg-red-600 text-white px-3 py-1 rounded mr-2">BREAKING</span>
                Breaking News in {category.title}
              </h3>
              <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
                {articles
                  .filter((a: any) => a.isBreaking)
                  .map((article: any) => (
                    <div key={article._id} className="mb-4 last:mb-0">
                      <h4 className="font-bold text-lg">
                        <Link href={`/article/${article.slug.current}`} className="hover:text-red-600">
                          {article.title}
                        </Link>
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(article.publishedAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/3">
          {/* Trending Now */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-xl font-bold mb-4 border-b pb-2">Trending Now</h3>
            <div className="space-y-4">
              {trendingArticles.map((article: any, index: number) => (
                <div key={article._id} className="flex items-start">
                  <span className="text-2xl font-bold text-gray-300 mr-3">{index + 1}</span>
                  <div>
                    <h4 className="font-semibold hover:text-red-600">
                      <Link href={`/article/${article.slug.current}`}>
                        {article.title}
                      </Link>
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {article.category} • {new Date(article.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Categories */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4 border-b pb-2">All Categories</h3>
            <div className="space-y-2">
              <Link
                href="/category/politics"
                className={`block px-4 py-2 rounded hover:bg-gray-100 ${params.slug === 'politics' ? 'bg-red-50 text-red-600 font-semibold' : ''}`}
              >
                Politics
              </Link>
              <Link
                href="/category/immigration"
                className={`block px-4 py-2 rounded hover:bg-gray-100 ${params.slug === 'immigration' ? 'bg-red-50 text-red-600 font-semibold' : ''}`}
              >
                Immigration
              </Link>
              <Link
                href="/category/jobs"
                className={`block px-4 py-2 rounded hover:bg-gray-100 ${params.slug === 'jobs' ? 'bg-red-50 text-red-600 font-semibold' : ''}`}
              >
                Jobs
              </Link>
              <Link
                href="/category/business"
                className={`block px-4 py-2 rounded hover:bg-gray-100 ${params.slug === 'business' ? 'bg-red-50 text-red-600 font-semibold' : ''}`}
              >
                Business
              </Link>
              <Link
                href="/category/lifestyle"
                className={`block px-4 py-2 rounded hover:bg-gray-100 ${params.slug === 'lifestyle' ? 'bg-red-50 text-red-600 font-semibold' : ''}`}
              >
                Lifestyle
              </Link>
              <Link
                href="/category/europe"
                className={`block px-4 py-2 rounded hover:bg-gray-100 ${params.slug === 'europe' ? 'bg-red-50 text-red-600 font-semibold' : ''}`}
              >
                Europe
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
