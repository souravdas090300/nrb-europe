import type { Metadata } from 'next'
import { client } from '@/lib/sanity/client'
import { categoryBySlugQuery } from '@/lib/sanity/queries'

export async function generateCategoryStaticParams() {
  const categories = await client.fetch(`*[_type == "category"]{ "slug": slug.current }`)
  return categories.map((category: any) => ({
    slug: category.slug,
  }))
}

export async function generateCategoryMetadata(slug: string): Promise<Metadata> {
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
}

export async function getCategoryBySlug(slug: string) {
  return client.fetch(categoryBySlugQuery, { slug })
}

export async function getCategoryArticles(slug: string) {
  return client.fetch(
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
}
