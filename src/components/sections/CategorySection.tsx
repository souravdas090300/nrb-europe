'use client'

import { useEffect, useState } from 'react'
import { client, urlFor } from '@/lib/sanity/client'
import Link from 'next/link'

interface Props {
  category: string
}

interface Post {
  title: string
  slug: { current: string }
  mainImage: any
  publishedAt: string
  description?: string
}

export default function CategorySection({ category }: Props) {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    client.fetch(
      `
      *[_type == "post" && references(*[_type=="category" && title==$category]._id)] | order(publishedAt desc)[0..3] {
        title,
        slug,
        mainImage,
        publishedAt,
        description
      }
    `,
      { category }
    ).then(setPosts)
  }, [category])

  if (!posts.length) return null

  return (
    <section className="container mx-auto px-4 py-8 border-t">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{category}</h2>
        <Link
          href={`/en/category/${category.toLowerCase()}`}
          className="text-blue-600 hover:text-blue-800 transition flex items-center"
        >
          View All
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {posts.map((post) => (
          <Link key={post.slug.current} href={`/en/news/${post.slug.current}`} className="block group">
            <div className="overflow-hidden rounded-lg">
              {post.mainImage && (
                <img
                  src={urlFor(post.mainImage).width(400).height(250).url()}
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                />
              )}
            </div>
            <h3 className="font-semibold mt-3 group-hover:text-blue-600 transition line-clamp-2">
              {post.title}
            </h3>
            {post.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.description}</p>
            )}
            <span className="text-sm text-gray-500 mt-2 block">
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
