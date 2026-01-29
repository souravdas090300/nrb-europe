import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const articleId = searchParams.get('articleId')
    
    if (!articleId) {
      return NextResponse.json(
        { error: 'articleId required' },
        { status: 400 }
      )
    }
    
    // Fetch live updates from Sanity
    // This assumes you have a liveUpdate schema type
    const updates = await client.fetch(`
      *[_type == "liveUpdate" && liveBlog._ref == $articleId] | order(time desc) {
        _id,
        time,
        content,
        isImportant
      }
    `, { articleId })
    
    return NextResponse.json(updates, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
    
  } catch (error) {
    console.error('Live updates error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch updates' },
      { status: 500 }
    )
  }
}
