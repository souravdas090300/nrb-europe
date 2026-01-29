import { client } from '@/lib/sanity/client'
import { articleBySlugQuery, relatedArticlesQuery } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/client'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Define the Portable Text components for rendering
const portableTextComponents = {
  types: {
    image: ({ value }: any) => {
      const imageUrl = urlFor(value).width(800).url()
      return (
        <div className="my-8">
          <Image
            src={imageUrl}
            alt={value.alt || 'Article image'}
            width={800}
            height={500}
            className="rounded-lg"
          />
          {value.caption && (
            <p className="text-sm text-gray-600 text-center mt-2">
              {value.caption}
            </p>
          )}
        </div>
      )
    },
    youtubeEmbed: ({ value }: any) => {
      // Extract YouTube video ID from URL
      const videoId = value.url.split('v=')[1]?.split('&')[0]
      return (
        <div className="my-8 aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            className="w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )
    }
  },
  block: {
    h2: ({ children }: any) => <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>,
    normal: ({ children }: any) => <p className="my-4 leading-relaxed">{children}</p>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-red-600 pl-4 my-6 italic text-gray-700">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }: any) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined
      return (
        <a href={value.href} rel={rel} className="text-red-600 hover:underline">
          {children}
        </a>
      )
    },
  },
}

// Generate static params for all articles
export async function generateStaticParams() {
  const articles = await client.fetch(`*[_type == "post"]{ "slug": slug.current }`)
  return articles.map((article: any) => ({
    slug: article.slug,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await client.fetch(articleBySlugQuery, { slug: params.slug })
  
  if (!article) {
    return {
      title: 'Article Not Found - NRB Europe',
      description: 'The requested article could not be found.',
    }
  }

  return {
    title: article.seo?.title || `${article.title} - NRB Europe`,
    description: article.seo?.description || article.excerpt,
    keywords: article.seo?.keywords || [],
    authors: [{ name: article.author }],
    openGraph: {
      title: article.seo?.title || article.title,
      description: article.seo?.description || article.excerpt,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author],
      images: article.featuredImage ? [
        {
          url: urlFor(article.featuredImage).width(1200).url(),
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.seo?.title || article.title,
      description: article.seo?.description || article.excerpt,
      images: article.featuredImage ? [urlFor(article.featuredImage).width(1200).url()] : [],
    },
  }
}

// Add revalidation for ISR (Incremental Static Regeneration)
export const revalidate = 60 // Revalidate every 60 seconds for breaking news

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await client.fetch(articleBySlugQuery, { slug: params.slug })
  
  if (!article) {
    notFound()
  }

  // Fetch related articles (same category)
  const relatedArticles = await client.fetch(relatedArticlesQuery, {
    category: article.category,
    currentSlug: article.slug.current,
  })

  // Generate JSON-LD structured data for Google News
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    image: article.featuredImage ? [urlFor(article.featuredImage).width(1200).url()] : [],
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.author,
      image: article.authorImage ? urlFor(article.authorImage).width(100).url() : undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: 'NRB Europe',
      logo: {
        '@type': 'ImageObject',
        url: 'https://nrbeurope.com/logo.png', // Update with your actual logo URL
      },
    },
  }

  return (
    <>
      {/* Add structured data to head */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-4xl mx-auto px-6 py-10">
        {/* Category and Date */}
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <Link
            href={`/category/${article.category.toLowerCase()}`}
            className="bg-red-600 text-white px-3 py-1 rounded-full hover:bg-red-700 transition"
          >
            {article.category}
          </Link>
          <span className="mx-4">•</span>
          <time dateTime={article.publishedAt}>
            {new Date(article.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </time>
          {article.isBreaking && (
            <span className="ml-4 bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">
              🔴 BREAKING
            </span>
          )}
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          {article.title}
        </h1>

        {/* Subheadline */}
        {article.subheadline && (
          <p className="text-xl text-gray-600 mb-8">
            {article.subheadline}
          </p>
        )}

        {/* Author Info */}
        <div className="flex items-center mb-10 border-b pb-8">
          {article.authorImage && (
            <div className="relative w-12 h-12 mr-4">
              <Image
                src={urlFor(article.authorImage).width(100).url()}
                alt={article.author}
                fill
                className="rounded-full object-cover"
              />
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{article.author}</p>
            {article.authorBio && (
              <p className="text-sm text-gray-600 mt-1">{article.authorBio}</p>
            )}
          </div>
        </div>

        {/* Featured Image */}
        {article.featuredImage && (
          <div className="mb-10">
            <div className="relative w-full h-[500px] rounded-xl overflow-hidden">
              <Image
                src={urlFor(article.featuredImage).width(1200).url()}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            {article.featuredImage.caption && (
              <p className="text-sm text-gray-600 text-center mt-2">
                {article.featuredImage.caption}
                {article.featuredImage.attribution && (
                  <span className="ml-2 text-gray-500">
                    | {article.featuredImage.attribution}
                  </span>
                )}
              </p>
            )}
          </div>
        )}

        {/* Article Body */}
        <div className="prose prose-lg max-w-none mb-12">
          <PortableText
            value={article.body}
            components={portableTextComponents}
          />
        </div>

        {/* Share Buttons */}
        <div className="border-t border-b py-6 mb-10">
          <p className="text-gray-700 mb-4">Share this article:</p>
          <div className="flex gap-4">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(`https://nrbeurope.com/article/${article.slug.current}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://nrbeurope.com/article/${article.slug.current}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
            >
              Facebook
            </a>
            <a
              href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`https://nrbeurope.com/article/${article.slug.current}`)}&title=${encodeURIComponent(article.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900 transition"
            >
              LinkedIn
            </a>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedArticles.slice(0, 4).map((related: any) => (
                <Link
                  key={related._id}
                  href={`/article/${related.slug.current}`}
                  className="block border rounded-lg p-4 hover:shadow-lg transition"
                >
                  <h3 className="font-bold text-lg mb-2">{related.title}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(related.publishedAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  )
}
