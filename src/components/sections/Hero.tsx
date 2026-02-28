'use client'

import { useEffect, useState } from 'react'
import { client, urlFor } from '@/lib/sanity/client'
import Link from 'next/link'

interface Post {
  title: string
  slug: { current: string }
  mainImage: any
  description: string
  categories?: { title: string }[]
}

export default function Hero() {
  const [featured, setFeatured] = useState<Post[]>([])

  useEffect(() => {
    client.fetch(`
      *[_type == "post" && isFeatured == true] | order(publishedAt desc)[0..2] {
        title,
        slug,
        mainImage,
        description,
        categories[]->{title}
      }
    `).then(setFeatured)
  }, [])

  if (!featured.length) return null

  const main = featured[0]
  const others = featured.slice(1)

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main feature */}
        <div className="md:col-span-2">
          <Link href={`/en/news/${main.slug.current}`} className="block group">
            <div className="relative overflow-hidden rounded-lg">
              {main.mainImage && (
                <img
                  src={urlFor(main.mainImage).width(800).height(450).url()}
                  alt={main.title}
                  className="w-full h-96 object-cover group-hover:scale-105 transition duration-300"
                />
              )}
            </div>
            <h2 className="text-3xl font-bold mt-4 group-hover:text-blue-600 transition">
              {main.title}
            </h2>
            <p className="text-gray-600 mt-2">{main.description}</p>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <span>{main.categories?.[0]?.title}</span>
              <span className="mx-2">•</span>
              <span>Featured Story</span>
            </div>
          </Link>
        </div>

        {/* Secondary features */}
        <div className="space-y-6">
          {others.map((post) => (
            <Link key={post.slug.current} href={`/en/news/${post.slug.current}`} className="flex space-x-4 group">
              {post.mainImage && (
                <img
                  src={urlFor(post.mainImage).width(150).height(100).url()}
                  alt={post.title}
                  className="w-24 h-24 object-cover rounded group-hover:opacity-90 transition"
                />
              )}
              <div>
                <h3 className="font-semibold group-hover:text-blue-600 transition line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{post.categories?.[0]?.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
