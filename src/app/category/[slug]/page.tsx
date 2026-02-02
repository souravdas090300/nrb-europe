import { client } from '@/lib/sanity/client'
import { categoryBySlugQuery } from '@/lib/sanity/queries'
import NewsCard from '@/components/ui/NewsCard'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'

// Generate static params
export async function generateStaticParams() {
  const categories = await client.fetch(`*[_type == "category"]{ "slug": slug.current }`)
  return categories.map((category: any) => ({
    slug: category.slug,
  }))
}

// Generate metadata
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
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
      isLive,
      body,
      "category": categories[0]->title,
      "categorySlug": categories[0]->slug.current,
      "author": author->name
    }`,
    { slug: params.slug }
  )

  return (
    <div className="cnn-container py-8">
      {/* Category Header */}
      <div className="mb-8">
        <h1 className="headline-3xl text-cnn-text mb-2">{category.title}</h1>
        {category.description && (
          <p className="text-lg text-cnn-gray">{category.description}</p>
        )}
        <div className="h-1 w-20 bg-cnn-red mt-4"></div>
      </div>

      {/* Articles Grid */}
      <div className="cnn-grid-3 gap-6">
        {articles.length === 0 ? (
          <div className="col-span-full cnn-card text-center py-20">
            <p className="text-cnn-text text-lg">No articles found in this category yet.</p>
          </div>
        ) : (
          articles.map((article: any) => (
            <NewsCard key={article._id} article={article} variant="default" />
          ))
        )}
      </div>
    </div>
  )
}
