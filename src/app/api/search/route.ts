import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'
import * as Sentry from '@sentry/nextjs'
import { cached } from '@/lib/redis'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || ''

  if (!query || query.length < 2) {
    return NextResponse.json([])
  }

  try {
    const articles = await cached(
      `search:${query.toLowerCase()}`,
      () => client.fetch(
        `*[_type == "post" && (
          title match $searchQuery ||
          excerpt match $searchQuery
        )] | order(publishedAt desc)[0...20] {
          _id,
          title,
          slug,
          excerpt,
          mainImage,
          publishedAt,
          "category": categories[0]->title,
          "author": author->name
        }`,
        { searchQuery: `*${query}*` }
      ),
      300, // 5 min TTL
    )

    return NextResponse.json(articles)
  } catch (error) {
    Sentry.captureException(error)
    console.error('Search API error:', error)
    return NextResponse.json([], { status: 500 })
  }
}
