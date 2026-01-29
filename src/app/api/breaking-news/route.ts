import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'

export const revalidate = 10 // Revalidate every 10 seconds

export async function GET() {
  try {
    const breakingNews = await client.fetch(`
      *[_type == "post" && isBreaking == true] | order(publishedAt desc)[0...10] {
        _id,
        title,
        slug,
        publishedAt,
        "category": categories[0]->title
      }
    `)

    return NextResponse.json(breakingNews)
  } catch (error) {
    console.error('Breaking news API error:', error)
    return NextResponse.json([], { status: 500 })
  }
}
