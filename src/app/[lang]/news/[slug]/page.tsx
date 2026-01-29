import { client } from '@/lib/sanity/client'
import { articleBySlugQuery } from '@/sanity/queries/articleQueries'
import { urlFor } from '@/lib/sanity/client'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Locale } from '@/lib/i18n-config'

export const revalidate = 60 // Auto-update every 60 seconds

interface PageProps {
  params: {
    slug: string
    lang: Locale
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const article = await client.fetch(articleBySlugQuery, {
    slug: params.slug,
  })

  if (!article) return notFound()

  const imageUrl = article.mainImage 
    ? urlFor(article.mainImage).width(900).height(500).url()
    : null

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <p className="text-sm text-gray-500 mb-2">
        {article.categories?.[0]?.title || 'News'}
      </p>

      <h1 className="text-3xl font-bold mb-4">
        {article.title}
      </h1>

      <div className="flex items-center gap-4 mb-6">
        {article.author?.image && (
          <Image
            src={urlFor(article.author.image).width(40).height(40).url()}
            alt={article.author.name}
            width={40}
            height={40}
            className="rounded-full"
          />
        )}
        <div>
          <p className="text-sm font-semibold">{article.author?.name}</p>
          <p className="text-xs text-gray-400">
            {new Date(article.publishedAt).toDateString()}
          </p>
        </div>
      </div>

      {imageUrl && (
        <Image
          src={imageUrl}
          alt={article.title}
          width={900}
          height={500}
          className="rounded-lg mb-6 w-full h-auto"
          priority
        />
      )}

      <div className="prose prose-lg max-w-none">
        {article.body?.map((block: any, index: number) => {
          if (block._type === 'block') {
            return (
              <p key={index} className="mb-4 text-gray-800 leading-relaxed">
                {block.children?.map((child: any, childIndex: number) => {
                  if (child.marks?.includes('strong')) {
                    return <strong key={childIndex}>{child.text}</strong>
                  }
                  if (child.marks?.includes('em')) {
                    return <em key={childIndex}>{child.text}</em>
                  }
                  return <span key={childIndex}>{child.text}</span>
                })}
              </p>
            )
          }
          return null
        })}
      </div>

      {article.excerpt && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border-l-4 border-red-600">
          <p className="text-gray-700 italic">{article.excerpt}</p>
        </div>
      )}
    </article>
  )
}
