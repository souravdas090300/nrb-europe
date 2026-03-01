import type { Metadata } from 'next'
import { client } from '@/lib/sanity/client'
import { categoryBySlugQuery } from '@/lib/sanity/queries'
import { categories as knownCategories } from '@/lib/constants'

export async function generateCategoryStaticParams() {
  const sanityCategories = await client.fetch(`*[_type == "category"]{ "slug": slug.current }`)
  // Merge Sanity categories with known constants to ensure all pages are generated
  const seen = new Set<string>(sanityCategories.map((c: any) => c.slug))
  const merged = [...sanityCategories]
  for (const c of knownCategories) {
    if (!seen.has(c.slug)) {
      merged.push({ slug: c.slug })
    }
  }
  return merged.map((category: any) => ({
    slug: category.slug,
  }))
}

export async function generateCategoryMetadata(slug: string): Promise<Metadata> {
  const category = await client.fetch(categoryBySlugQuery, { slug })

  if (!category) {
    // Fallback to known category from constants
    const known = knownCategories.find((c) => c.slug === slug)
    if (known) {
      return {
        title: `${known.name} News - NRB Europe`,
        description: `Latest ${known.name} news for NRBs in Europe`,
      }
    }
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
